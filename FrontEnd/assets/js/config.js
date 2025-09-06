/***** CONFIG — chạy được cả local & host *****/
const PRODUCTION_API = "https://api.ten-mien-cua-ban.com";   // đổi thành API thật nếu có
const LOCAL_API      = "http://127.0.0.1:8000";              // PHP built-in server / XAMPP

function rootDomain(host){
  const parts = host.split('.');
  return parts.length >= 2 ? parts.slice(-2).join('.') : host;
}

(function initConfig(){
  const qs = new URLSearchParams(location.search);
  const apiFromQuery = qs.get('api');
  const apiFromStore = localStorage.getItem('api_base');
  const h = location.hostname;

  // --- chọn API base ---
  let base;
  if (apiFromQuery) {
    base = apiFromQuery;
    localStorage.setItem('api_base', base);
  } else if (apiFromStore) {
    base = apiFromStore;
  } else if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local') || h.endsWith('.test')) {
    base = LOCAL_API;
  } else {
    // mặc định đoán theo host hiện tại
    base = PRODUCTION_API || `https://api.${rootDomain(h)}`;
  }

  // --- token: lấy từ query -> storage ---
  const tokenFromQuery = qs.get('token');
  if (tokenFromQuery) {
    localStorage.setItem('access_token', tokenFromQuery);
  }

  window.CONFIG = {
    BASE_URL: base,
    getApiBase(){ return window.CONFIG.BASE_URL; },
    setApiBase(v){
      if (!v) return;
      localStorage.setItem('api_base', v);
      window.CONFIG.BASE_URL = v;
      console.info('[CONFIG] API base =>', v);
    },
    getToken(){
      return (
        new URLSearchParams(location.search).get('token') ||
        localStorage.getItem('access_token') ||
        sessionStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('jwt') || ''
      );
    },
    setToken(t){
      if (!t) return;
      localStorage.setItem('access_token', t);
    },
    clearToken(){
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
    }
  };

  // --- ping nhanh & fallback ---
  window.API_READY = (async () => {
    async function ok(u){
      try{
        const ctl = new AbortController();
        const t = setTimeout(()=>ctl.abort(), 1500);
        const res = await fetch(u.replace(/\/$/,'') + '/tours?page=1&page_size=1', { signal: ctl.signal });
        clearTimeout(t);
        return res.ok;
      }catch{ return false; }
    }
    if (await ok(window.CONFIG.BASE_URL)) return;

    const backups = [];
    if (window.CONFIG.BASE_URL !== PRODUCTION_API && PRODUCTION_API) backups.push(PRODUCTION_API);
    if (window.CONFIG.BASE_URL !== LOCAL_API) backups.push(LOCAL_API);
    if (!backups.includes('/Backend/public')) backups.push('/Backend/public');  // trường hợp deploy chung domain

    for (const b of backups){
      if (!b) continue;
      if (await ok(b)) { window.CONFIG.setApiBase(b); return; }
    }
  })();
})();
