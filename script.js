let storageAvailable = true;
function storageGet(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    storageAvailable = false;
    return fallback;
  }
}
function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    storageAvailable = false;
    return false;
  }
}

const defaultSiteSettings = {
  phone: "0353 72 42 32",
  zalo: "",
  facebook: "",
  messenger: "",
  banner: "assets/banner-hoa-co-lau.webp"
};
const settingsStorageKey = "hoaCoLauSiteSettings";
let siteSettings = loadSiteSettings();

function loadSiteSettings() {
  try {
    const stored = JSON.parse(storageGet(settingsStorageKey) || "null");
    return { ...defaultSiteSettings, ...(stored && typeof stored === "object" ? stored : {}) };
  } catch {
    return { ...defaultSiteSettings };
  }
}

function saveSiteSettings() {
  return storageSet(settingsStorageKey, JSON.stringify(siteSettings));
}

function phoneDigits(value = "") {
  const raw = String(value).trim();
  const plus = raw.startsWith("+") ? "+" : "";
  return plus + raw.replace(/\D/g, "");
}

function safeExternalUrl(value = "") {
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}

function effectiveZaloUrl() {
  if (siteSettings.zalo && siteSettings.zalo.trim()) return safeExternalUrl(siteSettings.zalo);
  const digits = phoneDigits(siteSettings.phone).replace(/^\+/, "");
  return digits ? `https://zalo.me/${digits}` : "";
}

function applySiteSettings() {
  const phoneText = (siteSettings.phone || defaultSiteSettings.phone).trim();
  const tel = phoneDigits(phoneText);
  document.querySelectorAll("[data-phone-link]").forEach(el => {
    if (tel) el.setAttribute("href", `tel:${tel}`);
  });
  document.querySelectorAll("[data-phone-text]").forEach(el => { el.textContent = phoneText; });

  const banner = document.getElementById("siteBanner");
  if (banner) banner.src = siteSettings.banner || defaultSiteSettings.banner;

  const socialConfigs = [
    { selector: "[data-zalo-link]", row: "contactZaloRow", url: effectiveZaloUrl(), label: "Zalo" },
    { selector: "[data-facebook-link]", row: "contactFacebookRow", url: safeExternalUrl(siteSettings.facebook), label: "Facebook" },
    { selector: "[data-messenger-link]", row: "contactMessengerRow", url: safeExternalUrl(siteSettings.messenger), label: "Messenger" }
  ];
  socialConfigs.forEach(({ selector, row, url, label }) => {
    document.querySelectorAll(selector).forEach(el => {
      el.hidden = false;
      if (url) {
        el.href = url;
        el.dataset.unconfigured = "0";
      } else {
        el.href = "#admin";
        el.dataset.unconfigured = "1";
        el.title = `${label} chưa được cấu hình - bấm để vào Admin`;
      }
    });
    const rowEl = document.getElementById(row);
    if (rowEl) {
      rowEl.hidden = false;
      rowEl.classList.toggle("contact-unconfigured", !url);
    }
  });
}

