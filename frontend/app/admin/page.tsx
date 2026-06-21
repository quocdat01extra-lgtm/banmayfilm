'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAPI, getApiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatVND } from '@/components/ProductCard';
import {
  Image as ImageIcon,
  Grid,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Upload,
  X,
  Check,
  Calendar,
  Phone,
  User,
  MapPin,
  FileText
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Banner {
  id: string;
  image_url: string;
  display_order: number;
}

interface ProductMedia {
  id: string;
  media_url: string;
  media_type: string;
  display_order: number;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  specifications: string;
  price: number;
  quantity: number;
  is_active: boolean;
  product_media?: ProductMedia[];
  categories?: {
    id: string;
    name: string;
  };
  allow_preorder?: boolean;
  product_color_variants?: { id?: string; color_name: string; quantity: number }[];
}

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  delivery_method: string;
  address?: string;
  pickup_datetime?: string;
  payment_method: string;
  note?: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { isAdmin, isInitialized, token, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'orders' | 'preorders' | 'reports'>('products');

  // API Config State
  const [apiUrl, setApiUrl] = useState('');

  // Global lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [preorders, setPreorders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isBannerModalOpen, setBannerModalOpen] = useState(false);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [isMediaModalOpen, setMediaModalOpen] = useState(false);

  // Selected for edits
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProductForMedia, setSelectedProductForMedia] = useState<Product | null>(null);

  // Forms states
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    specifications: '',
    price: 0,
    quantity: 0,
    is_active: true,
    allow_preorder: false,
    color_variants: [] as { id?: string; color_name: string; quantity: number }[]
  });
  
  const [cameraSpecs, setCameraSpecs] = useState({
    tieu_cu: '',
    khau_do: '',
    chat_luong_anh: '',
    af: '',
    chong_nuoc: '',
    kich_thuoc: '',
    loai_pin: ''
  });

  const [filmSpecs, setFilmSpecs] = useState({
    kho_film: '',
    so_kieu: '',
    date: ''
  });

  const parseJSON = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };
  const [bannerForm, setBannerForm] = useState({
    display_order: 0,
    file: null as File | null
  });

  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // Editable Order fields
  const [editingOrderFields, setEditingOrderFields] = useState({
    customer_name: '',
    phone: '',
    city: '',
    delivery_method: '',
    address: '',
    pickup_datetime: '',
    payment_method: '',
    note: '',
    total_price: 0,
    status: ''
  });

  // Revenue reporting state
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<{
    year: number;
    monthlyRevenue: { month: number; revenue: number; orderCount: number }[];
    totalYearRevenue: number;
  } | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthlyDetail, setMonthlyDetail] = useState<{
    year: number;
    month: number;
    products: { product_id: string; name: string; revenue: number; quantity: number }[];
    totalPreorderRevenue?: number;
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchMonthlyDetail = async (month: number) => {
    try {
      setLoadingDetail(true);
      setSelectedMonth(month);
      const data = await fetchAPI(`/api/reports/revenue/monthly?year=${reportYear}&month=${month}`);
      setMonthlyDetail(data);
    } catch (err) {
      console.error('Lỗi tải chi tiết doanh thu tháng:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Protect route
  useEffect(() => {
    if (isInitialized && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isInitialized, router]);

  // Load API Url
  useEffect(() => {
    setApiUrl(getApiUrl());
  }, []);

  // Fetch initial data
  const loadDashboardData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const catData = await fetchAPI('/api/categories');
      setCategories(catData || []);

      const prodData = await fetchAPI('/api/products');
      setProducts(prodData || []);

      const bannerData = await fetchAPI('/api/banners');
      setBanners(bannerData || []);

      const orderData = await fetchAPI('/api/orders');
      setOrders(orderData || []);

      const preorderData = await fetchAPI('/api/preorders');
      setPreorders(preorderData || []);

      // Load report
      const repData = await fetchAPI(`/api/reports/revenue?year=${reportYear}`);
      setReportData(repData);
      setSelectedMonth(null);
      setMonthlyDetail(null);
    } catch (err) {
      console.error('Lỗi tải dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && isInitialized) {
      loadDashboardData();
    }
  }, [isAdmin, isInitialized, reportYear]);

  // Trigger report fetch when year changes
  const fetchReport = async (year: number) => {
    try {
      const data = await fetchAPI(`/api/reports/revenue?year=${year}`);
      setReportData(data);
      setSelectedMonth(null);
      setMonthlyDetail(null);
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
    }
  };

  if (!isInitialized || !isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // --- API configuration save ---
  const saveApiUrlConfig = () => {
    localStorage.setItem('bmf_api_url', apiUrl);
    alert('Đã lưu cấu hình API: ' + apiUrl);
    loadDashboardData();
  };

  // --- Banner creation / deletion ---
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.file) {
      alert('Vui lòng chọn tệp ảnh banner.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', bannerForm.file);
      formData.append('display_order', String(bannerForm.display_order));

      await fetchAPI('/api/banners', {
        method: 'POST',
        body: formData
      });

      alert('Đã thêm banner thành công.');
      setBannerModalOpen(false);
      setBannerForm({ display_order: 0, file: null });
      loadDashboardData();
    } catch (err: any) {
      alert('Lỗi tạo banner: ' + err.message);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    try {
      await fetchAPI(`/api/banners/${id}`, { method: 'DELETE' });
      loadDashboardData();
    } catch (err: any) {
      alert('Lỗi xóa banner: ' + err.message);
    }
  };

  // --- Product CRUD ---
  const openAddProduct = () => {
    setSelectedProduct(null);
    setProductForm({
      name: '',
      category_id: categories[0]?.id || '',
      specifications: '',
      price: 0,
      quantity: 0,
      is_active: true,
      allow_preorder: false,
      color_variants: []
    });
    setCameraSpecs({
      tieu_cu: '', khau_do: '', chat_luong_anh: '', af: '', chong_nuoc: '', kich_thuoc: '', loai_pin: ''
    });
    setFilmSpecs({ kho_film: '', so_kieu: '', date: '' });
    setProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      category_id: product.category_id,
      specifications: product.specifications,
      price: product.price,
      quantity: product.quantity,
      is_active: product.is_active,
      allow_preorder: product.allow_preorder || false,
      color_variants: product.product_color_variants || []
    });

    const catName = categories.find(c => c.id === product.category_id)?.name;
    const parsed = parseJSON(product.specifications);
    
    // Reset first
    setCameraSpecs({
      tieu_cu: '', khau_do: '', chat_luong_anh: '', af: '', chong_nuoc: '', kich_thuoc: '', loai_pin: ''
    });
    setFilmSpecs({ kho_film: '', so_kieu: '', date: '' });
    
    if (parsed) {
      if (catName === 'Máy ảnh') setCameraSpecs({ ...cameraSpecs, ...parsed });
      if (catName === 'Film') setFilmSpecs({ ...filmSpecs, ...parsed });
    }

    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalSpecs = productForm.specifications;
      const catName = categories.find(c => c.id === productForm.category_id)?.name;
      
      if (catName === 'Máy ảnh') {
        finalSpecs = JSON.stringify(cameraSpecs);
      } else if (catName === 'Film') {
        finalSpecs = JSON.stringify(filmSpecs);
      }

      let computedQuantity = Number(productForm.quantity);
      if (productForm.color_variants && productForm.color_variants.length > 0) {
        computedQuantity = productForm.color_variants.reduce((acc, curr) => acc + Number(curr.quantity), 0);
      }

      const payload = {
        ...productForm,
        specifications: finalSpecs,
        price: Number(productForm.price),
        quantity: computedQuantity,
        allow_preorder: productForm.allow_preorder,
        color_variants: productForm.color_variants
      };

      if (selectedProduct) {
        // Update
        await fetchAPI(`/api/products/${selectedProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        alert('Đã cập nhật sản phẩm thành công.');
      } else {
        // Create
        await fetchAPI('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        alert('Đã thêm sản phẩm thành công.');
      }

      setProductModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      alert('Lỗi xử lý sản phẩm: ' + err.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Tất cả ảnh và video đi kèm sẽ bị xóa.')) return;
    try {
      await fetchAPI(`/api/products/${id}`, { method: 'DELETE' });
      loadDashboardData();
    } catch (err: any) {
      alert('Lỗi xóa sản phẩm: ' + err.message);
    }
  };

  // --- Product Media management ---
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile || !selectedProductForMedia) return;

    try {
      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('display_order', '0');

      await fetchAPI(`/api/products/${selectedProductForMedia.id}/media`, {
        method: 'POST',
        body: formData
      });

      alert('Tải lên ảnh/video sản phẩm thành công.');
      setMediaFile(null);
      // Reload product details in modal
      const updated = await fetchAPI(`/api/products/${selectedProductForMedia.id}`);
      setSelectedProductForMedia(updated);
      loadDashboardData();
    } catch (err: any) {
      alert('Lỗi tải tệp lên: ' + err.message);
    }
  };

  const deleteProductMedia = async (mediaId: string) => {
    if (!selectedProductForMedia || !confirm('Bạn có chắc chắn muốn xóa ảnh/video này?')) return;
    try {
      await fetchAPI(`/api/products/${selectedProductForMedia.id}/media/${mediaId}`, {
        method: 'DELETE'
      });
      // Reload product details
      const updated = await fetchAPI(`/api/products/${selectedProductForMedia.id}`);
      setSelectedProductForMedia(updated);
      loadDashboardData();
    } catch (err: any) {
      alert('Lỗi xóa tệp: ' + err.message);
    }
  };

  // --- Order Detailed Editing ---
  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setEditingOrderFields({
      customer_name: order.customer_name,
      phone: order.phone,
      city: order.city,
      delivery_method: order.delivery_method,
      address: order.address || '',
      pickup_datetime: order.pickup_datetime ? new Date(order.pickup_datetime).toISOString().slice(0, 16) : '',
      payment_method: order.payment_method,
      note: order.note || '',
      total_price: order.total_price,
      status: order.status
    });
    setOrderModalOpen(true);
  };

  const handleOrderUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const payload = {
        ...editingOrderFields,
        total_price: Number(editingOrderFields.total_price),
        address: editingOrderFields.delivery_method === 'Đặt giao' ? editingOrderFields.address : null,
        pickup_datetime: editingOrderFields.delivery_method === 'Đến lấy' ? editingOrderFields.pickup_datetime : null
      };

      await fetchAPI(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      alert('Đã cập nhật đơn hàng thành công.');
      setOrderModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      alert('Lỗi cập nhật đơn hàng: ' + err.message);
    }
  };

  return (
    <div className="container" style={{ margin: '40px auto', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ padding: '15px', backgroundColor: 'var(--bg-dark)', color: '#fff', borderRadius: '6px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>BANMAYFILM</h2>
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Quản trị hệ thống</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px' }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: activeTab === 'products' ? 'var(--bg-dark)' : 'transparent',
              color: activeTab === 'products' ? 'var(--bg-primary)' : 'var(--text-primary)',
              fontWeight: activeTab === 'products' ? 600 : 500,
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <Grid size={16} /> Quản lý sản phẩm
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: activeTab === 'banners' ? 'var(--bg-dark)' : 'transparent',
              color: activeTab === 'banners' ? 'var(--bg-primary)' : 'var(--text-primary)',
              fontWeight: activeTab === 'banners' ? 600 : 500,
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <ImageIcon size={16} /> Quản lý banner
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: activeTab === 'orders' ? 'var(--bg-dark)' : 'transparent',
              color: activeTab === 'orders' ? 'var(--bg-primary)' : 'var(--text-primary)',
              fontWeight: activeTab === 'orders' ? 600 : 500,
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <ShoppingBag size={16} /> Lịch sử đơn mua
          </button>

          <button
            onClick={() => setActiveTab('preorders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: activeTab === 'preorders' ? 'var(--bg-dark)' : 'transparent',
              color: activeTab === 'preorders' ? 'var(--bg-primary)' : 'var(--text-primary)',
              fontWeight: activeTab === 'preorders' ? 600 : 500,
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <Calendar size={16} /> Đơn hàng đặt trước
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: activeTab === 'reports' ? 'var(--bg-dark)' : 'transparent',
              color: activeTab === 'reports' ? 'var(--bg-primary)' : 'var(--text-primary)',
              fontWeight: activeTab === 'reports' ? 600 : 500,
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <BarChart3 size={16} /> Báo cáo doanh thu
          </button>
        </div>
      </div>

      {/* Main Dashboard Panel Content */}
      <div className="card" style={{ padding: '25px', minHeight: '80vh', minWidth: 0 }}>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            Đang đồng bộ dữ liệu...
          </div>
        )}

        {!loading && (
          <>
            {/* 1. Products management tab */}
            {activeTab === 'products' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Danh sách sản phẩm</h2>
                  <button onClick={openAddProduct} className="btn btn-accent" style={{ padding: '8px 16px', fontSize: '0.65rem' }}>
                    <Plus size={16} /> Thêm sản phẩm
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--bg-dark)' }}>
                        <th style={{ padding: '10px' }}>Ảnh</th>
                        <th style={{ padding: '10px' }}>Tên sản phẩm</th>
                        <th style={{ padding: '10px' }}>Danh mục</th>
                        <th style={{ padding: '10px' }}>Giá</th>
                        <th style={{ padding: '10px' }}>Kho</th>
                        <th style={{ padding: '10px' }}>Trạng thái</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const thumb = p.product_media?.find(m => m.media_type === 'image')?.media_url;
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumb || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=100'}
                                alt=""
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                              />
                            </td>
                            <td style={{ padding: '10px', fontWeight: 600 }}>{p.name}</td>
                            <td style={{ padding: '10px' }}>{p.categories?.name}</td>
                            <td style={{ padding: '10px', fontWeight: 600 }}>{formatVND(p.price)}</td>
                            <td style={{ padding: '10px' }}>{p.quantity}</td>
                            <td style={{ padding: '10px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: p.is_active ? 'rgba(39, 174, 96, 0.15)' : 'rgba(192, 57, 43, 0.15)',
                                color: p.is_active ? 'var(--success)' : 'var(--danger)'
                              }}>
                                {p.is_active ? 'Kinh doanh' : 'Ngừng bán'}
                              </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    setSelectedProductForMedia(p);
                                    setMediaModalOpen(true);
                                  }}
                                  className="btn btn-secondary"
                                  style={{ padding: '6px', fontSize: '0.8rem' }}
                                  title="Quản lý ảnh/video"
                                >
                                  <Upload size={14} />
                                </button>
                                <button
                                  onClick={() => openEditProduct(p)}
                                  className="btn btn-secondary"
                                  style={{ padding: '6px', fontSize: '0.8rem' }}
                                  title="Sửa thông tin"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => deleteProduct(p.id)}
                                  className="btn btn-outline-danger"
                                  style={{ padding: '6px', fontSize: '0.8rem' }}
                                  title="Xóa"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Banners management tab */}
            {activeTab === 'banners' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Quản lý Banners</h2>
                  <button onClick={() => setBannerModalOpen(true)} className="btn btn-accent" style={{ padding: '8px 16px', fontSize: '0.65rem' }}>
                    <Plus size={16} /> Thêm Banner
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {banners.map((b) => (
                    <div key={b.id} className="card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Thứ tự: {b.display_order}</span>
                        <button
                          onClick={() => deleteBanner(b.id)}
                          className="btn btn-outline-danger"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Orders history management tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                  Lịch sử đơn mua
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="card"
                      onClick={() => openOrderDetail(order)}
                      style={{
                        cursor: 'pointer',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                        position: 'relative'
                      }}
                    >
                      <div>
                        {/* Order status label */}
                        <span style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 600,
                          backgroundColor:
                            order.status === 'COMPLETED' ? 'rgba(39,174,96,0.15)' :
                            order.status === 'CANCELLED' ? 'rgba(192,57,43,0.15)' :
                            'rgba(184,134,11,0.15)',
                          color:
                            order.status === 'COMPLETED' ? 'var(--success)' :
                            order.status === 'CANCELLED' ? 'var(--danger)' :
                            'var(--accent)'
                        }}>
                          {order.status}
                        </span>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', paddingRight: '70px' }}>{order.customer_name}</h3>
                        
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatVND(order.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preorders history management tab */}
            {activeTab === 'preorders' && (
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                  Đơn hàng đặt trước
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {preorders.map((order) => (
                    <div
                      key={order.id}
                      className="card"
                      onClick={() => openOrderDetail(order)}
                      style={{
                        cursor: 'pointer',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                        position: 'relative'
                      }}
                    >
                      <div>
                        {/* Order status label */}
                        <span style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 600,
                          backgroundColor:
                            order.status === 'COMPLETED' ? 'rgba(39,174,96,0.15)' :
                            order.status === 'CANCELLED' ? 'rgba(192,57,43,0.15)' :
                            'rgba(184,134,11,0.15)',
                          color:
                            order.status === 'COMPLETED' ? 'var(--success)' :
                            order.status === 'CANCELLED' ? 'var(--danger)' :
                            'var(--accent)'
                        }}>
                          {order.status}
                        </span>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', paddingRight: '70px' }}>{order.customer_name}</h3>
                        
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatVND(order.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Revenue reports tab */}
            {activeTab === 'reports' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Báo cáo doanh thu</h2>
                  
                  {/* Select Year */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Năm:</span>
                    <select
                      className="form-control"
                      style={{ width: '100px', padding: '6px' }}
                      value={reportYear}
                      onChange={(e) => setReportYear(Number(e.target.value))}
                    >
                      {[2024, 2025, 2026, 2027, 2028].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {reportData && (
                  <div>
                    {/* Summary card */}
                    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--bg-secondary)', marginBottom: '30px' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Tổng doanh thu năm {reportYear}</span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px' }}>
                          {formatVND(reportData.totalYearRevenue)}
                        </h3>
                      </div>
                      <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                        <BarChart3 size={32} />
                      </div>
                    </div>

                    {/* CSS Custom Bar Chart (Visual Excellence and Vintage Ledger Style) */}
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '15px', color: 'var(--text-secondary)' }}>Biểu đồ doanh thu hàng tháng (Click chọn tháng để xem chi tiết)</h4>
                    <div style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '24px',
                      height: '300px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      marginBottom: '30px',
                      position: 'relative'
                    }}>
                      {reportData.monthlyRevenue.map((m) => {
                        // Compute height as percentage of max revenue
                        const maxRev = Math.max(...reportData.monthlyRevenue.map(mr => mr.revenue)) || 1;
                        const pctHeight = (m.revenue / maxRev) * 200; // Cap visual height
                        const isSelected = selectedMonth === m.month;
                        
                        return (
                          <div 
                            key={m.month} 
                            onClick={() => fetchMonthlyDetail(m.month)}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              flexGrow: 1, 
                              position: 'relative',
                              cursor: 'pointer',
                              padding: '10px 0',
                              borderRadius: '4px',
                              backgroundColor: isSelected ? 'rgba(184, 134, 11, 0.08)' : 'transparent',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            {/* Hover info tooltip */}
                            <div style={{
                              position: 'absolute',
                              bottom: `${pctHeight + 25}px`,
                              backgroundColor: 'var(--bg-dark)',
                              color: 'var(--bg-primary)',
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '2px',
                              whiteSpace: 'nowrap',
                              zIndex: 10,
                              boxShadow: 'var(--shadow-sm)',
                              opacity: m.revenue > 0 ? (isSelected ? 1 : 0.8) : 0,
                              fontWeight: isSelected ? 700 : 500
                            }}>
                              {formatVND(m.revenue)}
                            </div>

                            {/* Bar */}
                            <div style={{
                              width: '24px',
                              height: `${pctHeight}px`,
                              backgroundColor: isSelected ? 'var(--accent-hover)' : (m.revenue > 0 ? 'var(--accent)' : 'var(--bg-secondary)'),
                              border: isSelected ? '2px solid var(--bg-dark)' : '1px solid var(--border-color)',
                              borderRadius: '2px 2px 0 0',
                              transition: 'height 0.5s ease-in-out, background-color 0.2s',
                              boxShadow: isSelected ? '0 0 8px rgba(184, 134, 11, 0.3)' : 'none'
                            }} />

                            {/* Month Label */}
                            <span style={{ 
                              fontSize: '0.8rem', 
                              fontWeight: 600, 
                              marginTop: '8px',
                              color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                              textDecoration: isSelected ? 'underline' : 'none'
                            }}>
                              T{m.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Monthly product details drill-down */}
                    {(selectedMonth !== null || loadingDetail || monthlyDetail) && (
                      <div style={{ marginTop: '45px', borderTop: '1px solid var(--border-color)', paddingTop: '25px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                            Chi tiết doanh thu theo sản phẩm - Tháng {selectedMonth} / {reportYear}
                          </h3>
                          <button 
                            onClick={() => {
                              setSelectedMonth(null);
                              setMonthlyDetail(null);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Đóng chi tiết
                          </button>
                        </div>

                        {loadingDetail && (
                          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                            Đang tải chi tiết doanh thu sản phẩm...
                          </div>
                        )}

                        {!loadingDetail && monthlyDetail && (
                          <div>
                            {monthlyDetail.products.length === 0 ? (
                              <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Không có sản phẩm nào phát sinh doanh thu trong tháng này.
                              </div>
                            ) : (
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '2px solid var(--bg-dark)', backgroundColor: 'var(--bg-secondary)' }}>
                                      <th style={{ padding: '10px', fontWeight: 700 }}>Tên sản phẩm</th>
                                      <th style={{ padding: '10px', fontWeight: 700, textAlign: 'center' }}>Số lượng đã bán</th>
                                      <th style={{ padding: '10px', fontWeight: 700, textAlign: 'right' }}>Doanh thu</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {monthlyDetail.products.map((item, idx) => (
                                      <tr key={item.product_id || idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx === 0 ? 'rgba(184, 134, 11, 0.04)' : 'transparent' }}>
                                        <td style={{ padding: '10px', fontWeight: idx === 0 ? 600 : 500 }}>
                                          {item.name}
                                          {idx === 0 && (
                                            <span style={{ marginLeft: '8px', display: 'inline-block', backgroundColor: 'var(--accent)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>BÁN CHẠY NHẤT</span>
                                          )}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '10px', fontWeight: 600, textAlign: 'right', color: idx === 0 ? 'var(--accent)' : 'inherit' }}>
                                          {formatVND(item.revenue)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {monthlyDetail.totalPreorderRevenue !== undefined && monthlyDetail.totalPreorderRevenue > 0 && (
                              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tổng doanh thu Pre-order:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{formatVND(monthlyDetail.totalPreorderRevenue)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

          </>
        )}

      </div>

      {/* MODAL 1: ADD/EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '600px' }}>
            <button onClick={() => setProductModalOpen(false)} className="close-btn"><X size={18} /></button>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>
              {selectedProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Danh mục *</label>
                <select
                  className="form-control"
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Giá bán (VND) *</label>
                <input
                  type="number"
                  required
                  className="form-control"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Biến thể màu sắc & Số lượng kho</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setProductForm({
                        ...productForm,
                        color_variants: [...productForm.color_variants, { color_name: '', quantity: 0 }]
                      });
                    }}
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                  >
                    <Plus size={14} /> Thêm màu
                  </button>
                </div>
                
                {productForm.color_variants.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                    {productForm.color_variants.map((variant, index) => (
                      <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          required
                          placeholder="Màu (VD: Đen, Bạc...)"
                          className="form-control"
                          value={variant.color_name}
                          onChange={(e) => {
                            const newVariants = [...productForm.color_variants];
                            newVariants[index].color_name = e.target.value;
                            setProductForm({ ...productForm, color_variants: newVariants });
                          }}
                          style={{ flex: 1 }}
                        />
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="SL"
                          className="form-control"
                          value={variant.quantity}
                          onChange={(e) => {
                            const newVariants = [...productForm.color_variants];
                            newVariants[index].quantity = Number(e.target.value);
                            setProductForm({ ...productForm, color_variants: newVariants });
                          }}
                          style={{ width: '100px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newVariants = productForm.color_variants.filter((_, i) => i !== index);
                            setProductForm({ ...productForm, color_variants: newVariants });
                          }}
                          className="btn btn-outline-danger"
                          style={{ padding: '8px' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right', fontWeight: 600 }}>
                      Tổng số lượng: {productForm.color_variants.reduce((acc, curr) => acc + Number(curr.quantity), 0)}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-control"
                      placeholder="Số lượng trong kho"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm({ ...productForm, quantity: Number(e.target.value) })}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Sản phẩm không có biến thể màu, nhập trực tiếp số lượng.
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Thông số kỹ thuật / Mô tả *</label>
                {categories.find(c => c.id === productForm.category_id)?.name === 'Máy ảnh' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Tiêu cự</label>
                      <input className="form-control" value={cameraSpecs.tieu_cu} onChange={e => setCameraSpecs({...cameraSpecs, tieu_cu: e.target.value})} placeholder="VD: 50mm" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Khẩu độ</label>
                      <input className="form-control" value={cameraSpecs.khau_do} onChange={e => setCameraSpecs({...cameraSpecs, khau_do: e.target.value})} placeholder="VD: f/1.8" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Chất lượng ảnh</label>
                      <input className="form-control" value={cameraSpecs.chat_luong_anh} onChange={e => setCameraSpecs({...cameraSpecs, chat_luong_anh: e.target.value})} placeholder="VD: 35mm Full Frame" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>AF (Auto Focus)</label>
                      <input className="form-control" value={cameraSpecs.af} onChange={e => setCameraSpecs({...cameraSpecs, af: e.target.value})} placeholder="Có / Không" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Chống nước</label>
                      <input className="form-control" value={cameraSpecs.chong_nuoc} onChange={e => setCameraSpecs({...cameraSpecs, chong_nuoc: e.target.value})} placeholder="Có / Không" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Kích thước</label>
                      <input className="form-control" value={cameraSpecs.kich_thuoc} onChange={e => setCameraSpecs({...cameraSpecs, kich_thuoc: e.target.value})} placeholder="VD: 130x90x60mm" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Loại pin</label>
                      <input className="form-control" value={cameraSpecs.loai_pin} onChange={e => setCameraSpecs({...cameraSpecs, loai_pin: e.target.value})} placeholder="VD: CR123A" />
                    </div>
                  </div>
                ) : categories.find(c => c.id === productForm.category_id)?.name === 'Film' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Khổ film</label>
                      <input className="form-control" value={filmSpecs.kho_film} onChange={e => setFilmSpecs({...filmSpecs, kho_film: e.target.value})} placeholder="VD: 35mm" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Số kiểu</label>
                      <input className="form-control" value={filmSpecs.so_kieu} onChange={e => setFilmSpecs({...filmSpecs, so_kieu: e.target.value})} placeholder="VD: 36" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Date</label>
                      <input className="form-control" value={filmSpecs.date} onChange={e => setFilmSpecs({...filmSpecs, date: e.target.value})} placeholder="VD: 12/2026" />
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="form-control"
                    rows={4}
                    required
                    value={productForm.specifications}
                    onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                    placeholder="Nhập mô tả sản phẩm (dành cho Pin hoặc sản phẩm khác)..."
                  />
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="prod-active"
                  checked={productForm.is_active}
                  onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                />
                <label htmlFor="prod-active" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Bật kinh doanh sản phẩm</label>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="prod-preorder"
                  checked={productForm.allow_preorder}
                  onChange={(e) => setProductForm({ ...productForm, allow_preorder: e.target.checked })}
                />
                <label htmlFor="prod-preorder" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Cho phép Pre-order</label>
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                Lưu sản phẩm
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD BANNER */}
      {isBannerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '500px' }}>
            <button onClick={() => setBannerModalOpen(false)} className="close-btn"><X size={18} /></button>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>
              Thêm banner mới
            </h3>

            <form onSubmit={handleBannerSubmit}>
              <div className="form-group">
                <label className="form-label">Tải lên hình ảnh banner *</label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setBannerForm({ ...bannerForm, file: e.target.files?.[0] || null })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thứ tự hiển thị</label>
                <input
                  type="number"
                  className="form-control"
                  value={bannerForm.display_order}
                  onChange={(e) => setBannerForm({ ...bannerForm, display_order: Number(e.target.value) })}
                />
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                Tải lên Banner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PRODUCT MEDIA MANAGEMENT */}
      {isMediaModalOpen && selectedProductForMedia && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '700px' }}>
            <button onClick={() => {
              setMediaModalOpen(false);
              setSelectedProductForMedia(null);
            }} className="close-btn"><X size={18} /></button>
            
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
              Quản lý hình ảnh/video sản phẩm
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Sản phẩm: <strong>{selectedProductForMedia.name}</strong>
            </p>

            {/* List current media */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              {selectedProductForMedia.product_media?.map((m) => (
                <div key={m.id} style={{ position: 'relative', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', height: '100px', backgroundColor: '#000' }}>
                  {m.media_type === 'video' ? (
                    <video src={m.media_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <button
                    onClick={() => deleteProductMedia(m.id)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      backgroundColor: 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {(!selectedProductForMedia.product_media || selectedProductForMedia.product_media.length === 0) && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Chưa có hình ảnh hay video nào.
                </div>
              )}
            </div>

            {/* Add media form */}
            <form onSubmit={handleMediaUpload} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Chọn tệp hình ảnh hoặc video để tải lên *</label>
                <input
                  type="file"
                  required
                  accept="image/*,video/*"
                  className="form-control"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </div>
              <button type="submit" className="btn btn-accent" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={14} /> Tải lên
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ORDER DETAILS AND EDITING */}
      {isOrderModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '750px' }}>
            <button onClick={() => setOrderModalOpen(false)} className="close-btn"><X size={18} /></button>
            
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Chi tiết và Cập nhật đơn hàng
            </h3>

            <form onSubmit={handleOrderUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                
                {/* Left col: Customer contact info */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Thông tin khách hàng</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingOrderFields.customer_name}
                      onChange={(e) => setEditingOrderFields({ ...editingOrderFields, customer_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingOrderFields.phone}
                      onChange={(e) => setEditingOrderFields({ ...editingOrderFields, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thành phố</label>
                    <select
                      className="form-control"
                      value={editingOrderFields.city}
                      onChange={(e) => setEditingOrderFields({ ...editingOrderFields, city: e.target.value })}
                    >
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hình thức giao hàng</label>
                    <select
                      className="form-control"
                      value={editingOrderFields.delivery_method}
                      onChange={(e) => setEditingOrderFields({ ...editingOrderFields, delivery_method: e.target.value })}
                    >
                      <option value="Đến lấy">Đến lấy</option>
                      <option value="Đặt giao">Đặt giao</option>
                    </select>
                  </div>

                  {editingOrderFields.delivery_method === 'Đặt giao' && (
                    <div className="form-group">
                      <label className="form-label">Địa chỉ chi tiết</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={editingOrderFields.address}
                        onChange={(e) => setEditingOrderFields({ ...editingOrderFields, address: e.target.value })}
                      />
                    </div>
                  )}

                  {editingOrderFields.delivery_method === 'Đến lấy' && (
                    <div className="form-group">
                      <label className="form-label">Ngày giờ đến lấy</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={editingOrderFields.pickup_datetime}
                        onChange={(e) => setEditingOrderFields({ ...editingOrderFields, pickup_datetime: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Right col: Order workflow status and pricing */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Quy trình xử lý & Thanh toán</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Trạng thái đơn hàng</label>
                    <select
                      className="form-control"
                      value={editingOrderFields.status}
                      onChange={(e) => setEditingOrderFields({ ...editingOrderFields, status: e.target.value })}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hình thức thanh toán</label>
                    <select
                      className="form-control"
                      value={editingOrderFields.payment_method}
                      onChange={(e) => setEditingOrderFields({ ...editingOrderFields, payment_method: e.target.value })}
                    >
                      <option value="Thanh toán sau">Thanh toán sau</option>
                      <option value="Chuyển khoản">Chuyển khoản</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ghi chú của khách hàng</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={editingOrderFields.note}
                      onChange={(e) => setEditingOrderFields({ ...editingOrderFields, note: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tổng giá trị đơn hàng (VND)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingOrderFields.total_price}
                      onChange={(e) => setEditingOrderFields({ ...editingOrderFields, total_price: Number(e.target.value) })}
                    />
                  </div>
                </div>

              </div>

              {/* Order items snapshot */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Sản phẩm đã mua</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {item.quantity} x {formatVND(item.price)} = {formatVND(item.quantity * item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '12px' }}>
                Cập nhật thông tin đơn hàng
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Responsive layout styles overrides */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            margin: 20px auto !important;
          }
        }
      `}</style>

    </div>
  );
}
