require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const couponRoutes = require('./routes/couponRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Connect to Database
connectDB();

// 1. SECURITY CONFIGURATION (Define limiter first)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
});

// 2. GLOBAL MIDDLEWARE
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors());
app.use(express.json());
app.use('/api/', limiter); // Apply rate limit to all /api/ routes

// 3. ROUTES
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);

// Test route
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'My Bazaar API is running'
  });
});

// Export for Vercel
module.exports = app;

// Local development listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Local server running on port ${PORT}`));
}