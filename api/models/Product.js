const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: Number, required: true},
  images: [{type: String}], //changed from single url to array
  variantType: {type: String}, //eg "Size", "Material","Color"
  variantOptions: [{type: String}], //eg ["S","M"], ["Gold","Silver"]
  category: {type: String, required:true},
  isSeasonal: {type: Boolean, default: false},
  seasonalTag: {type: String},
  stock: {type: Number, required: true, default: 0},
  rating: {type: Number, default: 0},
  numReviews: {type: Number, default: 0}
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);