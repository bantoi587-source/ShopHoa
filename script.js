// Hoa Cỏ Lau V7.2 - GitHub Pages + Supabase + unique flower IDs + Excel full-data export/import
const SUPABASE_URL = "https://plgpmtikfdmbeieeefkw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_OS3B15GlV2eN_KAD_AgMuA_Gz5G1r3Q";
const STORAGE_BUCKET = "shop-images";

if (!window.supabase?.createClient) {
  alert("Không tải được thư viện Supabase. Hãy kiểm tra kết nối Internet rồi tải lại trang.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

let storageAvailable = true;
function storageGet(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    storageAvailable = false;
    return fallback;
  }
}
function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    storageAvailable = false;
    return false;
  }
}

const defaultSiteSettings = {
  phone: "0353 72 42 32",
  zalo: "",
  zaloName: "Zalo Hoa Cỏ Lau",
  facebook: "",
  facebookName: "Facebook Hoa Cỏ Lau",
  messenger: "",
  messengerName: "Messenger Hoa Cỏ Lau",
  banner: "assets/banner-hoa-co-lau.webp"
};

const defaultCategories = [
  { id: "local-sinh-nhat", name: "Hoa sinh nhật", shortName: "Sinh nhật", icon: "🎂", desc: "Tươi trẻ • Ấm áp", sortOrder: 1 },
  { id: "local-khai-truong", name: "Hoa khai trương", shortName: "Khai trương", icon: "🎉", desc: "Nổi bật • Sang trọng", sortOrder: 2 },
  { id: "local-tinh-yeu", name: "Hoa tình yêu", shortName: "Tình yêu", icon: "💐", desc: "Lãng mạn • Tinh tế", sortOrder: 3 },
  { id: "local-cuoi-hoi", name: "Cưới hỏi", shortName: "Cưới hỏi", icon: "💍", desc: "Đồng bộ concept", sortOrder: 4 }
];

const defaultProducts = [
  { id: 1, name: "Nắng Dịu Dàng", category: "local-sinh-nhat", categoryName: "Hoa sinh nhật", price: 350000, desc: "Hướng dương phối lá xanh, phong cách tươi sáng.", palette: "sun", badge: "Bán chạy", image: "" },
  { id: 2, name: "Hồng Kem Bình Yên", category: "local-tinh-yeu", categoryName: "Hoa tình yêu", price: 390000, desc: "Bó hồng tông kem hồng nhẹ nhàng, tinh tế.", palette: "rose", badge: "Yêu thích", image: "" },
  { id: 3, name: "Mây Xanh", category: "local-sinh-nhat", categoryName: "Hoa sinh nhật", price: 420000, desc: "Tông xanh trắng hiện đại, hợp tặng bạn bè và đồng nghiệp.", palette: "blue", badge: "Mới", image: "" },
  { id: 4, name: "Rực Rỡ Khai Trương", category: "local-khai-truong", categoryName: "Hoa khai trương", price: 850000, desc: "Kệ hoa tông đỏ vàng, nổi bật và trang trọng.", palette: "red", badge: "Nổi bật", image: "" },
  { id: 5, name: "Lời Hẹn Trăm Năm", category: "local-cuoi-hoi", categoryName: "Cưới hỏi", price: 650000, desc: "Hoa cầm tay cô dâu tông trắng kem thanh lịch.", palette: "white", badge: "Cưới hỏi", image: "" },
  { id: 6, name: "Tráp Hỷ Sắc", category: "local-cuoi-hoi", categoryName: "Cưới hỏi", price: 1200000, desc: "Tráp lễ trang trí hoa tươi theo màu concept.", palette: "coral", badge: "Theo yêu cầu", image: "" },
  { id: 7, name: "Tím Thương", category: "local-tinh-yeu", categoryName: "Hoa tình yêu", price: 460000, desc: "Sắc tím dịu, phù hợp kỷ niệm và những dịp đặc biệt.", palette: "purple", badge: "Thanh lịch", image: "" },
  { id: 8, name: "Vườn Nhỏ", category: "local-sinh-nhat", categoryName: "Hoa sinh nhật", price: 520000, desc: "Giỏ hoa đa sắc, phong cách tự nhiên và trẻ trung.", palette: "mix", badge: "Đa sắc", image: "" }
];

let siteSettings = { ...defaultSiteSettings };
let categories = defaultCategories.map(item => ({ ...item }));
let products = defaultProducts.map(item => ({ ...item }));
let usingFallbackCategories = true;
let usingFallbackProducts = true;
let currentFilter = "all";
let adminUnlocked = false;
let pendingBannerFile = null;
let pendingProductImageFile = null;

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });


function flowerCode(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return "";
  return `HCL-${String(n).padStart(6, "0")}`;
}

