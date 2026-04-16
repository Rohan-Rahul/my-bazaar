const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  orderItems: [
    {
      product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
      quantity: {type: Number,required: true},
      price: {type: Number,required: true}
    }
  ],
  shippingAddress: {
    street: {type: String, required: true},
    city: {type: String, required: true},
    postalCode: {type: String,required: true},
    country: {type: String, required: true}
  },
  totalAmount: {type: Number, required: true},
  status: {type: String, default: 'Pending'}
}, {timestamps: true});

module.exports = mongoose.model('Order',orderSchema);