const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');
const sendOrderEmail = require('../utils/emailService');
const generateInvoiceBuffer = require('../utils/invoiceGenerator');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- CUSTOMER ROUTES ---

// get user specific orders
router.get('/myorders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// get invoice for a specific order
router.get('/:id/invoice', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    const pdfBuffer = await generateInvoiceBuffer(order, order.paymentId || order._id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice_${order._id}.pdf`,
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Error generating invoice', error: error.message });
  }
});

// create razorpay order
router.post('/razorpay-order', verifyToken, async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };
  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Razorpay order creation failed' });
  }
});

// verify payment and finalize order
router.post('/verify', verifyToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign.toString()).digest('hex');

  if (razorpay_signature !== expectedSign) return res.status(400).json({ message: 'Invalid payment signature' });

  try {
    for (const item of orderData.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const newOrder = new Order({
      user: req.user.id,
      ...orderData,
      isPaid: true,
      paidAt: Date.now(),
      paymentId: razorpay_payment_id,
      status: 'Processing'
    });

    const savedOrder = await newOrder.save();
    await Cart.findOneAndUpdate({ user: req.user.id }, { cartItems: [] });
    const fullUser = await User.findById(req.user.id);

    if (fullUser && fullUser.email) {
      try {
        const pdfBuffer = await generateInvoiceBuffer(orderData, razorpay_order_id);
        sendOrderEmail(fullUser.email, savedOrder, pdfBuffer);
      } catch (err) { console.error('Email error:', err); }
    }
    res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Order finalization failed', error: error.message });
  }
});

// --- ADMIN ROUTES ---

// get all orders
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders', error: error.message });
  }
});

// update order status
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user', 'name email');
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
});

module.exports = router;