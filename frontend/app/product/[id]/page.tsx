'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Product, formatVND } from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useCompare } from '@/contexts/CompareContext';
import { ShoppingCart, ArrowLeftRight, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);

  const { addToCart } = useCart();
  const { addToCompare } = useCompare();

  useEffect(() => {
    if (!id) return;
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchAPI(`/api/products/${id}`);
        if (!data) {
          setError('Không tìm thấy sản phẩm.');
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Đã xảy ra lỗi khi tải thông tin sản phẩm.');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '20px' }}>Không tìm thấy sản phẩm</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>{error || 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}</p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={18} /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

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

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Breadcrumbs & Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Trang chủ</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</span>
        </div>
        <button 
          onClick={() => router.back()} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {/* Main Product Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '40px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: 'var(--shadow-md)'
      }} className="product-detail-grid">
        {/* Left Column: Media Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(44, 36, 22, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextMedia}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(44, 36, 22, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  <ChevronRight size={24} />
                </button>
                
                {/* Media index text indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '15px',
                  right: '15px',
                  backgroundColor: 'rgba(44, 36, 22, 0.7)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  zIndex: 5
                }}>
                  {mediaIndex + 1} / {mediaList.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail selector */}
          {mediaList.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
              {mediaList.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setMediaIndex(idx)}
                  style={{
                    width: '60px',
                    height: '60px',
                    border: idx === mediaIndex ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: '#000',
                    transition: 'border-color 0.2s'
                  }}
                >
                  {m.media_type === 'video' ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 600 }}>VIDEO</div>
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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          {/* Title */}
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: '15px',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)'
          }}>
            {product.name}
          </h1>

          {/* Category tag */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>
              Danh mục: {product.categories?.name || 'Sản phẩm'}
            </span>
          </div>

          {/* Technical Specifications */}
          <div style={{ marginBottom: '25px', flexGrow: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.5px' }}>
              Thông số kỹ thuật:
            </h4>
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '16px',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              maxHeight: '300px',
              overflowY: 'auto',
              lineHeight: '1.6'
            }}>
              {product.specifications || 'Chưa có thông số kỹ thuật chi tiết.'}
            </div>
          </div>

          {/* Price & Stock */}
          <div style={{
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Giá bán:</div>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatVND(product.price)}
              </span>
            </div>
            <span style={{
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.9rem',
              backgroundColor: product.quantity > 0 ? 'rgba(39, 174, 96, 0.1)' : 'rgba(192, 57, 43, 0.1)',
              color: product.quantity > 0 ? 'var(--success)' : 'var(--danger)',
              fontWeight: 600
            }}>
              {product.quantity > 0 ? `Còn lại: ${product.quantity} sản phẩm` : 'Hết hàng'}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={handleAddToCart}
              disabled={product.quantity <= 0}
              className="btn btn-primary"
              style={{ flexGrow: 2, padding: '15px', fontSize: '1rem' }}
            >
              <ShoppingCart size={20} /> Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleAddToCompare}
              className="btn btn-secondary"
              style={{ flexGrow: 1, padding: '15px', fontSize: '1rem' }}
            >
              <ArrowLeftRight size={20} /> So sánh sản phẩm
            </button>
          </div>
        </div>
      </div>

      {/* Responsive details grid styles */}
      <style jsx global>{`
        @media (max-width: 992px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