function resizeImageFile(file, maxSize, quality, done) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Vui lòng chọn file hình ảnh JPG, PNG hoặc WebP.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const scale = Math.min(1, maxSize / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      done(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => alert("Không đọc được ảnh này. Hãy thử ảnh JPG hoặc PNG khác.");
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

const defaultProducts = [
  { id: 1, name: "Nắng Dịu Dàng", category: "sinh-nhat", categoryName: "Hoa sinh nhật", price: 350000, desc: "Hướng dương phối lá xanh, phong cách tươi sáng.", palette: "sun", badge: "Bán chạy", image: "" },
  { id: 2, name: "Hồng Kem Bình Yên", category: "tinh-yeu", categoryName: "Hoa tình yêu", price: 390000, desc: "Bó hồng tông kem hồng nhẹ nhàng, tinh tế.", palette: "rose", badge: "Yêu thích", image: "" },
  { id: 3, name: "Mây Xanh", category: "sinh-nhat", categoryName: "Hoa sinh nhật", price: 420000, desc: "Tông xanh trắng hiện đại, hợp tặng bạn bè và đồng nghiệp.", palette: "blue", badge: "Mới", image: "" },
  { id: 4, name: "Rực Rỡ Khai Trương", category: "khai-truong", categoryName: "Hoa khai trương", price: 850000, desc: "Kệ hoa tông đỏ vàng, nổi bật và trang trọng.", palette: "red", badge: "Nổi bật", image: "" },
  { id: 5, name: "Lời Hẹn Trăm Năm", category: "cuoi-hoi", categoryName: "Hoa cưới", price: 650000, desc: "Hoa cầm tay cô dâu tông trắng kem thanh lịch.", palette: "white", badge: "Cưới hỏi", image: "" },
  { id: 6, name: "Tráp Hỷ Sắc", category: "cuoi-hoi", categoryName: "Tráp cưới hỏi", price: 1200000, desc: "Tráp lễ trang trí hoa tươi theo màu concept.", palette: "coral", badge: "Theo yêu cầu", image: "" },
  { id: 7, name: "Tím Thương", category: "tinh-yeu", categoryName: "Hoa tình yêu", price: 460000, desc: "Sắc tím dịu, phù hợp kỷ niệm và những dịp đặc biệt.", palette: "purple", badge: "Thanh lịch", image: "" },
  { id: 8, name: "Vườn Nhỏ", category: "sinh-nhat", categoryName: "Giỏ hoa", price: 520000, desc: "Giỏ hoa đa sắc, phong cách tự nhiên và trẻ trung.", palette: "mix", badge: "Đa sắc", image: "" }
];

const productStorageKey = "hoaCoLauProducts";
let products = loadProducts();

function loadProducts() {
  try {
    const stored = JSON.parse(storageGet(productStorageKey) || "null");
    return Array.isArray(stored) && stored.length ? stored : defaultProducts.map(p => ({ ...p }));
  } catch {
    return defaultProducts.map(p => ({ ...p }));
  }
}

function saveProducts() {
  return storageSet(productStorageKey, JSON.stringify(products));
}

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterRow = document.getElementById("filterRow");
const categoryCards = document.querySelectorAll(".category-card");
const cartButton = document.getElementById("cartButton");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

let currentFilter = "all";
let cart = [];
try {
  cart = JSON.parse(storageGet("hoaCoLauCart", "[]") || "[]");
  if (!Array.isArray(cart)) cart = [];
} catch {
  cart = [];
}
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

function bouquetMarkup(palette) {
  return `<div class="bouquet palette-${palette || "mix"}"><span class="stem s1"></span><span class="stem s2"></span><span class="stem s3"></span><span class="stem s4"></span><span class="flower f1"></span><span class="flower f2"></span><span class="flower f3"></span><span class="flower f4"></span><span class="wrap"></span></div>`;
}

function productVisual(p) {
  if (p.image) return `<img class="product-img" src="${p.image}" alt="${escapeHtml(p.name)}">`;
  return bouquetMarkup(p.palette);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();
  let list = products.filter(p => (currentFilter === "all" || p.category === currentFilter) && p.name.toLowerCase().includes(term));
  if (sortSelect.value === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-desc") list.sort((a, b) => b.price - a.price);
  productGrid.innerHTML = list.length ? list.map(p => `
    <article class="product-card">
      <div class="product-visual">
        <span class="badge">${escapeHtml(p.badge || "")}</span>
        ${productVisual(p)}
      </div>
      <div class="product-info">
        <div class="product-category">${escapeHtml(p.categoryName || "")}</div>
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        <div class="product-desc">${escapeHtml(p.desc || "")}</div>
        <div class="product-foot">
          <span class="price">${money.format(Number(p.price) || 0)}</span>
          <button class="add-btn" data-add="${p.id}" aria-label="Thêm ${escapeHtml(p.name)} vào giỏ">+</button>
        </div>
      </div>
    </article>`).join("") : `<div class="no-results">Không tìm thấy mẫu hoa phù hợp. Hãy thử từ khóa khác.</div>`;
  document.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", () => addToCart(Number(btn.dataset.add))));
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-chip").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === filter));
  renderProducts();
}
filterRow.addEventListener("click", e => { const btn = e.target.closest("[data-filter]"); if (btn) setFilter(btn.dataset.filter); });
categoryCards.forEach(card => card.addEventListener("click", () => { setFilter(card.dataset.filter); document.getElementById("products").scrollIntoView({ behavior: "smooth" }); }));
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

function addToCart(id) {
  const found = cart.find(item => item.id === id);
  if (found) found.qty += 1; else cart.push({ id, qty: 1 });
  saveCart(); showToast("Đã thêm vào giỏ hàng");
}
function changeQty(id, delta) { const found = cart.find(item => item.id === id); if (!found) return; found.qty += delta; if (found.qty <= 0) cart = cart.filter(item => item.id !== id); saveCart(); }
function removeItem(id) { cart = cart.filter(item => item.id !== id); saveCart(); }
function saveCart() { storageSet("hoaCoLauCart", JSON.stringify(cart)); renderCart(); }
function renderCart() {
  cart = cart.filter(item => products.some(p => p.id === item.id));
  const quantity = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = quantity;
  cartEmpty.style.display = cart.length ? "none" : "grid";
  cartItems.style.display = cart.length ? "block" : "none";
  cartItems.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id); if (!p) return "";
    return `<div class="cart-item"><div><strong>${escapeHtml(p.name)}</strong><small>${money.format(p.price)} × ${item.qty}</small><button class="remove-btn" data-remove="${p.id}">Xóa</button></div><div class="cart-item-actions"><button class="qty-btn" data-qty="-1" data-id="${p.id}">−</button><b>${item.qty}</b><button class="qty-btn" data-qty="1" data-id="${p.id}">+</button></div></div>`;
  }).join("");
  const total = cart.reduce((sum, item) => { const p = products.find(x => x.id === item.id); return sum + (p ? p.price * item.qty : 0); }, 0);
  cartTotal.textContent = money.format(total);
  document.querySelectorAll("[data-qty]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.id), Number(btn.dataset.qty))));
  document.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => removeItem(Number(btn.dataset.remove))));
}
function openCart() { cartDrawer.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
function closeCart() { cartDrawer.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow = ""; }
cartButton.addEventListener("click", openCart); cartClose.addEventListener("click", closeCart); overlay.addEventListener("click", closeCart);
function showToast(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 1800); }
menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mainNav.classList.remove("open")));