function flowerIdToDbId(value) {
  const raw = String(value ?? "").trim().toUpperCase();
  if (!raw) return null;
  const match = raw.match(/^HCL-0*(\d+)$/) || raw.match(/^(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
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
  if (siteSettings.zalo?.trim()) return safeExternalUrl(siteSettings.zalo);
  const digits = phoneDigits(siteSettings.phone).replace(/^\+/, "");
  return digits ? `https://zalo.me/${digits}` : "";
}

function updateSyncStatus(message, state = "local") {
  const el = document.getElementById("adminSyncStatus");
  if (!el) return;
  el.textContent = message;
  el.dataset.state = state;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function explainSupabaseError(error, fallback = "Có lỗi xảy ra") {
  if (!error) return fallback;
  const message = error.message || String(error);
  if (/row-level security|policy/i.test(message)) {
    return `${fallback}: tài khoản này chưa có quyền ghi dữ liệu (RLS). Kiểm tra đúng Admin UUID trong policy Supabase.`;
  }
  if (/relation .* does not exist|Could not find the table|schema cache/i.test(message)) {
    return `${fallback}: bảng Supabase chưa được tạo hoặc chưa được nhận diện. Hãy kiểm tra SQL tạo site_settings, categories và products.`;
  }
  if (/bucket not found/i.test(message)) {
    return `${fallback}: chưa có bucket \"${STORAGE_BUCKET}\" trong Supabase Storage.`;
  }
  return `${fallback}: ${message}`;
}

function mapSettingsRow(row) {
  if (!row) return { ...defaultSiteSettings };
  return {
    phone: row.phone || defaultSiteSettings.phone,
    zalo: row.zalo_url || "",
    zaloName: row.zalo_label || defaultSiteSettings.zaloName,
    facebook: row.facebook_url || "",
    facebookName: row.facebook_label || defaultSiteSettings.facebookName,
    messenger: row.messenger_url || "",
    messengerName: row.messenger_label || defaultSiteSettings.messengerName,
    banner: row.banner_url || defaultSiteSettings.banner
  };
}

function mapCategoryRow(row) {
  return {
    id: String(row.id),
    dbId: Number(row.id),
    name: row.name,
    shortName: String(row.name || "").replace(/^Hoa\s+/i, "") || row.name,
    icon: row.icon || "🌸",
    desc: row.description || "Xem sản phẩm",
    sortOrder: Number(row.sort_order) || 0,
    active: row.active !== false
  };
}

function mapProductRow(row) {
  return {
    id: Number(row.id),
    flowerId: flowerCode(row.id),
    name: row.name,
    category: row.category_id == null ? "" : String(row.category_id),
    categoryName: "",
    price: Number(row.price) || 0,
    desc: row.description || "",
    palette: "mix",
    badge: row.label || "",
    image: row.image_url || "",
    sortOrder: Number(row.sort_order) || 0,
    active: row.active !== false
  };
}

async function loadPublicData({ silent = false } = {}) {
  const [settingsRes, categoriesRes, productsRes] = await Promise.all([
    supabaseClient.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabaseClient.from("categories").select("*").order("sort_order", { ascending: true }).order("id", { ascending: true }),
    supabaseClient.from("products").select("*").order("sort_order", { ascending: true }).order("id", { ascending: false })
  ]);

  const errors = [settingsRes.error, categoriesRes.error, productsRes.error].filter(Boolean);

  if (!settingsRes.error && settingsRes.data) {
    siteSettings = mapSettingsRow(settingsRes.data);
  }

  if (!categoriesRes.error && Array.isArray(categoriesRes.data) && categoriesRes.data.length) {
    categories = categoriesRes.data.map(mapCategoryRow);
    usingFallbackCategories = false;
  } else if (!categoriesRes.error) {
    categories = defaultCategories.map(item => ({ ...item }));
    usingFallbackCategories = true;
  }

  if (!productsRes.error && Array.isArray(productsRes.data) && productsRes.data.length) {
    products = productsRes.data.map(mapProductRow);
    usingFallbackProducts = false;
  } else if (!productsRes.error) {
    products = defaultProducts.map(item => ({ ...item }));
    usingFallbackProducts = true;
  }

  products.forEach(p => {
    p.categoryName = getCategoryName(p.category, p.categoryName || "");
  });

  applySiteSettings();
  renderCategoryUI();
  renderProducts();
  renderCart();

  if (adminUnlocked) {
    populateAdminSettings();
    renderAdminCategories();
    renderAdminProducts();
    renderAdminCategoryOptions();
  }

  if (errors.length) {
    updateSyncStatus("Không đọc được đầy đủ dữ liệu Supabase", "offline");
    if (!silent) console.error("Supabase load errors", errors);
    return false;
  }

  updateSyncStatus("Đã kết nối Supabase — dữ liệu dùng chung trên mọi thiết bị", "online");
  return true;
}


// Đồng bộ nhanh riêng phần cài đặt website giữa nhiều thiết bị.
// Realtime là đường nhanh; polling/focus/pageshow là cơ chế dự phòng để vẫn hoạt động
// kể cả khi Realtime chưa được bật cho bảng site_settings trong Supabase.
let settingsRefreshInFlight = false;
let lastSettingsUpdatedAt = "";

async function refreshSharedSettings({ silent = true } = {}) {
  if (settingsRefreshInFlight) return false;
  settingsRefreshInFlight = true;
  try {
    const { data, error } = await supabaseClient
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return false;

    const incoming = mapSettingsRow(data);
    const incomingUpdatedAt = data.updated_at || "";
    const changed = JSON.stringify(incoming) !== JSON.stringify(siteSettings);

    if (changed) {
      siteSettings = incoming;
      applySiteSettings();
      if (adminUnlocked) populateAdminSettings();
      if (!silent) showToast("Đã nhận cài đặt mới từ Supabase");
    }

    lastSettingsUpdatedAt = incomingUpdatedAt;
    return changed;
  } catch (error) {
    if (!silent) console.error("Không thể đồng bộ site_settings", error);
    return false;
  } finally {
    settingsRefreshInFlight = false;
  }
}

function startCrossDeviceSettingsSync() {
  // Khi quay lại trang trên điện thoại, lấy dữ liệu mới ngay lập tức.
  window.addEventListener("focus", () => { refreshSharedSettings({ silent: true }); loadPublicData({ silent: true }); });
  window.addEventListener("pageshow", () => { refreshSharedSettings({ silent: true }); loadPublicData({ silent: true }); });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshSharedSettings({ silent: true });
  });

  // Polling dự phòng: trang đang mở sẽ tự cập nhật tối đa khoảng 8 giây sau khi Admin lưu.
  window.__hoaCoLauSettingsTimer = window.setInterval(() => {
    if (!document.hidden) refreshSharedSettings({ silent: true });
  }, 8000);

  // Đồng bộ danh mục/sản phẩm định kỳ để thay đổi import trên Admin xuất hiện ở thiết bị khác.
  window.__hoaCoLauCatalogTimer = window.setInterval(() => {
    if (!document.hidden) loadPublicData({ silent: true });
  }, 20000);

  // Realtime: nếu bảng site_settings đã bật trong Supabase Realtime thì cập nhật gần như tức thì.
  try {
    window.__hoaCoLauSettingsChannel = supabaseClient
      .channel("hoa-co-lau-site-settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: "id=eq.1" },
        payload => {
          const row = payload?.new;
          if (!row || Number(row.id) !== 1) return;
          siteSettings = mapSettingsRow(row);
          lastSettingsUpdatedAt = row.updated_at || lastSettingsUpdatedAt;
          applySiteSettings();
          if (adminUnlocked) populateAdminSettings();
        }
      )
      .subscribe();
  } catch (error) {
    console.warn("Realtime chưa sẵn sàng, sẽ dùng polling dự phòng.", error);
  }
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

  const configs = [
    { selector: "[data-zalo-link]", textSelector: "[data-zalo-text]", row: "contactZaloRow", url: effectiveZaloUrl(), label: "Zalo", display: siteSettings.zaloName || defaultSiteSettings.zaloName },
    { selector: "[data-facebook-link]", textSelector: "[data-facebook-text]", row: "contactFacebookRow", url: safeExternalUrl(siteSettings.facebook), label: "Facebook", display: siteSettings.facebookName || defaultSiteSettings.facebookName },
    { selector: "[data-messenger-link]", textSelector: "[data-messenger-text]", row: "contactMessengerRow", url: safeExternalUrl(siteSettings.messenger), label: "Messenger", display: siteSettings.messengerName || defaultSiteSettings.messengerName }
  ];

  configs.forEach(({ selector, textSelector, row, url, label, display }) => {
    document.querySelectorAll(selector).forEach(el => {
      el.hidden = false;
      el.setAttribute("aria-label", display);
      el.title = display;
      if (url) {
        el.href = url;
        el.dataset.unconfigured = "0";
      } else {
        el.href = "#admin";
        el.dataset.unconfigured = "1";
        el.title = `${label} chưa được cấu hình - bấm để vào Admin`;
      }
    });
    document.querySelectorAll(textSelector).forEach(el => { el.textContent = display; });
    const rowEl = document.getElementById(row);
    if (rowEl) rowEl.classList.toggle("contact-unconfigured", !url);
  });
}

function categoryById(id) {
  return categories.find(c => String(c.id) === String(id));
}

function getCategoryName(id, fallback = "") {
  return categoryById(id)?.name || fallback || "Danh mục khác";
}

function bouquetMarkup(palette) {
  return `<div class="bouquet palette-${palette || "mix"}"><span class="stem s1"></span><span class="stem s2"></span><span class="stem s3"></span><span class="stem s4"></span><span class="flower f1"></span><span class="flower f2"></span><span class="flower f3"></span><span class="flower f4"></span><span class="wrap"></span></div>`;
}

function productVisual(p) {
  if (p.image) return `<img class="product-img" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">`;
  return bouquetMarkup(p.palette);
}

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterRow = document.getElementById("filterRow");
const categoryGrid = document.getElementById("categoryGrid");
const cartButton = document.getElementById("cartButton");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

function renderCategoryUI() {
  if (currentFilter !== "all" && !categories.some(c => String(c.id) === String(currentFilter))) currentFilter = "all";

  if (categoryGrid) {
    categoryGrid.innerHTML = categories.map(c => `
      <button class="category-card" data-filter="${escapeHtml(c.id)}">
        <span class="category-icon">${escapeHtml(c.icon || "🌸")}</span>
        <strong>${escapeHtml(c.name)}</strong>
        <small>${escapeHtml(c.desc || "Xem sản phẩm")}</small>
      </button>`).join("");
  }

  if (filterRow) {
    filterRow.innerHTML = `<button class="filter-chip ${currentFilter === "all" ? "active" : ""}" data-filter="all">Tất cả</button>` +
      categories.map(c => `<button class="filter-chip ${String(currentFilter) === String(c.id) ? "active" : ""}" data-filter="${escapeHtml(c.id)}">${escapeHtml(c.shortName || c.name)}</button>`).join("");
  }

  renderAdminCategoryOptions();
}

function renderProducts() {
  if (!productGrid) return;
  const term = (searchInput?.value || "").trim().toLowerCase();
  let list = products.filter(p => {
    const matchesFilter = currentFilter === "all" || String(p.category) === String(currentFilter);
    const haystack = `${p.name || ""} ${p.desc || ""} ${p.flowerId || flowerCode(p.id)}`.toLowerCase();
    return matchesFilter && haystack.includes(term);
  });
  if (sortSelect?.value === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sortSelect?.value === "price-desc") list.sort((a, b) => b.price - a.price);

  productGrid.innerHTML = list.length ? list.map(p => `
    <article class="product-card">
      <div class="product-visual">
        ${p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : ""}
        ${productVisual(p)}
      </div>
      <div class="product-info">
        <div class="product-category">${escapeHtml(getCategoryName(p.category, p.categoryName || ""))}</div>
        <div class="product-code">Mã hoa: ${escapeHtml(p.flowerId || flowerCode(p.id))}</div>
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        <div class="product-desc">${escapeHtml(p.desc || "")}</div>
        <div class="product-foot">
          <span class="price">${money.format(Number(p.price) || 0)}</span>
          <button class="add-btn" data-add="${p.id}" aria-label="Thêm ${escapeHtml(p.name)} vào giỏ">+</button>
        </div>
      </div>
    </article>`).join("") : `<div class="no-results">Không tìm thấy mẫu hoa phù hợp.</div>`;

  document.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", () => addToCart(Number(btn.dataset.add))));
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-chip").forEach(btn => btn.classList.toggle("active", String(btn.dataset.filter) === String(filter)));
  renderProducts();
}

filterRow?.addEventListener("click", e => {
  const btn = e.target.closest("[data-filter]");
  if (btn) setFilter(btn.dataset.filter);
});
categoryGrid?.addEventListener("click", e => {
  const card = e.target.closest("[data-filter]");
  if (!card) return;
  setFilter(card.dataset.filter);
  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
});
searchInput?.addEventListener("input", renderProducts);
sortSelect?.addEventListener("change", renderProducts);

let cart = [];
try {
  cart = JSON.parse(storageGet("hoaCoLauCart", "[]") || "[]");
  if (!Array.isArray(cart)) cart = [];
} catch {
  cart = [];
}

function addToCart(id) {
  const found = cart.find(item => item.id === id);
  if (found) found.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  showToast("Đã thêm vào giỏ hàng");
}
function changeQty(id, delta) {
  const found = cart.find(item => item.id === id);
  if (!found) return;
  found.qty += delta;
  if (found.qty <= 0) cart = cart.filter(item => item.id !== id);
  saveCart();
}
function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}
function saveCart() {
  storageSet("hoaCoLauCart", JSON.stringify(cart));
  renderCart();
}
function renderCart() {
  if (!cartItems || !cartEmpty || !cartCount || !cartTotal) return;
  cart = cart.filter(item => products.some(p => p.id === item.id));
  const quantity = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = quantity;
  cartEmpty.style.display = cart.length ? "none" : "grid";
  cartItems.style.display = cart.length ? "block" : "none";
  cartItems.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return "";
    return `<div class="cart-item"><div><strong>${escapeHtml(p.name)}</strong><small>${money.format(p.price)} × ${item.qty}</small><button class="remove-btn" data-remove="${p.id}">Xóa</button></div><div class="cart-item-actions"><button class="qty-btn" data-qty="-1" data-id="${p.id}">−</button><b>${item.qty}</b><button class="qty-btn" data-qty="1" data-id="${p.id}">+</button></div></div>`;
  }).join("");
  const total = cart.reduce((sum, item) => {
    const p = products.find(x => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  cartTotal.textContent = money.format(total);
  document.querySelectorAll("[data-qty]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.id), Number(btn.dataset.qty))));
  document.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => removeItem(Number(btn.dataset.remove))));
}
function openCart() {
  cartDrawer?.classList.add("open");
  overlay?.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartDrawer?.classList.remove("open");
  overlay?.classList.remove("open");
  document.body.style.overflow = "";
}
cartButton?.addEventListener("click", openCart);
cartClose?.addEventListener("click", closeCart);
overlay?.addEventListener("click", closeCart);
menuToggle?.addEventListener("click", () => mainNav?.classList.toggle("open"));
mainNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mainNav.classList.remove("open")));

