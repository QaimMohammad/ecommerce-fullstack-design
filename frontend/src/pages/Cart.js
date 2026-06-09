import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();

  const shipping = cartTotal >= 50 ? 0 : 7.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: '120px' }}>
            <ShoppingBag size={64} strokeWidth={1} />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet. Start shopping!</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-page__header">
          <h1 className="cart-page__title">Shopping Cart</h1>
          <span className="cart-page__count">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="cart-page__grid">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.map((item) => {
              const p = item.product;
              if (!p) return null;
              return (
                <div key={p._id} className="cart-item">
                  <Link to={`/products/${p._id}`} className="cart-item__image">
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'; }}
                    />
                  </Link>
                  <div className="cart-item__info">
                    <p className="cart-item__category">{p.category}</p>
                    <Link to={`/products/${p._id}`} className="cart-item__name">{p.name}</Link>
                    <p className="cart-item__brand">{p.brand}</p>
                    <div className="cart-item__price-row">
                      <span className="cart-item__price">${p.price.toFixed(2)}</span>
                      {p.originalPrice && (
                        <span className="cart-item__original">${p.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="cart-item__controls">
                    <div className="cart-item__qty">
                      <button
                        onClick={() => updateQuantity(p._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(p._id, item.quantity + 1)}
                        disabled={item.quantity >= (p.stock || 99)}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="cart-item__subtotal">${(p.price * item.quantity).toFixed(2)}</p>
                    <button
                      className="cart-item__remove"
                      onClick={() => removeFromCart(p._id)}
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="cart-items__footer">
              <button className="cart-clear-btn" onClick={clearCart}>
                <Trash2 size={14} /> Clear Cart
              </button>
              <Link to="/products" className="btn btn-outline" style={{ fontSize: '13px', padding: '10px 20px' }}>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h2 className="cart-summary__title">Order Summary</h2>

            <div className="cart-summary__lines">
              <div className="cart-summary__line">
                <span>Subtotal ({cart.length} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary__line">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'cart-summary__free' : ''}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="cart-summary__line">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            {cartTotal < 50 && (
              <div className="cart-summary__free-shipping">
                <Tag size={14} />
                Add <strong>${(50 - cartTotal).toFixed(2)}</strong> more for free shipping!
              </div>
            )}

            <div className="cart-summary__total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="btn btn-primary cart-summary__checkout">
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <div className="cart-summary__secure">
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 7H2V5C2 2.8 3.8 1 6 1C8.2 1 10 2.8 10 5V7Z" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="1" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="6" cy="11" r="1" fill="currentColor"/>
              </svg>
              Secure checkout — SSL encrypted
            </div>

            <div className="cart-summary__payment">
              {['Visa', 'MC', 'PayPal', 'Stripe'].map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
