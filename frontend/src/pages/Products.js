import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Products.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home', label: 'Home & Living' },
  { id: 'sports', label: 'Sports' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'books', label: 'Books' },
  { id: 'toys', label: 'Toys' },
  { id: 'food', label: 'Food' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name', label: 'Name A–Z' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'all') params.set('category', category);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      params.set('page', page);
      params.set('limit', 12);
      if (searchParams.get('featured') === 'true') params.set('featured', 'true');

      const { data } = await axios.get(`${API_URL}/products?${params.toString()}`);
      setProducts(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error('Failed to load products:', err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, minPrice, maxPrice, page, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync URL params
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'all') params.category = category;
    if (sort && sort !== 'createdAt') params.sort = sort;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (page > 1) params.page = page;
    setSearchParams(params);
  }, [search, category, sort, minPrice, maxPrice, page, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setSort('createdAt');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  const hasFilters = search || category !== 'all' || sort !== 'createdAt' || minPrice || maxPrice;

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="products-page__header">
          <div>
            <h1 className="products-page__title">
              {category !== 'all'
                ? CATEGORIES.find((c) => c.id === category)?.label || 'Products'
                : search
                ? `Results for "${search}"`
                : 'All Products'}
            </h1>
            <p className="products-page__count">
              {loading ? 'Loading...' : `${pagination.total} products found`}
            </p>
          </div>

          <div className="products-page__controls">
            <select className="products-page__sort" value={sort} onChange={handleSortChange}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              className={`products-page__filter-btn${filtersOpen ? ' active' : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasFilters && <span className="products-page__filter-dot" />}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <div className="filters-panel">
            {/* Search */}
            <form className="filters-panel__search" onSubmit={handleSearch}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => { setSearch(''); setPage(1); }}>
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Price range */}
            <div className="filters-panel__price">
              <span className="filters-panel__label">Price Range</span>
              <div className="filters-panel__price-inputs">
                <input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  min={0}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  min={0}
                />
              </div>
            </div>

            {hasFilters && (
              <button className="filters-panel__clear" onClick={clearFilters}>
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Category tabs */}
        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab${category === cat.id ? ' active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="page-loader">
            <div className="spinner" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="pagination__btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className="pagination__dots">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`pagination__btn${page === p ? ' active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  className="pagination__btn"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Search size={48} />
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria.</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