// ---------------- Supabase Admin ----------------
const adminShell = document.getElementById("adminShell");
const adminLogin = document.getElementById("adminLogin");
const adminApp = document.getElementById("adminApp");
const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminProductList = document.getElementById("adminProductList");
const adminProductCount = document.getElementById("adminProductCount");
const adminProductId = document.getElementById("adminProductId");
const adminFlowerId = document.getElementById("adminFlowerId");
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
const adminZaloName = document.getElementById("adminZaloName");
const adminFacebook = document.getElementById("adminFacebook");
const adminFacebookName = document.getElementById("adminFacebookName");
const adminMessenger = document.getElementById("adminMessenger");
const adminMessengerName = document.getElementById("adminMessengerName");
const adminBanner = document.getElementById("adminBanner");
const adminBannerPreview = document.getElementById("adminBannerPreview");
const adminCategoryName = document.getElementById("adminCategoryName");
const adminCategoryIcon = document.getElementById("adminCategoryIcon");
const adminCategoryDesc = document.getElementById("adminCategoryDesc");
const adminCategoryList = document.getElementById("adminCategoryList");
const adminImportFile = document.getElementById("adminImportFile");
const adminImportBtn = document.getElementById("adminImportBtn");
const adminImportStatus = document.getElementById("adminImportStatus");

async function refreshAdminAuthState() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    adminUnlocked = false;
    return false;
  }
  adminUnlocked = Boolean(data.session?.user);
  if (adminUnlocked && adminEmail && !adminEmail.value) adminEmail.value = data.session.user.email || "";
  return adminUnlocked;
}

async function openAdmin() {
  await refreshAdminAuthState();
  adminShell.hidden = false;
  document.body.style.overflow = "hidden";
  adminLogin.hidden = adminUnlocked;
  adminApp.hidden = !adminUnlocked;
  if (adminUnlocked) {
    await loadPublicData({ silent: true });
    populateAdminSettings();
    renderAdminCategories();
    renderAdminProducts();
    renderAdminCategoryOptions();
  }
}

function closeAdmin() {
  adminShell.hidden = true;
  document.body.style.overflow = "";
  if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search);
}

async function checkAdminHash() {
  if (location.hash === "#admin") await openAdmin();
}

window.addEventListener("hashchange", checkAdminHash);
document.querySelectorAll("[data-admin-open]").forEach(link => {
  link.addEventListener("click", async e => {
    e.preventDefault();
    if (location.hash !== "#admin") history.replaceState(null, "", "#admin");
    await openAdmin();
  });
});
document.getElementById("adminOpenBtn")?.addEventListener("click", openAdmin);
document.getElementById("adminExitFromLogin")?.addEventListener("click", closeAdmin);
document.getElementById("adminExit")?.addEventListener("click", closeAdmin);

