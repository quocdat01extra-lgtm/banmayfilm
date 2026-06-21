'use client';

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

export interface ProductMediaItem {
  id: string;
  media_url: string;
  media_type: string;
  display_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  specifications: string;
  price: number;
  quantity: number;
  is_active: boolean;
  product_media?: ProductMediaItem[];
  product_color_variants?: {
    id: string;
    color_name: string;
    quantity: number;
  }[];
  allow_preorder?: boolean;
  categories?: {
    id: string;
    name: string;
  };
  avg_rating?: number;
  total_reviews?: number;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  isPreorderView?: boolean;
}

export const formatVND = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isPreorderView }) => {
  // Find first image for preview
  const firstImage = product.product_media
    ?.filter((m) => m.media_type === 'image')
    .sort((a, b) => a.display_order - b.display_order)[0]?.media_url;

  const fallbackImage = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=300&auto=format&fit=crop';
  const displayImage = firstImage || fallbackImage;

  return (
    <Link 
      href={`/product/${product.id}${isPreorderView ? '?preorder=true' : ''}`}
      className="card" 
      onClick={onClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '12px',
        overflow: 'hidden',
        color: 'inherit',
        textDecoration: 'none'
      }}
    >
      {/* Product Image Wrapper */}
      <div style={{
        width: '100%',
        paddingBottom: '100%', // 1:1 Aspect Ratio
        position: 'relative',
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        marginBottom: '12px'
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)'
          }}
          className="product-card-img"
        />
      </div>

      {/* Product Details */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px',
          color: 'var(--accent)',
          marginBottom: '4px'
        }}>
          {product.categories?.name || 'Sản phẩm'}
        </span>
        
        <h3 style={{ 
          fontSize: '0.9rem', 
          lineHeight: '1.4', 
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          height: '2.8rem' // Fix height to align prices
        }}>
          {product.name}
        </h3>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: isPreorderView ? 'var(--accent)' : 'var(--text-primary)' 
          }}>
            {isPreorderView ? `Cọc 50%: ${formatVND(Math.round(product.price * 0.5))}` : formatVND(product.price)}
          </span>
          
          <span style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-secondary)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Star size={14} fill="currentColor" color="currentColor" style={{ color: '#F59E0B' }} />
            {product.avg_rating || 0}
          </span>
        </div>
      </div>
    </Link>
  );
};
export default ProductCard;
