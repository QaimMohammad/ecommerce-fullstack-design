import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Check, Minus, Plus, Truck, Shield, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/products/${id}`);
      setProduct(data.data);
      setSelectedImage(0);
      // Fetch related
      const rel = await axios.get(`${API_URL}/products?category=${data.data.category}&limit=4`);
      setRelated(rel.data.data.filter((p) => p._id !== id).slice(0, 4));
    } catch (err) {
      console.error('Failed to load product:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    await addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
        strokeWidth={i < Math.floor(rating) ? 0 : 1.5}
      />
    ));

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const allImages = product ? [product.image, ...(product.images || []).filter((img) => img !== product.image)] : [];

  if (loading) return <div className="page-loader" style={{ paddingTop: 'var(--nav-height)' }}><div className="spinner" /></div>;

  if (!product) return (
    <div className="product-detail__not-found">
      <h2>Product not found</h2>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {/* Main layout */}
        <div className="product-detail__grid">
          {/* Image Gallery */}
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              <img
                src={allImages[selectedImage] || product.image}
                alt={product.name}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'; }}
              />
              {discount && <span className="product-detail__badge">-{discount}%</span>}
            </div>
            {allImages.length > 1 && (
              <div className="product-detail__thumbnails">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`product-detail__thumb${selectedImage === i ? ' active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail__info">
            <p className="product-detail__category">{product.category}</p>
            <h1 className="product-detail__name">{product.name}</h1>
            <p className="product-detail__brand">by <strong>{product.brand}</strong></p>

            {/* Rating */}
            <div className="product-detail__rating">
              <div className="stars">{renderStars(product.rating)}</div>
              <span className="product-detail__rating-val">{product.rating.toFixed(1)}</span>
              <span className="product-detail__reviews">({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="product-detail__price-section">
              <span className="product-detail__price">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="product-detail__original">${product.originalPrice.toFixed(2)}</span>
                  <span className="product-detail__savings">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="product-detail__desc">{product.description}</p>

            {/* Stock status */}
            <div className={`product-detail__stock${product.stock === 0 ? ' out' : ''}`}>
              {product.stock > 0 ? (
                <><Check size={14} /> In Stock ({product.stock} available)</>
              ) : (
                <>Out of Stock</>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="product-detail__actions">
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="quantity-val">{quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  className={`btn btn-primary product-detail__add-btn${added ? ' added' : ''}`}
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                >
                  {added ? (
                    <><Check size={16} /> Added!</>
                  ) : (
                    <><ShoppingCart size={16} /> Add to Cart</>
                  )}
                </button>
              </div>
            )}

            {/* Guarantees */}
            <div className="product-detail__guarantees">
              <div className="guarantee-item">
                <Truck size={16} />
                <div>
                  <p>Free shipping over $50</p>
                  <span>2–3 business days</span>
                </div>
              </div>
              <div className="guarantee-item">
                <RefreshCw size={16} />
                <div>
                  <p>30-day returns</p>
                  <span>No questions asked</span>
                </div>
              </div>
              <div className="guarantee-item">
                <Shield size={16} />
                <div>
                  <p>Secure payment</p>
                  <span>SSL encrypted</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="product-detail__tags">
                {product.tags.map((tag) => (
                  <Link key={tag} to={`/products?search=${tag}`} className="product-tag">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="product-detail__related">
            <h2 className="section-title">Related Products</h2>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
