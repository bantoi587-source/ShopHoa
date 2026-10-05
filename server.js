const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'site-settings.json');
const PORT = Number(process.env.PORT || 3000);

const DEFAULT_SETTINGS = {
  phone: '0353 72 42 32',
  zalo: '',
  zaloName: 'Zalo Hoa Cỏ Lau',
  facebook: '',
  facebookName: 'Facebook Hoa Cỏ Lau',
  messenger: '',
  messengerName: 'Messenger Hoa Cỏ Lau',
  banner: 'assets/banner-hoa-co-lau.webp'
};

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
}

function readSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function sendJson(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(json)
  });
  res.end(json);
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  }[ext] || 'application/octet-stream';
}

function serveStatic(req, res) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname); }
  catch { pathname = '/'; }
  if (pathname === '/') pathname = '/index.html';
  const normalized = path.normalize(pathname).replace(/^([.][.][/\\])+/, '');
  const filePath = path.join(ROOT, normalized);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Không tìm thấy trang.');
    }
    res.writeHead(200, { 'Content-Type': mimeType(filePath), 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/settings')) {
    if (req.method === 'GET') {
      return sendJson(res, 200, readSettings());
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 8 * 1024 * 1024) req.destroy();
      });
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body || '{}');
          const current = readSettings();
          const next = {
            ...current,
            phone: String(incoming.phone ?? current.phone).slice(0, 60),
            zalo: String(incoming.zalo ?? current.zalo).slice(0, 1000),
            zaloName: String(incoming.zaloName ?? current.zaloName).slice(0, 160),
            facebook: String(incoming.facebook ?? current.facebook).slice(0, 1000),
            facebookName: String(incoming.facebookName ?? current.facebookName).slice(0, 160),
            messenger: String(incoming.messenger ?? current.messenger).slice(0, 1000),
            messengerName: String(incoming.messengerName ?? current.messengerName).slice(0, 160),
            banner: String(incoming.banner ?? current.banner)
          };
          fs.writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2), 'utf8');
          return sendJson(res, 200, { ok: true, settings: next });
        } catch (error) {
          return sendJson(res, 400, { ok: false, error: 'Dữ liệu không hợp lệ' });
        }
      });
      return;
    }
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }
  serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  const addresses = [];
  const nets = os.networkInterfaces();
  for (const list of Object.values(nets)) {
    for (const net of list || []) {
      if (net.family === 'IPv4' && !net.internal) addresses.push(net.address);
    }
  }
  console.log('');
  console.log('==============================================');
  console.log(' HOA CO LAU - WEB SERVER V5');
  console.log('==============================================');
  console.log(`May tinh: http://localhost:${PORT}`);
  if (addresses.length) {
    console.log('Dien thoai (cung Wi-Fi):');
    addresses.forEach(ip => console.log(`  http://${ip}:${PORT}`));
  }
  console.log('');
  console.log('Hay GIU cua so nay mo khi dang dung website.');
  console.log('Nhan Ctrl + C de tat server.');
  console.log('==============================================');
  console.log('');
});
