const express = require('express');
const Product = require('../models/Product');
const { verifyAdmin } = require('../middleware/auth');
const upload = require('../config/cloudinary');
const router = express.Router();

// get all products
router.get('/', async (req, res) => {
  try {
    const { category, isSeasonal, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (isSeasonal) query.isSeasonal = isSeasonal === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// create product
router.post('/', verifyAdmin, upload.fields([
  { name: 'generalImages', maxCount: 5 },
  { name: 'colorFiles', maxCount: 5 }
]), async (req, res) => {
  try {
    const generalImagesUrls = (req.files && req.files['generalImages']) ? req.files['generalImages'].map(file => file.path) : [];
    const colorFiles = (req.files && req.files['colorFiles']) || [];
    let colorNames = req.body.colorNames || [];
    if (!Array.isArray(colorNames)) colorNames = [colorNames];

    const colorImages = colorFiles.map((file, index) => ({
      color: colorNames[index] ? colorNames[index].trim() : 'Default',
      url: file.path
    }));

    const allImages = [...generalImagesUrls, ...colorImages.map(c => c.url)];
    const colorsArray = colorImages.map(c => c.color);
    let parsedVariantOptions = req.body.variantOptions ? req.body.variantOptions.split(',').map(item => item.trim()) : [];

    const newProduct = new Product({
      ...req.body,
      variantOptions: parsedVariantOptions,
      colors: colorsArray,
      colorImages,
      isSeasonal: req.body.isSeasonal === 'true',
      images: allImages
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// update an existing product (admin only)
router.put('/:id', verifyAdmin, upload.fields([
  { name: 'generalImages', maxCount: 5 },
  { name: 'colorFiles', maxCount: 5 }
]), async (req, res) => {
  try {
    const productId = req.params.id;
    let updateData = { ...req.body };

    // Handle variant options if provided as a string
    if (req.body.variantOptions && typeof req.body.variantOptions === 'string') {
      updateData.variantOptions = req.body.variantOptions.split(',').map(item => item.trim());
    }

    // Handle boolean conversion
    if (req.body.isSeasonal !== undefined) {
      updateData.isSeasonal = req.body.isSeasonal === 'true';
    }

    // Handle image updates (only if new files are uploaded)
    if (req.files && (req.files['generalImages'] || req.files['colorFiles'])) {
      const generalImagesUrls = req.files['generalImages'] ? req.files['generalImages'].map(file => file.path) : [];
      const colorFiles = req.files['colorFiles'] || [];
      let colorNames = req.body.colorNames || [];
      if (!Array.isArray(colorNames)) colorNames = [colorNames];

      const colorImages = colorFiles.map((file, index) => ({
        color: colorNames[index] ? colorNames[index].trim() : 'Default',
        url: file.path
      }));

      updateData.images = [...generalImagesUrls, ...colorImages.map(c => c.url)];
      updateData.colorImages = colorImages;
      updateData.colors = colorImages.map(c => c.color);
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// delete product
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;