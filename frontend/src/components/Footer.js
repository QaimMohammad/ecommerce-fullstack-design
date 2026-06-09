import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Star, Share2 } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-icon">S</span>
            <span>ShopFlow</span>
          </div>
          <p className="footer__tagline">
            Your destination for premium products. Quality, style, and value — all in one place.
          </p>
          <div className="footer__socials">
            <a href="#!" aria-label="Social"><Heart size={18} /></a>
            <a href="#!" aria-label="Share"><Share2 size={18} /></a>
            <a href="#!" aria-label="Star"><Star size={18} /></a>
          </div>
        </div>

        <div className="footer__links">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=electronics">Electronics</Link>
          <Link to="/products?category=fashion">Fashion</Link>
          <Link to="/products?category=home">Home & Living</Link>
          <Link to="/products?category=sports">Sports</Link>
        </div>

        <div className="footer__links">
          <h4>Company</h4>
          <a href="#!">About Us</a>
          <a href="#!">Careers</a>
          <a href="#!">Blog</a>
          <a href="#!">Press</a>
        </div>

        <div className="footer__links">
          <h4>Support</h4>
          <a href="#!">Help Center</a>
          <a href="#!">Shipping Policy</a>
          <a href="#!">Returns</a>
          <a href="#!">Privacy Policy</a>
          <a href="#!">Terms of Service</a>
        </div>

        <div className="footer__contact">
          <h4>Contact</h4>
          <div className="footer__contact-item">
            <Mail size={15} />
            <span>support@shopflow.com</span>
          </div>
          <div className="footer__contact-item">
            <Phone size={15} />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="footer__contact-item">
            <MapPin size={15} />
            <span>123 Commerce St, NY 10001</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} ShopFlow. All rights reserved.</p>
          <div className="footer__payment">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>PayPal</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
