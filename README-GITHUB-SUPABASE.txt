HOA CỎ LAU - V6 (GITHUB PAGES + SUPABASE)
===========================================

Bản V6 không cần START-WEB.bat và không cần server.js.
Website là static HTML/CSS/JS, dữ liệu dùng chung được lưu trên Supabase.

1. TRƯỚC KHI ĐẨY LÊN GITHUB
- Trong Supabase phải có 3 bảng: site_settings, categories, products.
- site_settings phải có dòng id = 1.
- Storage phải có bucket public: shop-images.
- RLS phải cho anon SELECT và chỉ Admin UUID được INSERT/UPDATE/DELETE theo SQL đã hướng dẫn.
- Authentication phải có tài khoản Admin email + password.

2. FILE ĐẨY LÊN GITHUB
Đẩy toàn bộ nội dung thư mục này lên repository:
- index.html
- styles.css
- script.js
- assets/

3. GITHUB PAGES
Repository > Settings > Pages
Source: Deploy from a branch
Branch: main / root
Sau đó chờ GitHub Pages tạo đường dẫn website.

4. ĐĂNG NHẬP ADMIN
Mở website > Admin.
Nhập EMAIL và MẬT KHẨU của tài khoản đã tạo trong Supabase Authentication.
Không dùng mật khẩu cũ hoacolau123 nữa.

5. ĐỒNG BỘ
Các dữ liệu sau được lưu trên Supabase và dùng chung cho mọi thiết bị:
- Hotline
- Link + tên hiển thị Zalo/Facebook/Messenger
- Banner
- Danh mục
- Sản phẩm
- Hình sản phẩm

Giỏ hàng của khách vẫn lưu riêng trong trình duyệt của từng khách.

6. NẾU KHÔNG LƯU ĐƯỢC
Admin sẽ hiện lỗi chi tiết. Kiểm tra:
- Admin UUID trong RLS có đúng User UID của tài khoản đăng nhập không.
- Bucket shop-images đã được tạo và là Public chưa.
- Policy Storage có cho Admin UUID upload/delete không.
- Bảng site_settings có id = 1 chưa.

Project URL và Publishable Key được dùng ở frontend là bình thường.
KHÔNG đưa secret key, service_role hoặc database password vào script.js/GitHub.
