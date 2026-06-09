import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Check, Package, Users, ShoppingCart, DollarSign, Search, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EMPTY_PRODUCT = {
  name: '', price: '', originalPrice: '', image: '', description: '',
  category: 'electronics', stock: '', brand: '', featured: false,
};

const CATEGORIES = ['electronics', 'fashion', 'home', 'sports', 'beauty', 'books', 'toys', 'food'];

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({ total: 0, featured: 0, outOfStock: 0 });
  const [seeding, setSeeding] = useState(false);

  // eslint-disable-next-line
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}&limit=100` : '?limit=100';
      const { data } = await axios.get(`${API_URL}/products${params}`);
      const prods = data.data || [];
      setProducts(prods);
      setStats({
        total: data.pagination?.total || prods.length,
        featured: prods.filter((p) => p.featured).length,
        outOfStock: prods.filter((p) => p.stock === 0).length,
      });
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || '',
      image: product.image,
      description: product.description,
      category: product.category,
      stock: product.stock,
      brand: product.brand || '',
      featured: product.featured || false,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) errs.price = 'Valid price required';
    if (!form.image.trim()) errs.image = 'Required';
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.category) errs.category = 'Required';
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) errs.stock = 'Valid stock required';
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: Number(form.stock),
      };
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct._id}`, payload);
        toast.success('Product updated!');
      } else {
        await axios.post(`${API_URL}/products`, payload);
        toast.success('Product created!');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await axios.post(`${API_URL}/products/seed/data`);
      toast.success('Sample products seeded!');
      fetchProducts();
    } catch (err) {
      toast.error('Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  const handleSeedAdmin = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/seed-admin`);
      toast.success(`Admin: ${data.email} / ${data.password}`);
    } catch {
      toast.error('Failed');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors((fe) => ({ ...fe, [name]: '' }));
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Panel</h1>
            <p className="admin-subtitle">Manage your store's products</p>
          </div>
          <div className="admin-header__actions">
            <button className="btn btn-outline" onClick={handleSeedAdmin} style={{ fontSize: '13px', padding: '10px 16px' }}>
              Seed Admin
            </button>
            <button className={`btn btn-outline${seeding ? ' loading' : ''}`} onClick={handleSeed} style={{ fontSize: '13px', padding: '10px 16px' }}>
              <RefreshCw size={14} /> Seed Products
            </button>
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {[
            { icon: <Package size={20} />, label: 'Total Products', value: stats.total, color: '#3b82f6' },
            { icon: <DollarSign size={20} />, label: 'Featured', value: stats.featured, color: '#f59e0b' },
            { icon: <ShoppingCart size={20} />, label: 'Out of Stock', value: stats.outOfStock, color: '#ef4444' },
            { icon: <Users size={20} />, label: 'Categories', value: CATEGORIES.length, color: '#10b981' },
          ].map((s) => (
            <div key={s.label} className="admin-stat-card" style={{ '--stat-color': s.color }}>
              <div className="admin-stat-icon">{s.icon}</div>
              <div>
                <p className="admin-stat-value">{s.value}</p>
                <p className="admin-stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="admin-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X size={14} /></button>}
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No products yet</h3>
            <p>Add your first product or seed sample data.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" onClick={handleSeed}>Seed Sample Data</button>
              <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Product</button>
            </div>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="admin-product-cell">
                        <img
                          src={p.image}
                          alt={p.name}
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'; }}
                        />
                        <div>
                          <p className="admin-product-name">{p.name}</p>
                          <p className="admin-product-brand">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="admin-category-badge">{p.category}</span></td>
                    <td>
                      <div>
                        <p className="admin-price">${p.price.toFixed(2)}</p>
                        {p.originalPrice && <p className="admin-original">${p.originalPrice.toFixed(2)}</p>}
                      </div>
                    </td>
                    <td>
                      <span className={`admin-stock${p.stock === 0 ? ' out' : p.stock <= 5 ? ' low' : ''}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      {p.featured ? (
                        <Check size={16} color="var(--success)" />
                      ) : (
                        <X size={16} color="var(--text-light)" />
                      )}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn edit" onClick={() => openEdit(p)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="admin-action-btn delete" onClick={() => setDeleteConfirm(p)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="modal-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Product Name *</label>
                  <input name="name" className={`form-input${formErrors.name ? ' error' : ''}`} value={form.name} onChange={handleFormChange} placeholder="e.g. Wireless Headphones" />
                  {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input name="price" type="number" min="0" step="0.01" className={`form-input${formErrors.price ? ' error' : ''}`} value={form.price} onChange={handleFormChange} placeholder="0.00" />
                  {formErrors.price && <p className="form-error">{formErrors.price}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Original Price ($)</label>
                  <input name="originalPrice" type="number" min="0" step="0.01" className="form-input" value={form.originalPrice} onChange={handleFormChange} placeholder="Optional" />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" className={`form-input${formErrors.category ? ' error' : ''}`} value={form.category} onChange={handleFormChange}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input name="stock" type="number" min="0" className={`form-input${formErrors.stock ? ' error' : ''}`} value={form.stock} onChange={handleFormChange} placeholder="0" />
                  {formErrors.stock && <p className="form-error">{formErrors.stock}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input name="brand" className="form-input" value={form.brand} onChange={handleFormChange} placeholder="e.g. Apple" />
                </div>

                <div className="form-group modal-featured">
                  <label className="modal-checkbox-label">
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleFormChange} />
                    <span>Featured Product</span>
                  </label>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Image URL *</label>
                  <input name="image" className={`form-input${formErrors.image ? ' error' : ''}`} value={form.image} onChange={handleFormChange} placeholder="https://..." />
                  {formErrors.image && <p className="form-error">{formErrors.image}</p>}
                  {form.image && (
                    <img src={form.image} alt="preview" className="modal-image-preview" onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description *</label>
                  <textarea name="description" className={`form-input${formErrors.description ? ' error' : ''}`} value={form.description} onChange={handleFormChange} placeholder="Product description..." rows={3} style={{ resize: 'vertical' }} />
                  {formErrors.description && <p className="form-error">{formErrors.description}</p>}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="auth-spinner" /> : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal modal--small">
            <div className="modal-header">
              <h2>Delete Product</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ marginBottom: '8px', color: 'var(--text)' }}>
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: 'var(--error)' }} onClick={() => handleDelete(deleteConfirm._id)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
