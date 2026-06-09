const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const getDb = () => require('mongoose').connection.db;
const { ObjectId } = require('mongoose').mongo;

// GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    const cart = user.cart || [];
    // Populate products
    const populated = await Promise.all(cart.map(async (item) => {
      const product = await db.collection('products').findOne({ _id: new ObjectId(item.product) });
      return { product, quantity: item.quantity };
    }));
    res.json({ success: true, cart: populated.filter(i => i.product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cart
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    const cart = user.cart || [];
    const existingIndex = cart.findIndex(i => i.product.toString() === productId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product: new ObjectId(productId), quantity });
    }
    await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart } });
    const populated = await Promise.all(cart.map(async (item) => {
      const product = await db.collection('products').findOne({ _id: new ObjectId(item.product) });
      return { product, quantity: item.quantity };
    }));
    res.json({ success: true, cart: populated.filter(i => i.product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cart/:productId
router.put('/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    let cart = user.cart || [];
    if (quantity <= 0) {
      cart = cart.filter(i => i.product.toString() !== req.params.productId);
    } else {
      const idx = cart.findIndex(i => i.product.toString() === req.params.productId);
      if (idx > -1) cart[idx].quantity = quantity;
    }
    await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart } });
    const populated = await Promise.all(cart.map(async (item) => {
      const product = await db.collection('products').findOne({ _id: new ObjectId(item.product) });
      return { product, quantity: item.quantity };
    }));
    res.json({ success: true, cart: populated.filter(i => i.product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/:productId
router.delete('/:productId', protect, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    const cart = (user.cart || []).filter(i => i.product.toString() !== req.params.productId);
    await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart } });
    const populated = await Promise.all(cart.map(async (item) => {
      const product = await db.collection('products').findOne({ _id: new ObjectId(item.product) });
      return { product, quantity: item.quantity };
    }));
    res.json({ success: true, cart: populated.filter(i => i.product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart
router.delete('/', protect, async (req, res) => {
  try {
    const db = getDb();
    await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart: [] } });
    res.json({ success: true, cart: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;