// ---------------- Admin cục bộ ----------------
const adminShell = document.getElementById("adminShell");
const adminLogin = document.getElementById("adminLogin");
const adminApp = document.getElementById("adminApp");
const adminPassword = document.getElementById("adminPassword");
const adminProductList = document.getElementById("adminProductList");
const adminProductCount = document.getElementById("adminProductCount");
const adminProductId = document.getElementById("adminProductId");
const adminName = document.getElementById("adminName");
const adminCategory = document.getElementById("adminCategory");
const adminPrice = document.getElementById("adminPrice");
const adminDesc = document.getElementById("adminDesc");
const adminBadge = document.getElementById("adminBadge");
const adminImage = document.getElementById("adminImage");
const adminImagePreview = document.getElementById("adminImagePreview");
const adminFormTitle = document.getElementById("adminFormTitle");
const adminPhone = document.getElementById("adminPhone");
const adminZalo = document.getElementById("adminZalo");
const adminFacebook = document.getElementById("adminFacebook");
const adminMessenger = document.getElementById("adminMessenger");
const adminBanner = document.getElementById("adminBanner");
const adminBannerPreview = document.getElementById("adminBannerPreview");
let pendingImage = "";
let pendingBanner = "";
let adminUnlocked = false;

const categoryNames = { "sinh-nhat":"Hoa sinh nhật", "khai-truong":"Hoa khai trương", "tinh-yeu":"Hoa tình yêu", "cuoi-hoi":"Hoa & tráp cưới" };

