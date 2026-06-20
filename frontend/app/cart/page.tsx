'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatVND } from '@/components/ProductCard';
import { fetchAPI } from '@/lib/api';
import { Trash2, ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Hà Nội'); // Hà Nội | Khác
  const [deliveryMethod, setDeliveryMethod] = useState('Đến lấy'); // Đến lấy | Đặt giao
  const [address, setAddress] = useState('');
  const [pickupDatetime, setPickupDatetime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Thanh toán sau'); // Thanh toán sau | Chuyển khoản
  const [note, setNote] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle City change logic
  useEffect(() => {
    if (city === 'Khác') {
      setDeliveryMethod('Đặt giao');
    }
  }, [city]);

  // Handle Delivery Method change logic
  useEffect(() => {
    if (deliveryMethod === 'Đặt giao') {
      setPaymentMethod('Chuyển khoản');
      setPickupDatetime('');
    } else {
      setAddress('');
    }
  }, [deliveryMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (cart.length === 0) {
      setErrorMsg('Giỏ hàng của bạn đang trống.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Vui lòng điền Họ và tên.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Vui lòng điền Số điện thoại.');
      return;
    }
    if (deliveryMethod === 'Đặt giao' && !address.trim()) {
      setErrorMsg('Vui lòng điền Địa chỉ chi tiết để giao hàng.');
      return;
    }
    if (deliveryMethod === 'Đến lấy' && !pickupDatetime) {
      setErrorMsg('Vui lòng chọn Ngày giờ đến lấy.');
      return;
    }

    try {
      setLoading(true);
      
      const orderPayload = {
        customer_name: customerName,
        phone,
        city,
        delivery_method: deliveryMethod,
        address: deliveryMethod === 'Đặt giao' ? address : undefined,
        pickup_datetime: deliveryMethod === 'Đến lấy' ? pickupDatetime : undefined,
        payment_method: paymentMethod,
        note: note || undefined,
        items: cart.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url
        })),
        total_price: getCartTotal()
      };

      await fetchAPI('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      // Clear the cart and trigger success state
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          padding: '40px 30px',
          border: '2px solid var(--bg-dark)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
            Đặt hàng thành công
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '0.95rem' }}>
            Cảm ơn bạn đã tin tưởng BANMAYFILM! Chúng tôi đã nhận được đơn hàng của bạn.
            {paymentMethod === 'Chuyển khoản' && (
              <strong style={{ display: 'block', marginTop: '10px', color: 'var(--danger)' }}>
                Vui lòng gửi ảnh chụp màn hình chuyển khoản vào tài khoản Instagram @banmayfilm để xác nhận!
              </strong>
            )}
          </p>
          <Link href="/" className="btn btn-primary" style={{ width: '100%' }}>
            <ArrowLeft size={16} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '40px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Link>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '30px' }}>
        Giỏ hàng của bạn
      </h1>

      {cart.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          color: 'var(--text-secondary)'
        }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 15px', color: 'var(--text-secondary)' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '20px' }}>Giỏ hàng của bạn đang trống.</p>
          <Link href="/" className="btn btn-primary">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="cart-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '30px'
        }}>
          {/* Left: Customer Information Form */}
          <div>
            <form onSubmit={handleSubmit} className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>
                Thông tin khách hàng
              </h2>

              {errorMsg && (
                <div style={{
                  backgroundColor: 'rgba(192, 57, 43, 0.1)',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  marginBottom: '20px',
                  fontWeight: 500
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Name */}
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  className="form-control"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* City */}
              <div className="form-group">
                <label className="form-label">Thành phố *</label>
                <select
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Delivery Method */}
              <div className="form-group">
                <label className="form-label">Hình thức giao hàng *</label>
                <select
                  className="form-control"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                >
                  <option value="Đến lấy" disabled={city === 'Khác'}>
                    Đến lấy (Chỉ áp dụng tại Hà Nội)
                  </option>
                  <option value="Đặt giao">Đặt giao</option>
                </select>
              </div>

              {/* Detailed Address */}
              <div className="form-group">
                <label className="form-label">Địa chỉ chi tiết</label>
                <textarea
                  className="form-control"
                  rows={2}
                  disabled={deliveryMethod === 'Đến lấy'}
                  placeholder={
                    deliveryMethod === 'Đến lấy'
                      ? 'Nếu bạn chọn Đến lấy thì không phải điền ô này'
                      : 'Nhập địa chỉ giao hàng chi tiết'
                  }
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Pickup Time */}
              <div className="form-group">
                <label className="form-label">Ngày giờ đến lấy</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  disabled={deliveryMethod !== 'Đến lấy'}
                  value={pickupDatetime}
                  onChange={(e) => setPickupDatetime(e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label className="form-label">Hình thức thanh toán *</label>
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Thanh toán sau" disabled={deliveryMethod === 'Đặt giao'}>
                    Thanh toán sau (Chỉ áp dụng khi Đến lấy)
                  </option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                </select>
              </div>

              {/* Transfer Info */}
              {paymentMethod === 'Chuyển khoản' && (
                <div style={{
                  backgroundColor: 'var(--accent-light)',
                  border: '1px solid var(--accent)',
                  borderRadius: '4px',
                  padding: '12px 15px',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'center'
                }}>
                  Thông tin chuyển khoản: <br />
                  <span style={{ fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                    MB Bank - NGUYEN PHUONG ANH - 0335532664
                  </span>
                </div>
              )}

              {/* Note */}
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Ghi chú (Không bắt buộc)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Ghi chú thêm cho cửa hàng..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Note Warning Alert */}
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '25px' }}>
                * Bạn hãy gửi ảnh màn hình chuyển khoản vào tài khoản IG @banmayfilm
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                {loading ? 'Đang xử lý đơn hàng...' : 'Xác nhận đặt hàng'}
              </button>
            </form>
          </div>

          {/* Right: Cart Item Listings */}
          <div>
            <div className="card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>
                Tóm tắt đơn hàng
              </h2>

              {/* Item list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                {cart.map((item) => (
                  <div 
                    key={item.product_id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '15px'
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=100'}
                      alt={item.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)'
                      }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
                        {formatVND(item.price)}
                      </span>
                      
                      {/* Quantity Editor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Số lượng:</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            style={{ width: '24px', height: '24px', border: '1px solid var(--border-color)', borderRadius: '2px 0 0 2px', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            -
                          </button>
                          <span style={{ display: 'inline-flex', width: '32px', height: '24px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            style={{ width: '24px', height: '24px', border: '1px solid var(--border-color)', borderRadius: '0 2px 2px 0', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div style={{
                borderTop: '2px solid var(--bg-dark)',
                paddingTop: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>Tổng tiền:</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatVND(getCartTotal())}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive layout global rules overrides */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
