# BANMAYFILM - E-commerce Website bán máy ảnh film vintage

Dự án website thương mại điện tử chuyên cung cấp máy ảnh film, cuộn film, và pin máy ảnh với phong cách vintage cổ điển, hoạt động hoàn hảo trên cả điện thoại và máy tính.

Dự án bao gồm hai phần chính:
- **Backend**: Express API viết bằng TypeScript, quản lý dữ liệu thông qua Supabase.
- **Frontend**: Next.js App Router (TypeScript) với giao diện tuân theo nguyên tắc Vanilla CSS vintage và responsive.

## Kiến Trúc
- **Frontend**: Next.js 14, triển khai trên Vercel.com.
- **Backend**: Express.js, triển khai trên Render.com.
- **Database & Storage**: Supabase PostgreSQL và Supabase Storage.

---

## Cấu Hình & Cài Đặt Local

### 1. Backend
Di chuyển vào thư mục backend và cài đặt dependencies:
```bash
cd backend
npm install
```

Cấu hình các biến môi trường trong file `backend/.env` (tải từ Supabase settings của bạn):
```env
PORT=3001
SUPABASE_URL=https://fuappyplghlsvlkrwiot.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:[password]@db.fuappyplghlsvlkrwiot.supabase.co:5432/postgres
JWT_SECRET=your_jwt_secret_key
```

Chạy backend ở chế độ phát triển:
```bash
npm run dev
```

### 2. Frontend
Di chuyển vào thư mục frontend và cài đặt dependencies:
```bash
cd ../frontend
npm install
```

Cài đặt biến môi trường trong `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Chạy frontend ở chế độ phát triển:
```bash
npm run dev
```
Truy cập ứng dụng tại `http://localhost:3000`.

---

## Hướng Dẫn Deploy Lên Render.com & Vercel.com

Dự án này đã được đẩy lên GitHub tại link: [https://github.com/quocdat01extra-lgtm/banmayfilm](https://github.com/quocdat01extra-lgtm/banmayfilm).

### 1. Triển khai Backend lên Render.com
1. Đăng nhập vào tài khoản [Render.com](https://render.com/).
2. Click **New +** và chọn **Web Service**.
3. Kết nối với GitHub repository `banmayfilm` của bạn.
4. Cấu hình các thông số sau:
   - **Name**: `banmayfilm-backend`
   - **Root Directory**: `backend`
   - **Language**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/seed.js && node dist/index.js` (Lưu ý: Lệnh này sẽ tự động khởi tạo các bảng cơ sở dữ liệu trên Supabase thông qua kết nối trực tiếp IPv6 của Render, sau đó khởi chạy web server).
5. Vào tab **Environment** và thêm các biến môi trường sau:
   - `DATABASE_URL` (Sử dụng liên kết Connection String trực tiếp từ Supabase)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET` (Mã bí mật tự chọn để ký JWT token)
6. Click **Deploy Web Service**. Render sẽ build dự án và chạy migration để tạo các bảng trên Supabase.

### 2. Triển khai Frontend lên Vercel.com
1. Đăng nhập vào tài khoản [Vercel.com](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Chọn repo `banmayfilm` từ GitHub của bạn và click **Import**.
4. Cấu hình các thông số sau:
   - **Root Directory**: Click edit và chọn thư mục `frontend`.
   - **Build Command**: Để mặc định (`next build`).
   - **Output Directory**: Để mặc định (`.next`).
   - **Install Command**: Để mặc định (`npm install`).
5. Ở mục **Environment Variables**, thêm biến sau:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Nhập địa chỉ URL của Backend vừa được deploy trên Render (ví dụ: `https://banmayfilm-backend.onrender.com`).
6. Click **Deploy**. Vercel sẽ tự động build và cung cấp cho bạn một domain để truy cập website.

---

## Tài Khoản Quản Trị Mặc Định
- **Tên tài khoản**: `adminbmf`
- **Mật khẩu**: `banmayfilm6868@`
- Đăng nhập tại route `/admin/login` để quản lý banner, sản phẩm, lịch sử đơn hàng, và báo cáo doanh thu hàng tháng.
