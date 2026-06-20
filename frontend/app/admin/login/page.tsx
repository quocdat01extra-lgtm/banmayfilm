'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { login, isAdmin, isInitialized } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, isInitialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      login(data.token, data.username);
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '40px 20px' }}>
      <div className="card" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '35px 25px',
        border: '2px solid var(--bg-dark)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header styling */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            display: 'inline-flex',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-dark)',
            color: 'var(--bg-primary)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '15px'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Quản trị cửa hàng
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
            Vui lòng đăng nhập bằng tài khoản chủ cửa hàng
          </p>
        </div>

        {/* Error message alerts */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(192, 57, 43, 0.1)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '10px 12px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500
          }}>
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên tài khoản *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Nhập tên tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label className="form-label">Mật khẩu *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <KeyRound size={16} /> {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
