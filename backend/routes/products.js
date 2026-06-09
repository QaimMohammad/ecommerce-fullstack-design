const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/products - Get all products with search, filter, pagination
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12, featured } = req.query;

    let query = {};

    // Search by name/description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Featured products only
    if (featured === 'true') {
      query.featured = true;
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - Create product (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products/seed - Seed sample data (development only)
router.post('/seed/data', async (req, res) => {
  try {
    await Product.deleteMany({});

    const sampleProducts = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        price: 79.99,
        originalPrice: 129.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
        ],
        description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for work and travel.',
        category: 'electronics',
        stock: 45,
        rating: 4.5,
        numReviews: 128,
        featured: true,
        brand: 'SoundPro',
        tags: ['wireless', 'headphones', 'audio'],
      },
      {
        name: 'Classic Leather Sneakers',
        price: 89.99,
        originalPrice: 120.00,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        description: 'Handcrafted genuine leather sneakers with cushioned insoles and durable rubber soles. Available in multiple colors.',
        category: 'fashion',
        stock: 30,
        rating: 4.3,
        numReviews: 89,
        featured: true,
        brand: 'StrideStyle',
        tags: ['shoes', 'leather', 'sneakers'],
      },
      {
        name: 'Smart Watch Series 5',
        price: 199.99,
        originalPrice: 249.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
        description: 'Feature-packed smartwatch with health monitoring, GPS, and 7-day battery. Water resistant up to 50m.',
        category: 'electronics',
        stock: 20,
        rating: 4.7,
        numReviews: 203,
        featured: true,
        brand: 'TechWear',
        tags: ['smartwatch', 'fitness', 'wearable'],
      },
      {
        name: 'Minimalist Backpack',
        price: 59.99,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
        description: 'Sleek 25L backpack with laptop compartment, anti-theft pocket, and ergonomic straps. Perfect for daily commute.',
        category: 'fashion',
        stock: 60,
        rating: 4.4,
        numReviews: 67,
        featured: false,
        brand: 'UrbanCarry',
        tags: ['backpack', 'travel', 'laptop'],
      },
      {
        name: 'Ceramic Coffee Mug Set',
        price: 34.99,
        originalPrice: 49.99,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
        images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500'],
        description: 'Set of 4 handmade ceramic mugs with unique glazed finish. Dishwasher and microwave safe. 350ml capacity each.',
        category: 'home',
        stock: 80,
        rating: 4.6,
        numReviews: 145,
        featured: true,
        brand: 'HomeBliss',
        tags: ['mugs', 'kitchen', 'ceramic'],
      },
      {
        name: 'Yoga Mat Premium',
        price: 45.00,
        originalPrice: 65.00,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
        description: '6mm thick non-slip yoga mat with alignment lines. Made from eco-friendly TPE material. Includes carrying strap.',
        category: 'sports',
        stock: 55,
        rating: 4.8,
        numReviews: 312,
        featured: false,
        brand: 'ZenFit',
        tags: ['yoga', 'fitness', 'sports'],
      },
      {
        name: 'Vitamin C Face Serum',
        price: 28.99,
        originalPrice: 39.99,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500'],
        description: '15% Vitamin C brightening serum with hyaluronic acid. Reduces dark spots and gives radiant glow. 30ml bottle.',
        category: 'beauty',
        stock: 100,
        rating: 4.5,
        numReviews: 456,
        featured: true,
        brand: 'GlowLab',
        tags: ['skincare', 'serum', 'vitamin-c'],
      },
      {
        name: 'Mechanical Keyboard RGB',
        price: 110.00,
        originalPrice: 149.99,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'],
        description: 'TKL mechanical keyboard with Cherry MX switches, full RGB backlighting, and detachable USB-C cable.',
        category: 'electronics',
        stock: 25,
        rating: 4.6,
        numReviews: 178,
        featured: false,
        brand: 'KeyMaster',
        tags: ['keyboard', 'mechanical', 'rgb', 'gaming'],
      },
      {
        name: 'Linen Throw Blanket',
        price: 42.00,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500',
        images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500'],
        description: 'Cozy 100% cotton throw blanket, 150x200cm. Machine washable with tasseled edges. Available in 6 colors.',
        category: 'home',
        stock: 40,
        rating: 4.4,
        numReviews: 92,
        featured: false,
        brand: 'HomeBliss',
        tags: ['blanket', 'cozy', 'bedroom'],
      },
      {
        name: 'Portable Bluetooth Speaker',
        price: 55.00,
        originalPrice: 79.99,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'],
        description: '360° surround sound portable speaker, waterproof IPX7, 12-hour playtime, and built-in mic for calls.',
        category: 'electronics',
        stock: 35,
        rating: 4.3,
        numReviews: 211,
        featured: false,
        brand: 'SoundPro',
        tags: ['speaker', 'bluetooth', 'portable'],
      },
      {
        name: 'Running Shoes Pro',
        price: 115.00,
        originalPrice: 155.00,
        image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500',
        images: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500'],
        description: 'Lightweight running shoes with responsive foam cushioning, breathable mesh upper, and grip sole.',
        category: 'sports',
        stock: 22,
        rating: 4.7,
        numReviews: 389,
        featured: true,
        brand: 'SpeedRun',
        tags: ['running', 'shoes', 'sports'],
      },
      {
        name: 'Scented Candle Collection',
        price: 22.99,
        originalPrice: 30.00,
        image: 'https://images.unsplash.com/photo-1602178505572-6e9c7f9e8b46?w=500',
        images: ['https://images.unsplash.com/photo-1602178505572-6e9c7f9e8b46?w=500'],
        description: 'Set of 3 hand-poured soy wax candles in glass jars. Scents: lavender, vanilla, and eucalyptus. 40hr burn time each.',
        category: 'home',
        stock: 75,
        rating: 4.9,
        numReviews: 534,
        featured: false,
        brand: 'AromaBliss',
        tags: ['candles', 'home-decor', 'scented'],
      },
    ];

    const products = await Product.insertMany(sampleProducts);
    res.json({ success: true, message: `${products.length} products seeded`, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
