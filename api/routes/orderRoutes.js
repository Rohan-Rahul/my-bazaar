const express = require('express');
const Order = require('../models/Order');
const {verifyToken,verifyAdmin} = require('../middleware/auth');
const router = express.Router();

//create new order
router.post('/',verifyToken,async(req,res)=>{
  const newOrder = new Order({
    ...req.body,
    user: req.user.id
  });

  try{
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch(error){
    res.status(500).json({
      message: 'Error creating order',
      error: error.message
    });
  }
});

//get user orders
router.get('/find', verifyToken, async(req,res)=>{
  try{
    const orders = await Order.find({
      user: req.user.id
    });
    res.status(200).json(orders);
  } catch (error){
    res.status(500).json({
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

//get all order (admin only)]
router.get('/',verifyAdmin, async (req,res)=>{
  try{
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch(error){
    res.status(500).json({
      message: 'Error fetching all orders',
      error: error.message
    });
  }
});

module.exports = router;