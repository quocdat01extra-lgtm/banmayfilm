'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: string;
  image_url: string;
  display_order: number;
}

export const BannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBanners() {
      try {
        const data = await fetchAPI('/api/banners');
        setBanners(data || []);
      } catch (err) {
        console.error('Failed to load banners:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBanners();
  }, []);

  // Auto slide every 20 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [banners]);

  const handlePrev = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div style={{ height: '350px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border-color)', margin: '20px 0' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Đang tải slide banner...</p>
      </div>
    );
  }

  // Fallback banners if none are uploaded
  const displayBanners = banners.length > 0 ? banners : [
    { id: 'fallback-1', image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop', display_order: 0 },
    { id: 'fallback-2', image_url: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=1200&auto=format&fit=crop', display_order: 1 },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '350px', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-color)', margin: '20px 0', boxShadow: 'var(--shadow-sm)' }}>
      {/* Slides */}
      <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
        {displayBanners.map((banner, index) => (
          <div
            key={banner.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              zIndex: index === currentIndex ? 1 : 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.image_url}
              alt={`Banner ${index + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Vintage styling overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(44, 36, 22, 0.1), rgba(44, 36, 22, 0.4))',
              pointerEvents: 'none'
            }} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {displayBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(44, 36, 22, 0.6)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 36, 22, 0.6)'}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(44, 36, 22, 0.6)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 36, 22, 0.6)'}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {displayBanners.length > 1 && (
        <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '8px' }}>
          {displayBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? 'var(--accent)' : 'rgba(245, 240, 232, 0.6)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default BannerSlider;
