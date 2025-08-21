// assets/js/config.js
// 👉 Sửa PRODUCTION_API theo hạ tầng của bạn.
// Nếu FE & BE chung domain (API đặt ở /Backend/public) thì dùng đường dẫn tương đối: "/Backend/public"
const PRODUCTION_API = "https://api.ten-mien-cua-ban.com"; // hoặc "/Backend/public"
const LOCAL_API      = "http://127.0.0.1:8000";

// Helper: root domain (vd: www.example.com -> example.com)
function rootDomain(host){
  const parts = host.split('.'); 
  return parts.length >= 2 ? parts.slice(-2).join('.') : host;
}

// 1) Ưu tiên query ?api=...  2) localStorage('api_base')  3) tự nhận theo hostname
(function initConfig(){
  const qs = new URLSearchParams(location.search);
  const fromQuery   = qs.get('api');
  const fromStorage = localStorage.getItem('api_base');

  let base;
  const h = location.hostname;

  if (fromQuery) {
    base = fromQuery;
    localStorage.setItem('api_base', base);
  } else if (fromStorage) {
    base = fromStorage;
  } else if (
    h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local') || h.endsWith('.test')
  ) {
    base = LOCAL_API;                // đang chạy local
  } else {
    // sản xuất: nếu bạn dùng subdomain api.<domain>, có thể đoán tự động
    const guess = `https://api.${rootDomain(h)}`;
    base = PRODUCTION_API || guess;  // dùng PRODUCTION_API nếu đã set
  }

  // Tạo global
  window.CONFIG = {
    BASE_URL: base,
    setApiBase(v){ 
      if(!v) return;
      localStorage.setItem('api_base', v); 
      window.CONFIG.BASE_URL = v; 
      console.info('[CONFIG] API base =>', v);
    }
  };

  // Tự kiểm tra nhanh: nếu base hiện tại không phản hồi sẽ thử base còn lại
  window.API_READY = (async () => {
    async function ok(u){
      try{
        const ctl = new AbortController();
        const t = setTimeout(()=>ctl.abort(), 1500);
        const res = await fetch(u + '/tours?page=1&page_size=1', {signal: ctl.signal});
        clearTimeout(t);
        return res.ok;
      }catch{ return false; }
    }
    if (await ok(window.CONFIG.BASE_URL)) return;

    // Thử các phương án dự phòng:
    const backups = [];
    if (window.CONFIG.BASE_URL !== PRODUCTION_API) backups.push(PRODUCTION_API);
    if (window.CONFIG.BASE_URL !== LOCAL_API)      backups.push(LOCAL_API);
    if (!backups.includes('/Backend/public')) backups.push('/Backend/public');

    for (const b of backups){
      if (!b) continue;
      if (await ok(b)){ window.CONFIG.setApiBase(b); return; }
    }
  })();
})();
