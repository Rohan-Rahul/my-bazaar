const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {type: String, required: true},
  rating: {type: Number, required: true},
  comment: {type: String, required: true},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {timestamps: true});

const productSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: Number, required: true},
  images: [{type: String}], 
  colorImages: [{
    color: String,
    url: String
  }],
  variantType: {type: String}, //eg "Size", "Material"
  variantOptions: [{type: String}], //eg ["S","M"], ["Gold","Silver"],
  colors: [{type:String}],
  category: {type: String, required:true},
  isSeasonal: {type: Boolean, default: false},
  seasonalTag: {type: String},
  stock: {type: Number, required: true, default: 0},
  reviews: [reviewSchema],
  rating: {type: Number, default: 0},
  numReviews: {type: Number, default: 0}
}, {timestamps: true});

//text index for high-performance search
productSchema.index({
  title: 'text',
  description: 'text',
  category: 'text'
});

module.exports = mongoose.model('Product', productSchema);