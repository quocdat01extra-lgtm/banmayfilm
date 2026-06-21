'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: string;
  phone: string;
  rating: number;
  content: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
  onReviewAdded?: () => void;
  onReviewDeleted?: () => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, onReviewAdded, onReviewDeleted }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { isAdmin } = useAuth();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI(`/api/reviews/${productId}`);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await fetchAPI(`/api/reviews/${productId}`, {
        method: 'POST',
        body: JSON.stringify({ phone, rating, content })
      });
      
      setPhone('');
      setRating(0);
      setContent('');
      
      await fetchReviews();
      if (onReviewAdded) onReviewAdded();
      
      alert('Cảm ơn bạn đã đánh giá sản phẩm!');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    
    try {
      await fetchAPI(`/api/reviews/${id}`, {
        method: 'DELETE'
      });
      await fetchReviews();
      if (onReviewDeleted) onReviewDeleted();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa đánh giá');
    }
  };

  const formatPhone = (p: string) => {
    if (p.length < 6) return p;
    return p.substring(0, p.length - 3) + '***';
  };

  return (
    <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', fontFamily: 'var(--font-heading)' }}>
        Đánh giá sản phẩm
      </h3>
      
      {/* Form Đánh giá */}
      <form onSubmit={handleSubmit} style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '25px',
        border: '1px solid var(--border-color)'
      }}>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>Số điện thoại *</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>Đánh giá *</label>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '40px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0',
                    cursor: 'pointer',
                    color: star <= rating ? '#F59E0B' : 'var(--border-color)'
                  }}
                >
                  <Star size={24} fill={star <= rating ? '#F59E0B' : 'none'} />
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>Nội dung đánh giá *</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            rows={3}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              resize: 'vertical'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={submitting}
          className="btn btn-primary"
          style={{ padding: '8px 20px' }}
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>

      {/* Danh sách Đánh giá */}
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '15px' }}>
          Đánh giá từ khách hàng ({reviews.length})
        </h4>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ 
                padding: '15px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Khách hàng: {formatPhone(review.phone)}</span>
                      <span style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            size={14} 
                            fill={star <= review.rating ? '#F59E0B' : 'none'} 
                            color={star <= review.rating ? '#F59E0B' : 'var(--border-color)'} 
                          />
                        ))}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(review.id)}
                      title="Xóa đánh giá"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--danger)', 
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
