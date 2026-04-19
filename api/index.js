require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const couponRoutes = require('./routes/couponRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/users',userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);

//test route
app.get('/api/status', (req,res)=>{
  res.status(200).json({
    status: 'success',
    message: 'my Bazaar Api is running'
  });
});

//export the app for vercel serverless execution
module.exports = app;
if (process.env.NODE_ENV !== 'production'){
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, ()=> console.log(`Local server running on port ${PORT}`));
}