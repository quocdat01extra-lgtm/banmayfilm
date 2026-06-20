'use client';

import React, { useState } from 'react';
import { Product, formatVND } from './ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useCompare } from '@/contexts/CompareContext';
import { ShoppingCart, ArrowLeftRight, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { addToCompare } = useCompare();
  const [mediaIndex, setMediaIndex] = useState(0);

  const mediaList = product.product_media && product.product_media.length > 0 
    ? product.product_media.sort((a, b) => a.display_order - b.display_order)
    : [{ id: 'fallback', media_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop', media_type: 'image', display_order: 0 }];

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.product_media?.find(m => m.media_type === 'image')?.media_url
    });
    alert(`Đã thêm ${product.name} vào giỏ hàng.`);
  };

  const handleAddToCompare = () => {
    addToCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      specifications: product.specifications,
      image_url: product.product_media?.find(m => m.media_type === 'image')?.media_url,
      category_name: product.categories?.name
    });
  };

  const currentMedia = mediaList[mediaIndex];

  const renderSpecifications = () => {
    if (!product.specifications) return 'Chưa có thông số kỹ thuật chi tiết.';
    
    try {
      const parsed = JSON.parse(product.specifications);
      const catName = product.categories?.name;
      
      if (catName === 'Máy ảnh') {
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <tbody>
              {parsed.tieu_cu && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600, width: '40%' }}>Tiêu cự</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.tieu_cu}</td></tr>}
              {parsed.khau_do && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Khẩu độ</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.khau_do}</td></tr>}
              {parsed.chat_luong_anh && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Chất lượng ảnh</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.chat_luong_anh}</td></tr>}
              {parsed.af && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>AF</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.af}</td></tr>}
              {parsed.chong_nuoc && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Chống nước</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.chong_nuoc}</td></tr>}
              {parsed.kich_thuoc && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Kích thước</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.kich_thuoc}</td></tr>}
              {parsed.loai_pin && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Loại pin</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.loai_pin}</td></tr>}
            </tbody>
          </table>
        );
      } else if (catName === 'Film') {
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <tbody>
              {parsed.kho_film && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600, width: '40%' }}>Khổ film</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.kho_film}</td></tr>}
              {parsed.so_kieu && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Số kiểu</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.so_kieu}</td></tr>}
              {parsed.date && <tr><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Date</td><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>{parsed.date}</td></tr>}
            </tbody>
          </table>
        );
      }
      return product.specifications;
    } catch {
      return product.specifications;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '24px',
          maxWidth: '850px',
          position: 'relative'
        }}
      >
        {/* Red X Close Button */}
        <button 
          onClick={onClose} 
          className="close-btn"
          title="Đóng"
        >
          <X size={18} />
        </button>

        {/* Modal Layout Grid */}
        <div className="modal-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginTop: '15px'
        }}>
          {/* Left Column: Media Box */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* Main square media container */}
            <div style={{
              width: '100%',
              paddingBottom: '100%', // 1:1 Square box
              position: 'relative',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#000',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {currentMedia.media_type === 'video' ? (
                <video
                  src={currentMedia.media_url}
                  controls
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentMedia.media_url}
                  alt={product.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}

              {/* Slider controls */}
              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(44, 36, 22, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 5
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(44, 36, 22, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 5
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  {/* Media index text indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(44, 36, 22, 0.7)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    zIndex: 5
                  }}>
                    {mediaIndex + 1} / {mediaList.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail selector */}
            {mediaList.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {mediaList.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setMediaIndex(idx)}
                    style={{
                      width: '50px',
                      height: '50px',
                      border: idx === mediaIndex ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: '#000'
                    }}
                  >
                    {m.media_type === 'video' ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem' }}>VIDEO</div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information Panel */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            {/* Title */}
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '15px',
              fontFamily: 'var(--font-heading)'
            }}>
              {product.name}
            </h2>

            {/* Category tag */}
            <div style={{ marginBottom: '15px' }}>
              <span style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}>
                Danh mục: {product.categories?.name || 'Sản phẩm'}
              </span>
            </div>

            {/* Technical Specifications */}
            <div style={{ marginBottom: '20px', flexGrow: 1 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Thông số kỹ thuật:
              </h4>
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '12px',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                maxHeight: '180px',
                overflowY: 'auto'
              }}>
                {renderSpecifications()}
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatVND(product.price)}
              </span>
              <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: product.quantity > 0 ? 'var(--text-secondary)' : 'var(--danger)', fontWeight: 600 }}>
                {product.quantity > 0 ? `Còn lại: ${product.quantity}` : 'Hết hàng'}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className="btn btn-primary"
                style={{ flexGrow: 2, padding: '12px', fontSize: '0.65rem' }}
              >
                <ShoppingCart size={18} /> Thêm vào giỏ hàng
              </button>
              <button
                onClick={handleAddToCompare}
                className="btn btn-secondary"
                style={{ flexGrow: 1, padding: '12px', fontSize: '0.65rem' }}
              >
                <ArrowLeftRight size={18} /> So sánh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Modal Styles inline */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .modal-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .modal-content {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
export default ProductModal;
