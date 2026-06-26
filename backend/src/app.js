const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');
require('dotenv').config();

// Modular Route Imports
const authRouter = require('./auth/authRouter');
const productRouter = require('./product/productRouter');
const orderRouter = require('./order/orderRouter');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Route Mounts
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

// Health check and root API endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Heather Benjamin Jewelry API (Modular, Prisma ORM)',
    version: '1.0.0',
    status: 'Running'
  });
});

// Database connectivity check endpoint using Prisma
app.get('/api/db-check', async (req, res) => {
  try {
    const count = await prisma.product.count();
    return res.status(200).json({ 
      status: 'Connected to Database via Prisma successfully', 
      productCount: count 
    });
  } catch (error) {
    return res.status(500).json({ status: 'Connection failed', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
