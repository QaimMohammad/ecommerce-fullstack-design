import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, LogOut, Settings, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">S</span>
          <span className="navbar__logo-text">ShopFlow</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar__links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Products</Link>
          {isAdmin && (
            <Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>Admin</Link>
          )}
        </nav>

        {/* Desktop Search */}
        <form className="navbar__search" onSubmit={handleSearch}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Desktop Actions */}
        <div className="navbar__actions">
          <Link to="/cart" className="navbar__cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="navbar__user">
              <button
                className="navbar__user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="navbar__avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="navbar__user-name">{user.name.split(' ')[0]}</span>
              </button>
              {dropdownOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <p className="navbar__dropdown-name">{user.name}</p>
                    <p className="navbar__dropdown-email">{user.email}</p>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  {isAdmin && (
                    <Link to="/admin" className="navbar__dropdown-item">
                      <Settings size={14} />
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/cart" className="navbar__dropdown-item">
                    <Package size={14} />
                    My Cart
                  </Link>
                  <div className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-item navbar__dropdown-logout" onClick={handleLogout}>
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth-btns">
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="navbar__mobile-actions">
          <Link to="/cart" className="navbar__cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
          </Link>
          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <form className="navbar__mobile-search" onSubmit={handleSearch}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <nav className="navbar__mobile-links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            {isAdmin && <Link to="/admin">Admin Panel</Link>}
          </nav>
          <div className="navbar__mobile-auth">
            {user ? (
              <>
                <p className="navbar__mobile-user">Hi, {user.name.split(' ')[0]}!</p>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleLogout}>
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>Log in</Link>
                <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
