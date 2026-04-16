const express = require('express');
const Cart = require('../models/Cart');
const {verifyToken} = require('../middleware/auth');
const router =  express.Router();

//get user cart
router.get('/', verifyToken, async(req,res)=>{
  try{
    const cart = await Cart.findOne({
      user: req.user.id
    }).populate('cartItems.product');
    res.status(200).json(cart);
  } catch(error){
    res.status(500).json({
      message: 'Error fetching cart',
      error: error.message
    });
  }
});

//add to cart or update quantity
router.post('/', verifyToken, async(req,res)=>{
  const {product, quantity} = req.body;

  try{
    let cart = await Cart.findOne({
      user: req.user.id
    });

    if(cart){
      //cart exists
      const itemIndex = cart.cartItems.findIndex(p => p.product.toString() === product);

      if (itemIndex > -1) {
        //product exists in cart, update quantity
        cart.cartItems[itemIndex].quantity += quantity;
      } else {
        //product doesn't exist, add new item
        cart.cartItems.push({
          product,quantity
        });
      }
      cart = await cart.save();
      return res.status(200).json(cart);
    } else {
      //no cart exist for user, create a new one
      const newCart =  await Cart.create({
        user: req.user.id,
        cartItems: [{
          product,quantity
        }]
      });
      return res.status(201).json(newCart);
    }
  } catch (error){
    res.status(500).json({
      message: 'Error udpdating cart',
      error: error.message
    });
  }
});

//remove specific item from cart
router.delete('/:productId', verifyToken, async(req,res)=>{
  try{
    let cart = await Cart.findOne({
      user: req.user.id
    });
    if(cart){
      cart.cartItems = cart.cartItems.filter(
        (item)=> item.product.toString() !== req.params.productId
      );
      cart = await cart.save();
      return res.status(200).json(cart);
    }
    res.status(404).json({
      message: 'Cart not found'
    });
  } catch(error){
    res.status(500).json({
      message: 'Error removing item',
      error: error.message
    });
  }
});

//clear entire cart
router.delete('/', verifyToken, async(req,res)=>{
  try{
    let cart = await Cart.findOne({
      user: req.user.id
    });
    if(cart){
      cart.cartItems = [];
      cart = await cart.save();
      return res.status(200).json({
        message: 'Cart cleared successfully', cart
      });
    }
    res.status(404).json({
      message: 'Cart not found'
    });
  } catch (error){
    res.status(500).json({
      message: 'Error clearing cart', 
      error: error.message
    });
  }
});

module.exports = router;