function openAdmin() {
  adminShell.hidden = false;
  document.body.style.overflow = "hidden";
  adminLogin.hidden = adminUnlocked;
  adminApp.hidden = !adminUnlocked;
  if (adminUnlocked) { renderAdminProducts(); populateAdminSettings(); }
}
function closeAdmin() {
  adminShell.hidden = true;
  document.body.style.overflow = "";
  if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search);
}
function checkAdminHash() { if (location.hash === "#admin") openAdmin(); }
window.addEventListener("hashchange", checkAdminHash);
document.querySelectorAll("[data-admin-open]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    if (location.hash !== "#admin") {
      try { history.replaceState(null, "", "#admin"); } catch {}
    }
    openAdmin();
  });
});
const adminOpenBtn = document.getElementById("adminOpenBtn");
if (adminOpenBtn) adminOpenBtn.addEventListener("click", openAdmin);
checkAdminHash();

document.getElementById("adminLoginBtn").addEventListener("click", () => {
  if (adminPassword.value === "hoacolau123") {
    adminUnlocked = true; adminLogin.hidden = true; adminApp.hidden = false; renderAdminProducts(); populateAdminSettings(); adminPassword.value = "";
  } else { alert("Mật khẩu chưa đúng."); }
});
adminPassword.addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("adminLoginBtn").click(); });
document.getElementById("adminExitFromLogin").addEventListener("click", closeAdmin);
document.getElementById("adminExit").addEventListener("click", closeAdmin);

