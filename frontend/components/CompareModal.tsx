'use client';

import React from 'react';
import { useCompare } from '@/contexts/CompareContext';
import { formatVND } from './ProductCard';
import { X, Trash2, Star } from 'lucide-react';

export const CompareModal: React.FC = () => {
  const {
    compareList,
    removeFromCompare,
    isCompareModalOpen,
    setCompareModalOpen,
  } = useCompare();

  const specLabels: Record<string, string> = {
    tieu_cu: 'Tiêu cự',
    khau_do: 'Khẩu độ',
    chat_luong_anh: 'Chất lượng ảnh',
    af: 'AF',
    chong_nuoc: 'Chống nước',
    kich_thuoc: 'Kích thước',
    loai_pin: 'Loại pin',
    kho_film: 'Khổ film',
    so_kieu: 'Số kiểu',
    date: 'Date'
  };

  const parseSpecs = (specs: string) => {
    if (!specs) return null;
    try {
      return JSON.parse(specs);
    } catch {
      return null;
    }
  };

  const allSpecs = compareList.map(p => parseSpecs(p.specifications));
  
  const uniqueKeys = new Set<string>();
  allSpecs.forEach(specs => {
    if (specs && typeof specs === 'object') {
      Object.keys(specs).forEach(key => {
        if (specs[key] && specs[key].trim() !== '') uniqueKeys.add(key);
      });
    }
  });

  const orderedKeys = Object.keys(specLabels).filter(key => uniqueKeys.has(key));
  const hasRawSpecs = allSpecs.some(specs => specs === null);

  if (!isCompareModalOpen || compareList.length === 0) return null;

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
          fontSize: '1.1rem',
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
                      <span style={{ fontSize: '0.65rem', display: 'block', minHeight: '40px', lineHeight: 1.3 }}>
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
                {compareList.map((product) => (
                  <td 
                    key={product.id} 
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      fontSize: '0.8rem',
                      borderRight: '1px solid var(--border-color)'
                    }}
                  >
                    {formatVND(product.price)}
                  </td>
                ))}
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

                {/* Structured Specifications Rows */}
                {orderedKeys.map(key => (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{
                      padding: '12px 16px',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-primary)',
                      borderRight: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: 'var(--text-secondary)'
                    }}>
                      {specLabels[key]}
                    </td>
                    {compareList.map((product, idx) => {
                      const specs = allSpecs[idx];
                      const value = specs && specs[key] ? specs[key] : '—';
                      return (
                        <td key={product.id} style={{
                          padding: '12px 16px',
                          textAlign: 'center',
                          borderRight: '1px solid var(--border-color)',
                          fontSize: '0.9rem'
                        }}>
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Row: Đánh giá */}
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{
                    padding: '12px 16px',
                    fontWeight: 700,
                    backgroundColor: 'var(--bg-primary)',
                    borderRight: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--text-secondary)'
                  }}>
                    Đánh giá
                  </td>
                  {compareList.map((product) => (
                    <td 
                      key={product.id} 
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        borderRight: '1px solid var(--border-color)',
                        fontWeight: 500
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.9rem' }}>
                        <Star size={14} fill="#F59E0B" color="#F59E0B" />
                        <span>{product.avg_rating || 0}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          ({product.total_reviews || 0})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row 3: Thông số khác (Raw text) */}
                {hasRawSpecs && (
                  <tr>
                    <td style={{
                      padding: '12px 16px',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-primary)',
                      borderRight: '1px solid var(--border-color)',
                      verticalAlign: 'top',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: 'var(--text-secondary)'
                    }}>
                      Thông số khác
                    </td>
                    {compareList.map((product, idx) => {
                      const specs = allSpecs[idx];
                      const value = specs === null ? (product.specifications || 'Chưa có thông số') : '—';
                      return (
                        <td key={product.id} style={{
                          padding: '12px 16px',
                          verticalAlign: 'top',
                          fontSize: '0.85rem',
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap',
                          borderRight: '1px solid var(--border-color)'
                        }}>
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CompareModal;
