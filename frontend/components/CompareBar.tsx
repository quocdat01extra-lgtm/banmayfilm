'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCompare } from '@/contexts/CompareContext';
import { formatVND } from './ProductCard';
import { X, ArrowLeftRight, ChevronUp, ChevronDown } from 'lucide-react';

export const CompareBar: React.FC = () => {
  const router = useRouter();
  const {
    compareList,
    removeFromCompare,
    isBarVisible,
    setBarVisible,
  } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <>
      {isBarVisible ? (
        // Expanded Bar
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-dark)',
          color: 'var(--bg-primary)',
          borderTop: '2px solid var(--accent)',
          padding: '12px 20px',
          zIndex: 900,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'slideFromBottom 0.25s ease-out',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left section: Product list */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              So sánh ({compareList.length}/3):
            </span>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {compareList.map((product) => (
                <div 
                  key={product.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                    gap: '8px'
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=100'}
                    alt={product.name}
                    style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '2px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                      {formatVND(product.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right section: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => router.push('/compare')}
              disabled={compareList.length < 2}
              className="btn btn-accent"
              style={{
                padding: '8px 16px',
                fontSize: '0.75rem',
                opacity: compareList.length < 2 ? 0.6 : 1,
                cursor: compareList.length < 2 ? 'not-allowed' : 'pointer'
              }}
            >
              <ArrowLeftRight size={14} /> So sánh ngay
            </button>
            
            <button
              onClick={() => setBarVisible(false)}
              className="btn btn-secondary"
              style={{
                padding: '8px 12px',
                fontSize: '0.75rem',
                backgroundColor: 'transparent',
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'var(--bg-primary)'
              }}
            >
              <ChevronDown size={16} /> Thu gọn
            </button>
          </div>
        </div>
      ) : (
        // Collapsed Trigger Button
        <button
          onClick={() => setBarVisible(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'var(--bg-dark)',
            color: 'var(--bg-primary)',
            border: '2px solid var(--accent)',
            borderRadius: '30px',
            padding: '10px 20px',
            zIndex: 900,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <ChevronUp size={16} />
          So sánh ({compareList.length})
        </button>
      )}
    </>
  );
};
export default CompareBar;
