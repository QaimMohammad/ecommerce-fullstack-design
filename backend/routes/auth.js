const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, signToken } = require('../middleware/auth');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    let { name, email, password } = req.body;
    // Reject non-string payloads (NoSQL operator injection)
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }
    name = name.trim();
    email = email.trim().toLowerCase();
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }
    if (name.length > 100 || !EMAIL_REGEX.test(email) || email.length > 254) {
      return res.status(400).json({ success: false, message: 'Please provide a valid name and email' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be 8-128 characters' });
    }
    const bcrypt = require('bcryptjs');
    const db = require('mongoose').connection.db;
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const result = await db.collection('users').insertOne({
      name, email, password: hashed, role: 'user', cart: [],
      createdAt: new Date(), updatedAt: new Date(),
    });
    const token = signToken(result.insertedId);
    res.status(201).json({
      success: true, token,
      user: { _id: result.insertedId, name, email, role: 'user' },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ success: false, message: 'Failed to load user.' });
  }
});

// POST /api/auth/seed-admin - Bootstrap the demo admin account.
// Locked behind SEED_SECRET: set the env var on the server, then call with
// an "x-seed-key" header matching it. Disabled entirely when unset.
router.post('/seed-admin', async (req, res) => {
  try {
    const seedSecret = process.env.SEED_SECRET;
    if (!seedSecret || req.headers['x-seed-key'] !== seedSecret) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@store.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const bcrypt = require('bcryptjs');
    const db = require('mongoose').connection.db;
    await db.collection('users').deleteOne({ email: adminEmail });
    const hashed = await bcrypt.hash(adminPassword, 12);
    await db.collection('users').insertOne({
      name: 'Admin User',
      email: adminEmail,
      password: hashed,
      role: 'admin',
      cart: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.json({ success: true, email: adminEmail });
  } catch (error) {
    console.error('Seed-admin error:', error);
    res.status(500).json({ success: false, message: 'Seeding failed.' });
  }
});

module.exports = router;
