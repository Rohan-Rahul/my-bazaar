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


    //add regex search for title
    if(search){
      query.title = {
        $regex: search,
        $options: 'i' //makes it case insensitive
      };
    }

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
router.post('/', verifyAdmin,upload.fields([
  {name: 'generalImages', maxCount: 5},
  {name: 'colorFiles', maxCount:5}
]), async (req, res) => {
  try {
    
    //extract generalImages
    const generalImagesUrls = (req.files && req.files['generalImages']) ? req.files['generalImages'].map(file => file.path) : [];

    //extract color specific images and names
    const colorFiles = (req.files && req.files['colorFiles']) || [];
    let colorNames = req.body.colorNames || [];

    if(!Array.isArray(colorNames)){
      colorNames = [colorNames];
    }

    //map files to their respective colors
    const colorImages = colorFiles.map((file,index) => ({
      color: colorNames[index] ? colorNames[index].trim() : 'Default',
      url: file.path
    }));

    //combine all URLs for main gallery
    const allImages = [...generalImagesUrls, ...colorImages.map(c => c.url)];
    const colorsArray = colorImages.map(c => c.color);

    //format variantOptions from string "S,M,L" to array ["S","M","L"]
    let parsedVariantOptions = [];
    if(req.body.variantOptions){
      parsedVariantOptions = req.body.variantOptions.split(',').map(item => item.trim());
    }

    const isSeasonalBool = req.body.isSeasonal === 'true';

    const newProduct = new Product({
      ...req.body,
      variantOptions: parsedVariantOptions,
      colors: colorsArray,
      colorImages: colorImages,
      isSeasonal: isSeasonalBool,
      images: allImages
    });
    
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