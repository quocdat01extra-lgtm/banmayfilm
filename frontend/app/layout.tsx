import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { CompareProvider } from '@/contexts/CompareContext';
import Header from '@/components/Header';
import CompareBar from '@/components/CompareBar';

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BANMAYFILM - Máy Ảnh Film Vintage',
  description: 'Cửa hàng máy ảnh film, phụ kiện pin và cuộn film chất lượng cao. Phong cách vintage hoài cổ.',
  keywords: 'máy ảnh film, film camera, film 35mm, mua máy ảnh film, banmayfilm, pin máy ảnh, film kodak, film fuji',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <CompareProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Header Navigation */}
                <Header />

                {/* Main Content Area */}
                <main style={{ flexGrow: 1, paddingBottom: '120px' }}>
                  {children}
                </main>

                {/* Footer Section */}
                <footer style={{
                  backgroundColor: 'var(--bg-dark)',
                  color: 'var(--border-color)',
                  padding: '30px 0',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  borderTop: '1px solid var(--border-color)',
                  marginTop: 'auto'
                }}>
                  <div className="container">
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', color: 'var(--bg-primary)', marginBottom: '10px', letterSpacing: '1px' }}>BANMAYFILM</p>
                    <p style={{ marginBottom: '8px' }}>Địa chỉ: MB Bank - NGUYEN PHUONG ANH - 0335532664</p>
                    <div className="footer-social-links">
                      <a href="https://www.tiktok.com/@bn.my.film?_r=1&_t=ZS-91rHcEmfS2k" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="TikTok">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                        </svg>
                      </a>
                      <a href="https://www.instagram.com/banmayfilm" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="Instagram">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>&copy; {new Date().getFullYear()} BANMAYFILM. All rights reserved.</p>
                  </div>
                </footer>

                {/* Fixed Bottom Comparison Bar */}
                <CompareBar />
              </div>
            </CompareProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