document.getElementById("adminLoginBtn")?.addEventListener("click", async () => {
  const email = adminEmail.value.trim();
  const password = adminPassword.value;
  if (!email || !password) {
    alert("Vui lòng nhập email và mật khẩu Admin đã tạo trong Supabase Authentication.");
    return;
  }

  const button = document.getElementById("adminLoginBtn");
  button.disabled = true;
  button.textContent = "Đang đăng nhập...";
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  button.disabled = false;
  button.textContent = "Đăng nhập";

  if (error || !data.user) {
    alert(`Đăng nhập thất bại: ${error?.message || "Không xác định"}`);
    return;
  }

  adminUnlocked = true;
  adminPassword.value = "";
  adminLogin.hidden = true;
  adminApp.hidden = false;
  updateSyncStatus("Đã đăng nhập Supabase — đang tải dữ liệu...", "online");
  await loadPublicData({ silent: true });
  populateAdminSettings();
  renderAdminCategories();
  renderAdminProducts();
  renderAdminCategoryOptions();
  showToast("Đăng nhập Admin thành công");
});

adminPassword?.addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("adminLoginBtn")?.click();
});

document.getElementById("adminLogout")?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  adminUnlocked = false;
  adminApp.hidden = true;
  adminLogin.hidden = false;
  updateSyncStatus("Đã đăng xuất", "local");
  showToast("Đã đăng xuất Admin");
});

