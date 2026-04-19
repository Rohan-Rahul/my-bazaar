const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// [Admin] Get all coupons
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

// [Admin] Create a new coupon
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, usageLimit } = req.body;
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate,
      usageLimit
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon' });
  }
});

// [Admin] Delete a coupon
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon' });
  }
});

// [Public/User] Validate a coupon (for Checkout)
router.post('/validate', verifyToken, async (req, res) => {
  const { code } = req.body;
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });
    if (new Date() > coupon.expiryDate) return res.status(400).json({ message: 'Coupon expired' });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Limit reached' });

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Validation error' });
  }
});

module.exports = router;