const express = require('express');
const Product = require('../models/Product');
const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// get all products
router.get('/', async (req, res) => {
  try {
    const { category, isSeasonal } = req.query;
    let query = {};
    if (category) query.category = category;
    if (isSeasonal) query.isSeasonal = isSeasonal === 'true';

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found' 
      });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// create a new product (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating product',
      error: error.message
    });
  }
});

module.exports = router;