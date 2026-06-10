const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const getDb = () => require('mongoose').connection.db;
const { ObjectId } = require('mongoose').mongo;
const isValidId = (id) => typeof id === 'string' && ObjectId.isValid(id);

const MAX_QTY = 99;

const populateCart = async (db, cart) => {
  const populated = await Promise.all(cart.map(async (item) => {
    const product = await db.collection('products').findOne({ _id: new ObjectId(item.product) });
    return { product, quantity: item.quantity };
  }));
  return populated.filter((i) => i.product);
};

// GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    const cart = user.cart || [];
    res.json({ success: true, cart: await populateCart(db, cart) });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to load cart.' });
  }
});

// POST /api/cart
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const quantity = Number(req.body.quantity) || 1;
    if (!isValidId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }
    const db = getDb();
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    const cart = user.cart || [];
    const existingIndex = cart.findIndex(i => i.product.toString() === productId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity = Math.min(MAX_QTY, cart[existingIndex].quantity + quantity);
    } else {
      cart.push({ product: new ObjectId(productId), quantity });
    }
    await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart } });
    res.json({ success: true, cart: await populateCart(db, cart) });
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
});

// PUT /api/cart/:productId
router.put('/:productId', protect, async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!isValidId(req.params.productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QTY) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }
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
    res.json({ success: true, cart: await populateCart(db, cart) });
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
});

// DELETE /api/cart/:productId
router.delete('/:productId', protect, async (req, res) => {
  try {
    if (!isValidId(req.params.productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });
    const cart = (user.cart || []).filter(i => i.product.toString() !== req.params.productId);
    await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart } });
    res.json({ success: true, cart: await populateCart(db, cart) });
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
});

// DELETE /api/cart
router.delete('/', protect, async (req, res) => {
  try {
    const db = getDb();
    await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart: [] } });
    res.json({ success: true, cart: [] });
  } catch (error) {
    console.error('Cart clear error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

module.exports = router;
