'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, User, ShieldAlert, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { getItemCount } = useCart();
  const { isAdmin, logout, isInitialized } = useAuth();
  
  const count = getItemCount();

  return (
    <header className="site-header">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="logo">
          BANMAYFILM
        </Link>
        
        <nav className="header-actions">
          <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', padding: '6px 12px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <ShoppingCart size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Giỏ hàng</span>
            {count > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: 'var(--accent)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {count}
              </span>
            )}
          </Link>
          
          {isInitialized && (
            <>
              {isAdmin ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link href="/admin" className="btn btn-accent" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    <ShieldAlert size={14} /> Admin
                  </Link>
                  <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <Link href="/admin/login" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} /> Đăng nhập
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Header;
