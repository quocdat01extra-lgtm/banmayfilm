'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { ProductCard, Product } from './ProductCard';
import { Grid, Eye } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  display_order: number;
}

export const ProductGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch categories & products on load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const catData = await fetchAPI('/api/categories');
        setCategories(catData || []);
        
        const prodData = await fetchAPI('/api/products');
        // Filter out inactive products for the customer view
        const activeProds = (prodData || []).filter((p: Product) => p.is_active);
        setProducts(activeProds);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="product-section-layout" style={{
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      gap: '30px',
      margin: '40px 0'
    }}>
      {/* Category Navigation - Sidebar on Desktop, Horizontal Tabs inline for Mobile */}
      <div className="category-navigation">
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          marginBottom: '15px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Grid size={18} /> Danh mục
        </h3>
        
        {/* Desktop Sidebar List */}
        <ul className="desktop-categories" style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <li>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: selectedCategory === null ? 'var(--bg-dark)' : 'transparent',
                color: selectedCategory === null ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontWeight: selectedCategory === null ? 600 : 500,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onMouseOver={(e) => {
                if (selectedCategory !== null) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseOut={(e) => {
                if (selectedCategory !== null) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Tất cả sản phẩm
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: selectedCategory === cat.id ? 'var(--bg-dark)' : 'transparent',
                  color: selectedCategory === cat.id ? 'var(--bg-primary)' : 'var(--text-primary)',
                  fontWeight: selectedCategory === cat.id ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  if (selectedCategory !== cat.id) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseOut={(e) => {
                  if (selectedCategory !== cat.id) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Product Grid Area */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.name 
              : 'Tất cả sản phẩm'
            }
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {filteredProducts.length} sản phẩm
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>Không tìm thấy sản phẩm nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>

      {/* Responsive layout styles global overrides */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .product-section-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .category-navigation {
            border-bottom: none !important;
          }
          .desktop-categories {
            flex-direction: row !important;
            overflow-x: auto !important;
            padding-bottom: 8px !important;
            gap: 8px !important;
          }
          .desktop-categories li {
            flex-shrink: 0 !important;
          }
          .desktop-categories button {
            text-align: center !important;
            padding: 8px 16px !important;
            white-space: nowrap !important;
            border: 1px solid var(--border-color) !important;
          }
        }
      `}</style>
    </div>
  );
};
export default ProductGrid;
