import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Zap, Shield, Truck, RefreshCw, Star, BadgePercent,
  Smartphone, Shirt, Armchair, Dumbbell, Sparkles, BookOpen,
} from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: Smartphone, color: '#3b82f6' },
  { id: 'fashion', label: 'Fashion', icon: Shirt, color: '#ec4899' },
  { id: 'home', label: 'Home & Living', icon: Armchair, color: '#10b981' },
  { id: 'sports', label: 'Sports', icon: Dumbbell, color: '#f59e0b' },
  { id: 'beauty', label: 'Beauty', icon: Sparkles, color: '#8b5cf6' },
  { id: 'books', label: 'Books', icon: BookOpen, color: '#06b6d4' },
];

const FEATURES = [
  { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: <Shield size={24} />, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: <RefreshCw size={24} />, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: <Zap size={24} />, title: 'Fast Delivery', desc: '2-3 business days' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products?featured=true&limit=8`);
      setFeaturedProducts(data.data || []);
    } catch (err) {
      console.error('Failed to load featured products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__badge">
              <Star size={12} fill="currentColor" />
              <span>New arrivals every week</span>
            </div>
            <h1 className="hero__title">
              Find Products<br />
              <span className="hero__title-accent">You'll Love</span>
            </h1>
            <p className="hero__desc">
              Discover thousands of carefully curated products — from cutting-edge electronics to everyday essentials. Quality you can count on.
            </p>
            <div className="hero__actions">
              <Link to="/products" className="btn btn-primary hero__cta">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/products?featured=true" className="btn btn-outline">
                Featured Items
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <strong>10K+</strong>
                <span>Products</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <strong>50K+</strong>
                <span>Happy Customers</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <strong>4.9<Star size={14} fill="currentColor" strokeWidth={0} /></strong>
                <span>Average Rating</span>
              </div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__image-wrap">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
                alt="Featured product"
                className="hero__image hero__image--main"
              />
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
                alt="Product 2"
                className="hero__image hero__image--secondary"
              />
              <div className="hero__float-card">
                <div className="hero__float-icon">
                  <BadgePercent size={22} />
                </div>
                <div>
                  <p className="hero__float-label">Limited Time</p>
                  <p className="hero__float-value">Up to 40% Off</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="features">
        <div className="container features__grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-item">
              <div className="feature-item__icon">{f.icon}</div>
              <div>
                <h4 className="feature-item__title">{f.title}</h4>
                <p className="feature-item__desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label">Browse by type</p>
              <h2 className="section-title">Shop by Category</h2>
            </div>
            <Link to="/products" className="section-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="categories__grid">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="category-card"
                  style={{ '--cat-color': cat.color }}
                >
                  <span className="category-card__icon">
                    <Icon size={24} strokeWidth={1.8} />
                  </span>
                  <span className="category-card__label">{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label">Hand-picked for you</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products?featured=true" className="section-link">
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="product-grid" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-line skeleton-card__image" />
                  <div className="skeleton-card__body">
                    <div className="skeleton-line skeleton-line--sm" />
                    <div className="skeleton-line skeleton-line--md" />
                    <div className="skeleton-line skeleton-line--lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No featured products yet. <Link to="/products" style={{ color: 'var(--primary)' }}>Browse all products</Link></p>
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container promo-banner__inner">
          <div className="promo-banner__content">
            <p className="promo-banner__label">Limited offer</p>
            <h2 className="promo-banner__title">Get 20% Off Your First Order</h2>
            <p className="promo-banner__desc">
              Sign up today and get an exclusive discount on your first purchase.
            </p>
            <Link to="/register" className="btn btn-primary">
              Create Account <ArrowRight size={16} />
            </Link>
          </div>
          <div className="promo-banner__visual">
            <div className="promo-banner__circle" />
            <div className="promo-banner__circle promo-banner__circle--2" />
            <span className="promo-banner__percent">20%</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
