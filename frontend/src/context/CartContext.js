import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  // cart items: [{ product: {...}, quantity: N }]
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage on mount (guest cart)
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('guestCart');
      if (saved) {
        try { setCart(JSON.parse(saved)); } catch {}
      }
    }
  }, [user]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart, user]);

  // Fetch cart from backend when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // User logged out - restore guest cart
      const saved = localStorage.getItem('guestCart');
      setCart(saved ? JSON.parse(saved) : []);
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/cart`);
      setCart(data.cart || []);
    } catch (err) {
      console.error('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (user) {
      try {
        const { data } = await axios.post(`${API_URL}/cart`, { productId: product._id, quantity });
        setCart(data.cart);
        toast.success(`${product.name} added to cart!`);
        return true;
      } catch (err) {
        if (err.response?.status !== 401) {
          toast.error('Failed to add to cart');
        }
        return false;
      }
    } else {
      // Guest cart
      setCart((prev) => {
        const existing = prev.find((i) => i.product._id === product._id);
        if (existing) {
          toast.success('Quantity updated!');
          return prev.map((i) =>
            i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        toast.success(`${product.name} added to cart!`);
        return [...prev, { product, quantity }];
      });
      return true;
    }
  }, [user]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (user) {
      try {
        const { data } = await axios.put(`${API_URL}/cart/${productId}`, { quantity });
        setCart(data.cart);
      } catch (err) {
        toast.error('Failed to update cart');
      }
    } else {
      setCart((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.product._id !== productId)
          : prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
      );
    }
  }, [user]);

  const removeFromCart = useCallback(async (productId) => {
    if (user) {
      try {
        const { data } = await axios.delete(`${API_URL}/cart/${productId}`);
        setCart(data.cart);
        toast.success('Removed from cart');
      } catch (err) {
        toast.error('Failed to remove from cart');
      }
    } else {
      setCart((prev) => prev.filter((i) => i.product._id !== productId));
      toast.success('Removed from cart');
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        await axios.delete(`${API_URL}/cart`);
      } catch {}
    }
    setCart([]);
    localStorage.removeItem('guestCart');
  }, [user]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