// Liên kết chưa cấu hình sẽ mở Admin thay vì biến mất
document.addEventListener("click", event => {
  const link = event.target.closest("[data-unconfigured='1']");
  if (!link) return;
  event.preventDefault();
  openAdmin();
  if (adminUnlocked) {
    const card = document.getElementById("adminSettingsCard");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

const adminGoSettings = document.getElementById("adminGoSettings");
if (adminGoSettings) adminGoSettings.addEventListener("click", () => {
  const card = document.getElementById("adminSettingsCard");
  if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
});

function populateAdminSettings() {
  adminPhone.value = siteSettings.phone || "";
  adminZalo.value = siteSettings.zalo || "";
  adminFacebook.value = siteSettings.facebook || "";
  adminMessenger.value = siteSettings.messenger || "";
  pendingBanner = siteSettings.banner || defaultSiteSettings.banner;
  adminBanner.value = "";
  adminBannerPreview.innerHTML = `<img src="${pendingBanner}" alt="Banner hiện tại">`;
}

adminBanner.addEventListener("change", () => {
  const file = adminBanner.files && adminBanner.files[0];
  if (!file) return;
  resizeImageFile(file, 1800, 0.82, dataUrl => {
    pendingBanner = dataUrl;
    adminBannerPreview.innerHTML = `<img src="${pendingBanner}" alt="Xem trước banner">`;
  });
});

document.getElementById("adminSaveSettings").addEventListener("click", () => {
  const phone = adminPhone.value.trim();
  if (!phoneDigits(phone)) { alert("Bạn chưa nhập số điện thoại hợp lệ."); return; }
  siteSettings = {
    phone,
    zalo: adminZalo.value.trim(),
    facebook: adminFacebook.value.trim(),
    messenger: adminMessenger.value.trim(),
    banner: pendingBanner || siteSettings.banner || defaultSiteSettings.banner
  };
  const persisted = saveSiteSettings();
  applySiteSettings();
  populateAdminSettings();
  showToast("Đã lưu cài đặt website");
  if (!persisted) alert("Trình duyệt đang chặn lưu cục bộ. Thay đổi chỉ tồn tại trong phiên hiện tại.");
});

document.getElementById("adminResetSettings").addEventListener("click", () => {
  if (!confirm("Khôi phục banner, hotline và liên kết liên hệ về mặc định?")) return;
  siteSettings = { ...defaultSiteSettings };
  saveSiteSettings();
  applySiteSettings();
  populateAdminSettings();
  showToast("Đã khôi phục cài đặt");
});

document.getElementById("adminClearForm").addEventListener("click", clearAdminForm);
function clearAdminForm() {
  adminProductId.value = ""; adminName.value = ""; adminCategory.value = "sinh-nhat"; adminPrice.value = ""; adminDesc.value = ""; adminBadge.value = ""; adminImage.value = ""; pendingImage = "";
  adminImagePreview.innerHTML = "<span>Chưa chọn ảnh</span>"; adminFormTitle.textContent = "Thêm sản phẩm mới";
}

adminImage.addEventListener("change", () => {
  const file = adminImage.files && adminImage.files[0];
  if (!file) return;
  resizeImageFile(file, 1000, 0.82, dataUrl => {
    pendingImage = dataUrl;
    adminImagePreview.innerHTML = `<img src="${pendingImage}" alt="Xem trước">`;
  });
});

function renderAdminProducts() {
  adminProductCount.textContent = `${products.length} sản phẩm`;
  adminProductList.innerHTML = products.map(p => `
    <div class="admin-product-row">
      <div class="admin-thumb">${p.image ? `<img src="${p.image}" alt="">` : `<span>💐</span>`}</div>
      <div><h4>${escapeHtml(p.name)}</h4><p>${escapeHtml(p.categoryName || "")} • ${escapeHtml(p.badge || "Không nhãn")}</p><strong>${money.format(Number(p.price) || 0)}</strong></div>
      <div class="admin-row-actions"><button data-edit-product="${p.id}">Sửa</button><button class="danger" data-delete-product="${p.id}">Xóa</button></div>
    </div>`).join("");
  document.querySelectorAll("[data-edit-product]").forEach(btn => btn.addEventListener("click", () => editAdminProduct(Number(btn.dataset.editProduct))));
  document.querySelectorAll("[data-delete-product]").forEach(btn => btn.addEventListener("click", () => deleteAdminProduct(Number(btn.dataset.deleteProduct))));
}

function editAdminProduct(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  adminProductId.value = p.id; adminName.value = p.name; adminCategory.value = p.category; adminPrice.value = p.price; adminDesc.value = p.desc || ""; adminBadge.value = p.badge || ""; pendingImage = p.image || "";
  adminImage.value = ""; adminImagePreview.innerHTML = p.image ? `<img src="${p.image}" alt="Xem trước">` : "<span>Chưa có ảnh riêng</span>"; adminFormTitle.textContent = "Chỉnh sửa sản phẩm"; adminName.focus();
}
function deleteAdminProduct(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  if (!confirm(`Xóa sản phẩm \"${p.name}\"?`)) return;
  products = products.filter(x => x.id !== id); saveProducts(); cart = cart.filter(x => x.id !== id); saveCart(); renderProducts(); renderAdminProducts(); clearAdminForm();
}

document.getElementById("adminSaveProduct").addEventListener("click", () => {
  const name = adminName.value.trim(); const price = Number(adminPrice.value);
  if (!name) { alert("Bạn chưa nhập tên sản phẩm."); return; }
  if (!Number.isFinite(price) || price < 0) { alert("Giá sản phẩm chưa hợp lệ."); return; }
  const id = Number(adminProductId.value);
  if (id) {
    const p = products.find(x => x.id === id); if (!p) return;
    p.name = name; p.category = adminCategory.value; p.categoryName = categoryNames[adminCategory.value]; p.price = price; p.desc = adminDesc.value.trim(); p.badge = adminBadge.value.trim(); p.image = pendingImage || p.image || "";
  } else {
    const newId = products.length ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;
    products.unshift({ id:newId, name, category:adminCategory.value, categoryName:categoryNames[adminCategory.value], price, desc:adminDesc.value.trim(), palette:"mix", badge:adminBadge.value.trim(), image:pendingImage || "" });
  }
  const persisted = saveProducts();
  renderProducts();
  renderAdminProducts();
  clearAdminForm();
  if (persisted) {
    showToast("Đã lưu sản phẩm");
  } else {
    showToast("Đã cập nhật tạm thời");
    alert("Trình duyệt đang chặn lưu dữ liệu cục bộ. Bạn vẫn xem được thay đổi trong phiên này, nhưng để giữ sau khi đóng trang hãy mở website bằng local server.");
  }
});

document.getElementById("adminResetSamples").addEventListener("click", () => {
  if (!confirm("Khôi phục toàn bộ sản phẩm mẫu? Các chỉnh sửa hiện tại sẽ bị mất.")) return;
  products = defaultProducts.map(p => ({ ...p })); saveProducts(); renderProducts(); renderAdminProducts(); clearAdminForm();
});

applySiteSettings();
renderProducts();
renderCart();