document.querySelectorAll("[data-zalo-link], [data-facebook-link], [data-messenger-link]").forEach(link => {
  link.addEventListener("click", async e => {
    if (link.dataset.unconfigured === "1") {
      e.preventDefault();
      await openAdmin();
      document.getElementById("adminSettingsCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

document.getElementById("adminGoSettings")?.addEventListener("click", () => {
  document.getElementById("adminSettingsCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

function populateAdminSettings() {
  if (!adminPhone) return;
  adminPhone.value = siteSettings.phone || "";
  adminZalo.value = siteSettings.zalo || "";
  adminZaloName.value = siteSettings.zaloName || defaultSiteSettings.zaloName;
  adminFacebook.value = siteSettings.facebook || "";
  adminFacebookName.value = siteSettings.facebookName || defaultSiteSettings.facebookName;
  adminMessenger.value = siteSettings.messenger || "";
  adminMessengerName.value = siteSettings.messengerName || defaultSiteSettings.messengerName;
  adminBanner.value = "";
  pendingBannerFile = null;
  const src = siteSettings.banner || defaultSiteSettings.banner;
  adminBannerPreview.innerHTML = `<img src="${escapeHtml(src)}" alt="Banner hiện tại">`;
}

adminBanner?.addEventListener("change", () => {
  const file = adminBanner.files?.[0];
  if (!file) return;
  pendingBannerFile = file;
  const url = URL.createObjectURL(file);
  adminBannerPreview.innerHTML = `<img src="${url}" alt="Xem trước banner">`;
});

async function optimizeImage(file, maxDimension = 1800, quality = 0.86) {
  if (!file?.type?.startsWith("image/")) throw new Error("Vui lòng chọn file ảnh JPG, PNG hoặc WebP.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(result => result ? resolve(result) : reject(new Error("Không thể xử lý ảnh.")), "image/jpeg", quality);
  });
  return blob;
}

async function uploadImage(file, folder, maxDimension = 1800) {
  const blob = await optimizeImage(file, maxDimension, 0.86);
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${folder}/${random}.jpg`;
  const { error } = await supabaseClient.storage.from(STORAGE_BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;
  const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Không lấy được URL ảnh sau khi upload.");
  return data.publicUrl;
}

document.getElementById("adminSaveSettings")?.addEventListener("click", async () => {
  const phone = adminPhone.value.trim();
  if (!phoneDigits(phone)) {
    alert("Bạn chưa nhập số điện thoại hợp lệ.");
    return;
  }

  const button = document.getElementById("adminSaveSettings");
  button.disabled = true;
  button.textContent = "Đang lưu...";

  try {
    let bannerUrl = siteSettings.banner === defaultSiteSettings.banner ? "" : siteSettings.banner;
    if (pendingBannerFile) {
      updateSyncStatus("Đang tải banner lên Supabase Storage...", "online");
      bannerUrl = await uploadImage(pendingBannerFile, "banners", 2200);
    }

    const payload = {
      phone,
      zalo_url: adminZalo.value.trim(),
      zalo_label: adminZaloName.value.trim() || defaultSiteSettings.zaloName,
      facebook_url: adminFacebook.value.trim(),
      facebook_label: adminFacebookName.value.trim() || defaultSiteSettings.facebookName,
      messenger_url: adminMessenger.value.trim(),
      messenger_label: adminMessengerName.value.trim() || defaultSiteSettings.messengerName,
      banner_url: bannerUrl || "",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient.from("site_settings").update(payload).eq("id", 1).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Không tìm thấy dòng site_settings có id = 1. Hãy chạy lại phần INSERT site_settings trong SQL.");

    siteSettings = mapSettingsRow(data);
    lastSettingsUpdatedAt = data.updated_at || lastSettingsUpdatedAt;
    applySiteSettings();
    populateAdminSettings();
    updateSyncStatus("Đã lưu Supabase — thiết bị khác sẽ tự cập nhật trong vài giây", "online");
    showToast("Đã lưu và đồng bộ cài đặt website");
  } catch (error) {
    console.error(error);
    updateSyncStatus("Lưu Supabase thất bại", "offline");
    alert(explainSupabaseError(error, "Không thể lưu cài đặt"));
  } finally {
    button.disabled = false;
    button.textContent = "Lưu cài đặt website";
  }
});

document.getElementById("adminResetSettings")?.addEventListener("click", async () => {
  if (!confirm("Khôi phục hotline, liên kết liên hệ và banner về mặc định?")) return;
  try {
    const payload = {
      phone: defaultSiteSettings.phone,
      zalo_url: "",
      zalo_label: defaultSiteSettings.zaloName,
      facebook_url: "",
      facebook_label: defaultSiteSettings.facebookName,
      messenger_url: "",
      messenger_label: defaultSiteSettings.messengerName,
      banner_url: "",
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseClient.from("site_settings").update(payload).eq("id", 1).select().maybeSingle();
    if (error) throw error;
    siteSettings = mapSettingsRow(data);
    applySiteSettings();
    populateAdminSettings();
    showToast("Đã khôi phục cài đặt");
  } catch (error) {
    alert(explainSupabaseError(error, "Không thể khôi phục cài đặt"));
  }
});

function renderAdminCategoryOptions() {
  if (!adminCategory) return;
  const selected = adminCategory.value;
  adminCategory.innerHTML = categories.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join("");
  if (categories.some(c => String(c.id) === String(selected))) adminCategory.value = selected;
}

function renderAdminCategories() {
  if (!adminCategoryList) return;
  adminCategoryList.innerHTML = categories.map(c => {
    const count = products.filter(p => String(p.category) === String(c.id)).length;
    const isFallback = String(c.id).startsWith("local-");
    return `<div class="admin-category-row">
      <div class="admin-category-symbol">${escapeHtml(c.icon || "🌸")}</div>
      <div><strong>${escapeHtml(c.name)}</strong><small>${count} sản phẩm${isFallback ? " • mẫu cục bộ" : ""}</small></div>
      <button type="button" class="admin-category-delete" data-delete-category="${escapeHtml(c.id)}" ${(count || isFallback) ? 'disabled title="Danh mục mẫu hoặc đang có sản phẩm"' : ""}>Xóa</button>
    </div>`;
  }).join("");
}

async function addAdminCategory() {
  const name = adminCategoryName.value.trim();
  if (!name) {
    alert("Bạn chưa nhập tên danh mục.");
    adminCategoryName.focus();
    return;
  }
  if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    alert("Danh mục này đã tồn tại.");
    return;
  }

  const maxSort = categories.reduce((max, c) => Math.max(max, Number(c.sortOrder) || 0), 0);
  const payload = {
    name,
    icon: adminCategoryIcon.value.trim() || "🌸",
    description: adminCategoryDesc.value.trim() || "Mẫu hoa theo yêu cầu",
    active: true,
    sort_order: maxSort + 1
  };

  const { error } = await supabaseClient.from("categories").insert(payload);
  if (error) {
    alert(explainSupabaseError(error, "Không thể thêm danh mục"));
    return;
  }

  adminCategoryName.value = "";
  adminCategoryIcon.value = "";
  adminCategoryDesc.value = "";
  await loadPublicData({ silent: true });
  showToast("Đã thêm danh mục mới");
}

async function deleteAdminCategory(id) {
  const category = categoryById(id);
  if (!category || String(id).startsWith("local-")) return;
  const count = products.filter(p => String(p.category) === String(id)).length;
  if (count) {
    alert(`Danh mục \"${category.name}\" đang có ${count} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`);
    return;
  }
  if (!confirm(`Xóa danh mục \"${category.name}\"?`)) return;
  const { error } = await supabaseClient.from("categories").delete().eq("id", Number(id));
  if (error) {
    alert(explainSupabaseError(error, "Không thể xóa danh mục"));
    return;
  }
  await loadPublicData({ silent: true });
  clearAdminForm();
  showToast("Đã xóa danh mục");
}

document.getElementById("adminAddCategory")?.addEventListener("click", addAdminCategory);
adminCategoryName?.addEventListener("keydown", e => { if (e.key === "Enter") addAdminCategory(); });
adminCategoryList?.addEventListener("click", e => {
  const btn = e.target.closest("[data-delete-category]");
  if (btn && !btn.disabled) deleteAdminCategory(btn.dataset.deleteCategory);
});

function clearAdminForm() {
  if (!adminProductId) return;
  adminProductId.value = "";
  if (adminFlowerId) adminFlowerId.value = "Tự động cấp khi lưu";
  adminName.value = "";
  renderAdminCategoryOptions();
  if (categories[0]) adminCategory.value = categories[0].id;
  adminPrice.value = "";
  adminDesc.value = "";
  adminBadge.value = "";
  adminImage.value = "";
  pendingProductImageFile = null;
  adminImagePreview.innerHTML = "<span>Chưa chọn ảnh</span>";
  adminFormTitle.textContent = "Thêm sản phẩm mới";
}

document.getElementById("adminClearForm")?.addEventListener("click", clearAdminForm);
adminImage?.addEventListener("change", () => {
  const file = adminImage.files?.[0];
  if (!file) return;
  pendingProductImageFile = file;
  const url = URL.createObjectURL(file);
  adminImagePreview.innerHTML = `<img src="${url}" alt="Xem trước">`;
});

function renderAdminProducts() {
  if (!adminProductList || !adminProductCount) return;
  adminProductCount.textContent = `${products.length} sản phẩm`;
  adminProductList.innerHTML = products.map(p => {
    const isFallback = usingFallbackProducts;
    return `<div class="admin-product-row">
      <div class="admin-thumb">${p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : `<span>💐</span>`}</div>
      <div><h4>${escapeHtml(p.name)}</h4><p><span class="admin-product-code">${escapeHtml(p.flowerId || flowerCode(p.id))}</span> • ${escapeHtml(getCategoryName(p.category, p.categoryName || ""))} • ${escapeHtml(p.badge || "Không nhãn")}${isFallback ? " • mẫu cục bộ" : ""}</p><strong>${money.format(Number(p.price) || 0)}</strong></div>
      <div class="admin-row-actions"><button data-edit-product="${p.id}" ${isFallback ? "disabled" : ""}>Sửa</button><button class="danger" data-delete-product="${p.id}" ${isFallback ? "disabled" : ""}>Xóa</button></div>
    </div>`;
  }).join("");

  document.querySelectorAll("[data-edit-product]").forEach(btn => btn.addEventListener("click", () => {
    if (!btn.disabled) editAdminProduct(Number(btn.dataset.editProduct));
  }));
  document.querySelectorAll("[data-delete-product]").forEach(btn => btn.addEventListener("click", () => {
    if (!btn.disabled) deleteAdminProduct(Number(btn.dataset.deleteProduct));
  }));
}

function editAdminProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p || usingFallbackProducts) return;
  adminProductId.value = p.id;
  if (adminFlowerId) adminFlowerId.value = p.flowerId || flowerCode(p.id);
  adminName.value = p.name;
  adminCategory.value = p.category;
  adminPrice.value = p.price;
  adminDesc.value = p.desc || "";
  adminBadge.value = p.badge || "";
  pendingProductImageFile = null;
  adminImage.value = "";
  adminImagePreview.innerHTML = p.image ? `<img src="${escapeHtml(p.image)}" alt="Xem trước">` : "<span>Chưa có ảnh riêng</span>";
  adminFormTitle.textContent = "Chỉnh sửa sản phẩm";
  adminName.focus();
}

async function deleteAdminProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p || usingFallbackProducts) return;
  if (!confirm(`Xóa sản phẩm \"${p.name}\"?`)) return;
  const { error } = await supabaseClient.from("products").delete().eq("id", id);
  if (error) {
    alert(explainSupabaseError(error, "Không thể xóa sản phẩm"));
    return;
  }
  cart = cart.filter(x => x.id !== id);
  saveCart();
  await loadPublicData({ silent: true });
  clearAdminForm();
  showToast("Đã xóa sản phẩm");
}

document.getElementById("adminSaveProduct")?.addEventListener("click", async () => {
  const name = adminName.value.trim();
  const price = Number(adminPrice.value);
  const categoryId = Number(adminCategory.value);
  if (!name) {
    alert("Bạn chưa nhập tên sản phẩm.");
    return;
  }
  if (!Number.isFinite(price) || price < 0) {
    alert("Giá sản phẩm chưa hợp lệ.");
    return;
  }
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    alert("Bạn cần có danh mục Supabase trước khi lưu sản phẩm. Nếu đang thấy danh mục mẫu cục bộ, hãy thêm danh mục mới trong Admin hoặc chạy SQL tạo danh mục mặc định.");
    return;
  }

  const button = document.getElementById("adminSaveProduct");
  button.disabled = true;
  button.textContent = "Đang lưu...";

  try {
    const id = Number(adminProductId.value);
    const old = id ? products.find(p => p.id === id) : null;
    let imageUrl = old?.image || "";
    if (pendingProductImageFile) {
      imageUrl = await uploadImage(pendingProductImageFile, "products", 1400);
    }

    const payload = {
      name,
      price,
      category_id: categoryId,
      description: adminDesc.value.trim(),
      label: adminBadge.value.trim(),
      image_url: imageUrl,
      active: true,
      updated_at: new Date().toISOString()
    };

    let error;
    let savedId = id || null;
    if (id) {
      const result = await supabaseClient.from("products").update(payload).eq("id", id).select("id").maybeSingle();
      error = result.error;
      savedId = result.data?.id || id;
    } else {
      delete payload.updated_at;
      payload.sort_order = 0;
      const result = await supabaseClient.from("products").insert(payload).select("id").single();
      error = result.error;
      savedId = result.data?.id || null;
    }
    if (error) throw error;

    await loadPublicData({ silent: true });
    clearAdminForm();
    showToast(savedId ? `Đã lưu ${flowerCode(savedId)} lên Supabase` : "Đã lưu sản phẩm lên Supabase");
  } catch (error) {
    console.error(error);
    alert(explainSupabaseError(error, "Không thể lưu sản phẩm"));
  } finally {
    button.disabled = false;
    button.textContent = "Lưu sản phẩm";
  }
});


// ---------------- V7.2: Export / Import Excel + xuất toàn bộ dữ liệu website ----------------
function isoDateForFile() {
  return new Date().toISOString().slice(0, 10);
}

function ensureExcelLibrary() {
  if (!window.XLSX?.utils) {
    throw new Error("Không tải được thư viện Excel. Hãy kiểm tra Internet rồi tải lại trang.");
  }
  return window.XLSX;
}

async function fetchAllRowsFromTable(table, orderBy = "id", ascending = true) {
  const pageSize = 1000;
  const rows = [];
  let from = 0;

  while (true) {
    let query = supabaseClient
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);
    if (orderBy) query = query.order(orderBy, { ascending });

    const { data, error } = await query;
    if (error) throw error;
    const page = data || [];
    rows.push(...page);
    if (page.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

async function fetchTransferData() {
  const [categoryRows, rawProductRows] = await Promise.all([
    fetchAllRowsFromTable("categories", "id", true),
    fetchAllRowsFromTable("products", "id", true)
  ]);
  const catMap = new Map(categoryRows.map(c => [Number(c.id), c.name || ""]));
  const productRows = rawProductRows.map(row => ({
    flower_id: flowerCode(row.id),
    name: row.name || "",
    category: catMap.get(Number(row.category_id)) || "",
    price: Number(row.price) || 0,
    description: row.description || "",
    label: row.label || "",
    image_url: row.image_url || "",
    active: row.active !== false,
    sort_order: Number(row.sort_order) || 0
  }));
  return { productRows, categoryRows, rawProductRows };
}

function setExcelColumnWidths(ws) {
  ws["!cols"] = [
    { wch: 16 }, { wch: 30 }, { wch: 24 }, { wch: 16 }, { wch: 42 },
    { wch: 18 }, { wch: 50 }, { wch: 12 }, { wch: 12 }
  ];
  if (ws["!ref"]) ws["!autofilter"] = { ref: ws["!ref"] };
}

function setAutoExcelColumnWidths(ws, rows, minWidth = 12, maxWidth = 52) {
  const keys = rows?.length ? Object.keys(rows[0]) : [];
  ws["!cols"] = keys.map(key => {
    let width = String(key).length + 2;
    for (const row of rows.slice(0, 300)) {
      const value = row?.[key];
      const text = value == null ? "" : String(value);
      width = Math.max(width, Math.min(text.length + 2, maxWidth));
    }
    return { wch: Math.max(minWidth, Math.min(width, maxWidth)) };
  });
  if (ws["!ref"]) ws["!autofilter"] = { ref: ws["!ref"] };
}

async function exportAllWebsiteDataExcel() {
  const button = document.getElementById("adminExportAllDataExcel");
  const oldText = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = "Đang lấy toàn bộ data...";
  }

  try {
    const XLSX = ensureExcelLibrary();
    const [settingsRows, categoryRows, productRows] = await Promise.all([
      fetchAllRowsFromTable("site_settings", "id", true),
      fetchAllRowsFromTable("categories", "id", true),
      fetchAllRowsFromTable("products", "id", true)
    ]);

    const catMap = new Map(categoryRows.map(c => [Number(c.id), c.name || ""]));
    const productExport = productRows.map(row => ({
      flower_id: flowerCode(row.id),
      id: row.id,
      name: row.name || "",
      category_id: row.category_id ?? "",
      category_name: catMap.get(Number(row.category_id)) || "",
      price: Number(row.price) || 0,
      description: row.description || "",
      label: row.label || "",
      image_url: row.image_url || "",
      active: row.active !== false,
      sort_order: Number(row.sort_order) || 0,
      created_at: row.created_at || "",
      updated_at: row.updated_at || ""
    }));

    const categoryExport = categoryRows.map(row => ({
      id: row.id,
      name: row.name || "",
      icon: row.icon || "",
      description: row.description || "",
      active: row.active !== false,
      sort_order: Number(row.sort_order) || 0,
      created_at: row.created_at || ""
    }));

    const settingsExport = settingsRows.map(row => ({
      id: row.id,
      phone: row.phone || "",
      zalo_url: row.zalo_url || "",
      zalo_label: row.zalo_label || "",
      facebook_url: row.facebook_url || "",
      facebook_label: row.facebook_label || "",
      messenger_url: row.messenger_url || "",
      messenger_label: row.messenger_label || "",
      banner_url: row.banner_url || "",
      updated_at: row.updated_at || ""
    }));

    const now = new Date();
    const activeProducts = productRows.filter(row => row.active !== false).length;
    const activeCategories = categoryRows.filter(row => row.active !== false).length;
    const currentSettings = settingsExport.find(row => Number(row.id) === 1) || settingsExport[0] || {};
    const overviewRows = [
      ["HẠNG MỤC", "GIÁ TRỊ"],
      ["Phiên bản website", "V7.2"],
      ["Thời điểm xuất", now.toLocaleString("vi-VN")],
      ["Nguồn dữ liệu", "Supabase - dữ liệu hiện tại trên website"],
      ["Tổng mẫu hoa", productRows.length],
      ["Mẫu hoa đang hiển thị", activeProducts],
      ["Tổng danh mục", categoryRows.length],
      ["Danh mục đang hiển thị", activeCategories],
      ["Hotline", currentSettings.phone || ""],
      ["Tên Zalo", currentSettings.zalo_label || ""],
      ["Link Zalo", currentSettings.zalo_url || ""],
      ["Tên Facebook", currentSettings.facebook_label || ""],
      ["Link Facebook", currentSettings.facebook_url || ""],
      ["Tên Messenger", currentSettings.messenger_label || ""],
      ["Link Messenger", currentSettings.messenger_url || ""],
      ["Banner", currentSettings.banner_url || ""]
    ];

    const wb = XLSX.utils.book_new();

    const wsOverview = XLSX.utils.aoa_to_sheet(overviewRows);
    wsOverview["!cols"] = [{ wch: 28 }, { wch: 72 }];
    XLSX.utils.book_append_sheet(wb, wsOverview, "TongQuan");

    const wsSettings = XLSX.utils.json_to_sheet(settingsExport.length ? settingsExport : [{
      id: "", phone: "", zalo_url: "", zalo_label: "", facebook_url: "", facebook_label: "",
      messenger_url: "", messenger_label: "", banner_url: "", updated_at: ""
    }]);
    setAutoExcelColumnWidths(wsSettings, settingsExport.length ? settingsExport : [{}], 12, 60);
    XLSX.utils.book_append_sheet(wb, wsSettings, "CaiDatWebsite");

    const wsCategories = XLSX.utils.json_to_sheet(categoryExport.length ? categoryExport : [{
      id: "", name: "", icon: "", description: "", active: "", sort_order: "", created_at: ""
    }]);
    setAutoExcelColumnWidths(wsCategories, categoryExport.length ? categoryExport : [{}], 12, 48);
    XLSX.utils.book_append_sheet(wb, wsCategories, "DanhMuc");

    const wsProducts = XLSX.utils.json_to_sheet(productExport.length ? productExport : [{
      flower_id: "", id: "", name: "", category_id: "", category_name: "", price: "", description: "",
      label: "", image_url: "", active: "", sort_order: "", created_at: "", updated_at: ""
    }]);
    setAutoExcelColumnWidths(wsProducts, productExport.length ? productExport : [{}], 12, 56);
    XLSX.utils.book_append_sheet(wb, wsProducts, "MauHoa");

    const noteRows = [
      ["GHI CHÚ", "NỘI DUNG"],
      ["Mục đích", "File này là bản xuất toàn bộ dữ liệu hiện có trên website tại thời điểm tải."],
      ["CaiDatWebsite", "Hotline, link/tên Zalo, Facebook, Messenger, banner và thời gian cập nhật."],
      ["DanhMuc", "Toàn bộ danh mục trong Supabase, kể cả danh mục đang tắt khi tài khoản Admin có quyền đọc."],
      ["MauHoa", "Toàn bộ mẫu hoa, mã HCL, ID database, danh mục, giá, mô tả, ảnh, trạng thái và thời gian."],
      ["Import", "Nút Import hiện tại chỉ đọc sheet MauHoa. Không dùng file toàn bộ data để khôi phục CaiDatWebsite/DanhMuc nếu chưa có chức năng Restore toàn bộ."],
      ["Ảnh", "File Excel lưu URL ảnh, không nhúng file ảnh gốc vào workbook."]
    ];
    const wsNotes = XLSX.utils.aoa_to_sheet(noteRows);
    wsNotes["!cols"] = [{ wch: 22 }, { wch: 90 }];
    XLSX.utils.book_append_sheet(wb, wsNotes, "GhiChu");

    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    XLSX.writeFile(wb, `hoa-co-lau-toan-bo-data-${stamp}.xlsx`, { compression: true });
    showToast(`Đã xuất toàn bộ data: ${productRows.length} mẫu hoa, ${categoryRows.length} danh mục`);
  } catch (error) {
    console.error(error);
    alert(explainSupabaseError(error, "Không thể xuất toàn bộ data website"));
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText || "📦 Xuất toàn bộ data";
    }
  }
}

async function exportProductsExcel() {
  try {
    const XLSX = ensureExcelLibrary();
    const { productRows, categoryRows } = await fetchTransferData();
    const wb = XLSX.utils.book_new();

    const wsProducts = XLSX.utils.json_to_sheet(productRows, {
      header: ["flower_id", "name", "category", "price", "description", "label", "image_url", "active", "sort_order"]
    });
    setExcelColumnWidths(wsProducts);
    XLSX.utils.book_append_sheet(wb, wsProducts, "MauHoa");

    const categoryExport = categoryRows.map(c => ({
      category_id: Number(c.id),
      name: c.name || "",
      icon: c.icon || "",
      description: c.description || "",
      active: c.active !== false,
      sort_order: Number(c.sort_order) || 0
    }));
    const wsCategories = XLSX.utils.json_to_sheet(categoryExport, {
      header: ["category_id", "name", "icon", "description", "active", "sort_order"]
    });
    wsCategories["!cols"] = [{wch:14},{wch:25},{wch:10},{wch:45},{wch:12},{wch:12}];
    if (wsCategories["!ref"]) wsCategories["!autofilter"] = { ref: wsCategories["!ref"] };
    XLSX.utils.book_append_sheet(wb, wsCategories, "DanhMuc");

    const guideRows = [
      ["HƯỚNG DẪN", "CÁCH DÙNG"],
      ["Sheet cần chỉnh", "MauHoa"],
      ["flower_id", "Giữ nguyên mã HCL của hoa cũ. Để trống khi thêm hoa mới."],
      ["name", "Tên mẫu hoa - bắt buộc."],
      ["category", "Tên danh mục. Nếu chưa có, hệ thống sẽ tự tạo khi import."],
      ["price", "Giá bán dạng số, ví dụ 350000."],
      ["description", "Mô tả ngắn."],
      ["label", "Ví dụ: Bán chạy, Mới."],
      ["image_url", "Để trống khi cập nhật hoa cũ để giữ ảnh hiện tại."],
      ["active", "TRUE để hiển thị, FALSE để ẩn."],
      ["sort_order", "Số thứ tự hiển thị."],
      ["Lưu ý", "Import không tự xóa sản phẩm không có trong file Excel."]
    ];
    const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
    wsGuide["!cols"] = [{wch:22},{wch:72}];
    XLSX.utils.book_append_sheet(wb, wsGuide, "HuongDan");

    XLSX.writeFile(wb, `hoa-co-lau-${isoDateForFile()}.xlsx`, { compression: true });
    showToast(`Đã xuất ${productRows.length} mẫu hoa ra Excel`);
  } catch (error) {
    alert(explainSupabaseError(error, "Không thể xuất Excel"));
  }
}

function normalizeExcelHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseBool(value, fallback = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return fallback;
  if (["true", "1", "yes", "y", "co", "có", "active", "bat", "bật", "hien", "hiện"].includes(v)) return true;
  if (["false", "0", "no", "n", "khong", "không", "inactive", "tat", "tắt", "an", "ẩn"].includes(v)) return false;
  return fallback;
}

function normalizeImportRow(row) {
  const normalized = {};
  for (const [key, value] of Object.entries(row || {})) normalized[normalizeExcelHeader(key)] = value;
  const get = (...keys) => {
    for (const key of keys.map(normalizeExcelHeader)) {
      if (normalized[key] != null && String(normalized[key]).trim() !== "") return normalized[key];
    }
    return "";
  };
  return {
    flower_id: String(get("flower_id", "flowerid", "ma_hoa", "mã hoa", "id")).trim(),
    name: String(get("name", "ten", "tên", "ten_san_pham", "tên sản phẩm", "ten_mau_hoa")).trim(),
    category: String(get("category", "danh_muc", "danh mục", "ten_danh_muc")).trim(),
    price: Number(String(get("price", "gia", "giá", "gia_ban", "giá bán")).replace(/[^0-9.-]/g, "")) || 0,
    description: String(get("description", "mo_ta", "mô tả")).trim(),
    label: String(get("label", "nhan", "nhãn")).trim(),
    image_url: String(get("image_url", "image", "hinh_anh", "hình ảnh", "url_hinh_anh")).trim(),
    active: parseBool(get("active", "hien_thi", "hiển thị"), true),
    sort_order: Number(String(get("sort_order", "thu_tu", "thứ tự")).replace(/[^0-9.-]/g, "")) || 0
  };
}

async function readImportFile(file) {
  ensureExcelLibrary();
  const name = String(file?.name || "").toLowerCase();
  if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
    throw new Error("Chỉ hỗ trợ file Excel .xlsx hoặc .xls.");
  }
  const data = await file.arrayBuffer();
  const wb = window.XLSX.read(data, { type: "array", cellDates: false });
  if (!wb.SheetNames?.length) throw new Error("File Excel không có worksheet nào.");
  const wanted = wb.SheetNames.find(n => normalizeExcelHeader(n) === "mauhoa") || wb.SheetNames[0];
  const ws = wb.Sheets[wanted];
  const rawRows = window.XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
  return rawRows.map(normalizeImportRow).filter(row => Object.values(row).some(v => String(v ?? "").trim() !== ""));
}

async function getOrCreateCategoryId(name, categoryMap, maxSortRef) {
  const clean = String(name || "").trim() || "Chưa phân loại";
  const key = clean.toLowerCase();
  if (categoryMap.has(key)) return categoryMap.get(key);
  maxSortRef.value += 1;
  const { data, error } = await supabaseClient.from("categories").insert({
    name: clean,
    icon: "🌸",
    description: "Danh mục được tạo khi import dữ liệu Excel",
    active: true,
    sort_order: maxSortRef.value
  }).select("id,name").single();
  if (error) throw error;
  categoryMap.set(String(data.name).toLowerCase(), Number(data.id));
  return Number(data.id);
}

async function importProductsFile(file) {
  const incoming = await readImportFile(file);
  if (!incoming.length) throw new Error("File Excel không có dòng sản phẩm nào trong sheet MauHoa.");

  const [catRes, prodRes] = await Promise.all([
    supabaseClient.from("categories").select("id,name,sort_order"),
    supabaseClient.from("products").select("id,image_url")
  ]);
  if (catRes.error) throw catRes.error;
  if (prodRes.error) throw prodRes.error;

  const categoryMap = new Map((catRes.data || []).map(c => [String(c.name || "").trim().toLowerCase(), Number(c.id)]));
  const maxSortRef = { value: (catRes.data || []).reduce((m, c) => Math.max(m, Number(c.sort_order) || 0), 0) };
  const existingMap = new Map((prodRes.data || []).map(p => [Number(p.id), p]));
  let updated = 0, added = 0, skipped = 0;
  const errors = [];

  for (let index = 0; index < incoming.length; index++) {
    const row = incoming[index];
    if (!row.name) { skipped++; errors.push(`Dòng ${index + 2}: thiếu tên sản phẩm.`); continue; }
    try {
      const categoryId = await getOrCreateCategoryId(row.category, categoryMap, maxSortRef);
      const requestedId = flowerIdToDbId(row.flower_id);
      const existing = requestedId ? existingMap.get(requestedId) : null;
      const payload = {
        name: row.name,
        price: Math.max(0, Number(row.price) || 0),
        category_id: categoryId,
        description: row.description || "",
        label: row.label || "",
        image_url: row.image_url || existing?.image_url || "",
        active: row.active !== false,
        sort_order: Number(row.sort_order) || 0,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { error } = await supabaseClient.from("products").update(payload).eq("id", requestedId);
        if (error) throw error;
        updated++;
      } else {
        delete payload.updated_at;
        const { data, error } = await supabaseClient.from("products").insert(payload).select("id,image_url").single();
        if (error) throw error;
        existingMap.set(Number(data.id), data);
        added++;
      }
    } catch (error) {
      skipped++;
      errors.push(`Dòng ${index + 2} (${row.name}): ${error.message || error}`);
    }
  }
  return { total: incoming.length, updated, added, skipped, errors };
}

function setImportStatus(text, state = "") {
  if (!adminImportStatus) return;
  adminImportStatus.textContent = text;
  if (state) adminImportStatus.dataset.state = state;
  else adminImportStatus.removeAttribute("data-state");
}

document.getElementById("adminExportExcel")?.addEventListener("click", exportProductsExcel);
document.getElementById("adminExportAllDataExcel")?.addEventListener("click", exportAllWebsiteDataExcel);

adminImportFile?.addEventListener("change", async () => {
  const file = adminImportFile.files?.[0];
  adminImportBtn.disabled = !file;
  if (!file) { setImportStatus("Chưa chọn file Excel import."); return; }
  try {
    const rows = await readImportFile(file);
    const withId = rows.filter(r => flowerIdToDbId(r.flower_id)).length;
    const newRows = rows.length - withId;
    setImportStatus(`Đã đọc ${rows.length} dòng Excel. ${withId} dòng có mã hoa để cập nhật, ${newRows} dòng sẽ tạo sản phẩm mới.`, "ok");
  } catch (error) {
    adminImportBtn.disabled = true;
    setImportStatus(`Không đọc được file Excel: ${error.message || error}`, "warn");
  }
});

adminImportBtn?.addEventListener("click", async () => {
  const file = adminImportFile.files?.[0];
  if (!file) return;
  if (!confirm("Import Excel sẽ cập nhật sản phẩm theo mã HCL và thêm các dòng mới. Không có sản phẩm nào bị xóa. Tiếp tục?")) return;
  adminImportBtn.disabled = true;
  adminImportBtn.textContent = "Đang import Excel...";
  setImportStatus("Đang ghi dữ liệu Excel lên Supabase...", "");
  try {
    const result = await importProductsFile(file);
    await loadPublicData({ silent: true });
    const details = result.errors.length ? `\nLỗi/bỏ qua đầu tiên:\n${result.errors.slice(0, 5).join("\n")}` : "";
    setImportStatus(`Hoàn tất ${result.total} dòng: cập nhật ${result.updated}, thêm mới ${result.added}, bỏ qua/lỗi ${result.skipped}.${details}`, result.skipped ? "warn" : "ok");
    showToast("Import Excel dữ liệu hoa hoàn tất");
    adminImportFile.value = "";
  } catch (error) {
    console.error(error);
    setImportStatus(explainSupabaseError(error, "Import Excel thất bại"), "warn");
  } finally {
    adminImportBtn.disabled = false;
    adminImportBtn.textContent = "Import Excel vào website";
  }
});

async function ensureDefaultCategoriesInDatabase() {
  const { data: existing, error } = await supabaseClient.from("categories").select("id,name");
  if (error) throw error;
  const existingNames = new Set((existing || []).map(x => String(x.name).toLowerCase()));
  const missing = defaultCategories
    .filter(c => !existingNames.has(c.name.toLowerCase()))
    .map((c, index) => ({
      name: c.name,
      icon: c.icon,
      description: c.desc,
      active: true,
      sort_order: c.sortOrder || index + 1
    }));
  if (missing.length) {
    const { error: insertError } = await supabaseClient.from("categories").insert(missing);
    if (insertError) throw insertError;
  }
  const { data, error: reloadError } = await supabaseClient.from("categories").select("*").order("sort_order", { ascending: true });
  if (reloadError) throw reloadError;
  return data || [];
}

document.getElementById("adminResetSamples")?.addEventListener("click", async () => {
  if (!confirm("Khôi phục sản phẩm mẫu lên Supabase? Sản phẩm hiện có sẽ bị xóa và thay bằng bộ mẫu.")) return;
  try {
    const dbCategories = await ensureDefaultCategoriesInDatabase();
    const categoryMap = new Map(dbCategories.map(c => [String(c.name).toLowerCase(), c.id]));
    const localNameMap = new Map(defaultCategories.map(c => [c.id, c.name]));

    const rows = defaultProducts.map((p, index) => ({
      name: p.name,
      price: p.price,
      category_id: categoryMap.get(String(localNameMap.get(p.category) || "").toLowerCase()) || null,
      description: p.desc,
      label: p.badge,
      image_url: "",
      active: true,
      sort_order: index + 1
    }));

    const { error: deleteError } = await supabaseClient.from("products").delete().gte("id", 0);
    if (deleteError) throw deleteError;
    const { error: insertError } = await supabaseClient.from("products").insert(rows);
    if (insertError) throw insertError;
    await loadPublicData({ silent: true });
    clearAdminForm();
    showToast("Đã khôi phục sản phẩm mẫu lên Supabase");
  } catch (error) {
    alert(explainSupabaseError(error, "Không thể khôi phục sản phẩm mẫu"));
  }
});

// Khi có phiên đăng nhập/đăng xuất ở tab khác, cập nhật trạng thái Admin.
supabaseClient.auth.onAuthStateChange((_event, session) => {
  adminUnlocked = Boolean(session?.user);
  if (!adminShell?.hidden) {
    adminLogin.hidden = adminUnlocked;
    adminApp.hidden = !adminUnlocked;
  }
});

// Khởi động website.
applySiteSettings();
renderCategoryUI();
renderProducts();
renderCart();
loadPublicData({ silent: true }).finally(() => {
  startCrossDeviceSettingsSync();
});
checkAdminHash();
