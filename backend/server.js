const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// dotenv only for local dev
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Start server anyway for development without DB
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without DB)`);
    });
  });

module.exports = app;
