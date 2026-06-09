import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={11}
        fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
        strokeWidth={i < Math.floor(rating) ? 0 : 1.5}
      />
    ));
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card__image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }}
        />
        {discount && <span className="product-card__discount">-{discount}%</span>}
        {product.stock === 0 && (
          <div className="product-card__out-of-stock">Out of Stock</div>
        )}
        <button
          className="product-card__add-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
      <div className="product-card__info">
        <p className="product-card__category">{product.category}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__rating">
          <div className="stars">{renderStars(product.rating)}</div>
          <span className="product-card__reviews">({product.numReviews})</span>
        </div>
        <div className="product-card__price-row">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="product-card__original">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
