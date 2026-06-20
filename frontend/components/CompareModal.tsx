'use client';

import React from 'react';
import { useCompare } from '@/contexts/CompareContext';
import { formatVND } from './ProductCard';
import { X, Trash2 } from 'lucide-react';

export const CompareModal: React.FC = () => {
  const {
    compareList,
    removeFromCompare,
    isCompareModalOpen,
    setCompareModalOpen,
  } = useCompare();

  if (!isCompareModalOpen || compareList.length === 0) return null;

  const prices = compareList.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const showBestPrice = compareList.length > 1;

  return (
    <div className="modal-overlay" onClick={() => setCompareModalOpen(false)}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '24px',
          maxWidth: '900px',
          position: 'relative'
        }}
      >
        {/* Red X Close Button */}
        <button 
          onClick={() => setCompareModalOpen(false)} 
          className="close-btn"
          title="Đóng"
        >
          <X size={18} />
        </button>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '20px',
          fontFamily: 'var(--font-heading)',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px'
        }}>
          So sánh sản phẩm
        </h2>

        {/* Comparison Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.95rem',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--bg-dark)' }}>
                <th style={{
                  padding: '12px',
                  width: '20%',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-secondary)',
                  borderRight: '1px solid var(--border-color)'
                }}>
                  Tiêu chí
                </th>
                {compareList.map((product) => (
                  <th 
                    key={product.id} 
                    style={{
                      padding: '12px',
                      width: `${80 / compareList.length}%`,
                      fontWeight: 600,
                      textAlign: 'center',
                      verticalAlign: 'top',
                      borderRight: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=150'}
                        alt={product.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                      />
                      <span style={{ fontSize: '0.95rem', display: 'block', minHeight: '40px', lineHeight: 1.3 }}>
                        {product.name}
                      </span>
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="btn btn-outline-danger"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={12} /> Xóa
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Giá */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{
                  padding: '12px',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-secondary)',
                  borderRight: '1px solid var(--border-color)'
                }}>
                  Giá bán
                </td>
                {compareList.map((product) => {
                  const isLowest = showBestPrice && product.price === minPrice;
                  return (
                    <td 
                      key={product.id} 
                      style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: isLowest ? 'var(--success)' : 'var(--accent)',
                        fontSize: '1.1rem',
                        borderRight: '1px solid var(--border-color)',
                        backgroundColor: isLowest ? 'rgba(39, 174, 96, 0.05)' : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span>{formatVND(product.price)}</span>
                        {isLowest && (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: 'var(--success)',
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Giá tốt nhất
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Danh mục */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{
                  padding: '12px',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-secondary)',
                  borderRight: '1px solid var(--border-color)'
                }}>
                  Danh mục
                </td>
                {compareList.map((product) => (
                  <td 
                    key={product.id} 
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid var(--border-color)'
                    }}
                  >
                    {product.category_name || 'Khác'}
                  </td>
                ))}
              </tr>

              {/* Row 3: Thông số kỹ thuật */}
              <tr>
                <td style={{
                  padding: '12px',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-secondary)',
                  borderRight: '1px solid var(--border-color)',
                  verticalAlign: 'top'
                }}>
                  Thông số kỹ thuật
                </td>
                {compareList.map((product) => (
                  <td 
                    key={product.id} 
                    style={{
                      padding: '12px',
                      verticalAlign: 'top',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      borderRight: '1px solid var(--border-color)'
                    }}
                  >
                    {product.specifications || 'Chưa có thông số kỹ thuật chi tiết.'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CompareModal;
