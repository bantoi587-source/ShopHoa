HOA CỎ LAU - GITHUB PAGES + SUPABASE V7.2

Website chạy trực tiếp trên GitHub Pages và dùng Supabase để đồng bộ dữ liệu giữa máy tính / điện thoại.

CÁCH UPLOAD GITHUB
- Upload trực tiếp vào ROOT repository: index.html, styles.css, script.js, assets/, mau-import-hoa-co-lau.xlsx và các file hướng dẫn.
- Không đặt toàn bộ website trong một thư mục con.
- Sau khi deploy, vào Admin và kiểm tra tiêu đề hiển thị V7.2.

V7.2 - QUẢN LÝ EXCEL & BACKUP TOÀN BỘ DATA
- Mỗi mẫu hoa có mã cố định HCL-000001, HCL-000002...
- Admin > DỮ LIỆU HOA > Xuất Excel (.xlsx): xuất toàn bộ sản phẩm hiện có.
- File Excel xuất ra gồm 3 sheet: MauHoa, DanhMuc, HuongDan.
- Chỉ chỉnh dữ liệu sản phẩm trong sheet MauHoa.
- Import hỗ trợ .xlsx và .xls.
- Giữ nguyên flower_id để cập nhật sản phẩm cũ.
- Để trống flower_id để tạo sản phẩm mới và tự cấp mã HCL.
- Import không tự xóa sản phẩm không có trong file.
- Nếu category chưa tồn tại, hệ thống tự tạo danh mục.
- Nếu image_url để trống khi cập nhật sản phẩm cũ, hệ thống giữ ảnh hiện tại.

FILE MẪU
mau-import-hoa-co-lau.xlsx

CÁC CỘT SHEET MauHoa
flower_id | name | category | price | description | label | image_url | active | sort_order

LƯU Ý
Chức năng Excel dùng thư viện SheetJS tải từ CDN. Website cần có kết nối Internet khi dùng nút Xuất/Import Excel.


V7.2 - XUẤT TOÀN BỘ DATA WEBSITE
- Admin > DỮ LIỆU WEBSITE > Xuất toàn bộ data.
- File .xlsx gồm 5 sheet: TongQuan, CaiDatWebsite, DanhMuc, MauHoa, GhiChu.
- Dữ liệu được lấy trực tiếp từ Supabase tại thời điểm bấm xuất.
- Có phân trang khi đọc Supabase nên không bị giới hạn ở 1000 sản phẩm.
- File toàn bộ data hiện dùng để backup/xem dữ liệu; Import hiện tại chỉ áp dụng cho sheet MauHoa.


=== NANG CAP V7.3 ===
1. Truoc khi dung 3 chuc nang giao dien moi, vao Supabase > SQL Editor.
2. Mo file SUPABASE-MIGRATION-V7.3.sql va chay toan bo SQL 1 lan.
3. Upload cac file V7.3 len root GitHub Pages, ghi de index.html/styles.css/script.js.
4. Admin > GIAO DIEN: chon mau nen, logo, hinh dich vu > Luu giao dien website.
5. Logo nen dung PNG/WebP trong suot. Hinh dich vu nen dung JPG/WebP ro net.
