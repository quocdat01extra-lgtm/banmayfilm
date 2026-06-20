import React from 'react';
import BannerSlider from '@/components/BannerSlider';
import ProductGrid from '@/components/ProductGrid';

export default function Home() {
  return (
    <div className="container">
      {/* Auto-sliding Banner Section */}
      <BannerSlider />

      {/* Main Shop Section with Categories and Product Grid */}
      <ProductGrid />
    </div>
  );
}
