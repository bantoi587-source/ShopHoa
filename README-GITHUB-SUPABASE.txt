HOA CỎ LAU - GITHUB PAGES + SUPABASE V7.1

Website chạy trực tiếp trên GitHub Pages và dùng Supabase để đồng bộ dữ liệu giữa máy tính / điện thoại.

CÁCH UPLOAD GITHUB
- Upload trực tiếp vào ROOT repository: index.html, styles.css, script.js, assets/, mau-import-hoa-co-lau.xlsx và các file hướng dẫn.
- Không đặt toàn bộ website trong một thư mục con.
- Sau khi deploy, vào Admin và kiểm tra tiêu đề hiển thị V7.1.

V7.1 - QUẢN LÝ EXCEL
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
