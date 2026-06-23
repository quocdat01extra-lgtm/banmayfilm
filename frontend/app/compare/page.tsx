'use client';

import React from 'react';
import Link from 'next/link';
import { useCompare } from '@/contexts/CompareContext';
import { formatVND } from '@/components/ProductCard';
import { Trash2, ArrowLeft, ArrowLeftRight, Star } from 'lucide-react';

export default function ComparePage() {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
  } = useCompare();

  const specLabels: Record<string, string> = {
    tieu_cu: 'Tiêu cự',
    khau_do: 'Khẩu độ',
    af: 'AF',
    kich_thuoc: 'Kích thước',
    loai_pin: 'Loại pin',
    man_lcd: 'Màn LCD',
    dieu_chinh_flash: 'Điều chỉnh Flash',
    chong_mat_do: 'Chống mắt đỏ',
    dieu_chinh_iso_tu_dong: 'Điều chỉnh ISO tự động',
    thang_diem: 'Thang điểm',
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

  if (compareList.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <ArrowLeftRight size={48} style={{ color: 'var(--text-secondary)', marginBottom: '20px' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '15px' }}>Chưa có sản phẩm để so sánh</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1rem' }}>
          Hãy thêm ít nhất 2 sản phẩm vào danh sách so sánh từ trang chủ.
        </p>
        <Link href="/" className="btn btn-primary" style={{ padding: '12px 24px' }}>
          <ArrowLeft size={18} /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Breadcrumbs & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Trang chủ</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>So sánh sản phẩm</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={clearCompare}
            className="btn btn-outline-danger"
            style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={14} /> Xóa tất cả
          </button>
          <Link href="/" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Quay lại
          </Link>
        </div>
      </div>

      {/* Page Title */}
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        fontFamily: 'var(--font-heading)',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <ArrowLeftRight size={24} /> So sánh sản phẩm
        <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          ({compareList.length} sản phẩm)
        </span>
      </h1>

      {compareList.length < 2 && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'rgba(184, 134, 11, 0.08)',
          border: '1px solid var(--accent)',
          borderRadius: '6px',
          marginBottom: '25px',
          fontSize: '0.9rem',
          color: 'var(--accent)',
          fontWeight: 500
        }}>
          ⚠ Bạn cần thêm ít nhất 2 sản phẩm để tiến hành so sánh.
        </div>
      )}

      {/* Comparison Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: 'var(--shadow-md)',
        overflowX: 'auto'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.95rem',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--bg-dark)' }}>
              <th style={{
                padding: '14px',
                width: '18%',
                fontWeight: 700,
                backgroundColor: 'var(--bg-primary)',
                borderRight: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-secondary)'
              }}>
                Tiêu chí
              </th>
              {compareList.map((product) => (
                <th 
                  key={product.id} 
                  style={{
                    padding: '14px',
                    width: `${82 / compareList.length}%`,
                    fontWeight: 600,
                    textAlign: 'center',
                    verticalAlign: 'top',
                    borderRight: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=150'}
                      alt={product.name}
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                    <Link href={`/product/${product.id}`} style={{ fontSize: '1rem', fontWeight: 600, display: 'block', minHeight: '48px', lineHeight: 1.3, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {product.name}
                    </Link>
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="btn btn-outline-danger"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
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
                padding: '14px',
                fontWeight: 700,
                backgroundColor: 'var(--bg-primary)',
                borderRight: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-secondary)'
              }}>
                Giá bán
              </td>
              {compareList.map((product) => (
                <td 
                  key={product.id} 
                  style={{
                    padding: '14px',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    fontSize: '1.15rem',
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
                padding: '14px',
                fontWeight: 700,
                backgroundColor: 'var(--bg-primary)',
                borderRight: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-secondary)'
              }}>
                Danh mục
              </td>
              {compareList.map((product) => (
                <td 
                  key={product.id} 
                  style={{
                    padding: '14px',
                    textAlign: 'center',
                    borderRight: '1px solid var(--border-color)',
                    fontWeight: 500
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
                  padding: '14px',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-primary)',
                  borderRight: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
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
                      padding: '14px',
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

            {/* Row: Đánh giá (Inserted after specs) */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{
                padding: '14px',
                fontWeight: 700,
                backgroundColor: 'var(--bg-primary)',
                borderRight: '1px solid var(--border-color)',
                fontSize: '0.9rem',
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
                    padding: '14px',
                    textAlign: 'center',
                    borderRight: '1px solid var(--border-color)',
                    fontWeight: 500
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.95rem' }}>
                    <Star size={16} fill="#F59E0B" color="#F59E0B" />
                    <span>{product.avg_rating || 0}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
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
                  padding: '14px',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-primary)',
                  borderRight: '1px solid var(--border-color)',
                  verticalAlign: 'top',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-secondary)'
                }}>
                  Thông số khác
                </td>
                {compareList.map((product, idx) => {
                  const specs = allSpecs[idx];
                  // If it's a parsed JSON, it's already shown in structured rows
                  const value = specs === null ? (product.specifications || 'Chưa có thông số') : '—';
                  return (
                    <td key={product.id} style={{
                      padding: '14px',
                      verticalAlign: 'top',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
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

      {/* Responsive styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
