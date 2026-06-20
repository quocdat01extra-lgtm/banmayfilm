import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { CompareProvider } from '@/contexts/CompareContext';
import Header from '@/components/Header';
import CompareBar from '@/components/CompareBar';
import CompareModal from '@/components/CompareModal';

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
    <html lang="vi">
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
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--bg-primary)', marginBottom: '10px', letterSpacing: '1px' }}>BANMAYFILM</p>
                    <p style={{ marginBottom: '8px' }}>Địa chỉ: MB Bank - NGUYEN PHUONG ANH - 0335532664</p>
                    <p style={{ color: 'var(--text-secondary)' }}>&copy; {new Date().getFullYear()} BANMAYFILM. All rights reserved.</p>
                  </div>
                </footer>

                {/* Fixed Bottom Comparison Elements */}
                <CompareBar />
                <CompareModal />
              </div>
            </CompareProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
