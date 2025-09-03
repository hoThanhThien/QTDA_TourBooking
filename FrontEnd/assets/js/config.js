/***** CONFIG: chọn API base chạy được cả local & host *****/
const PRODUCTION_API = "https://api.ten-mien-cua-ban.com"; // hoặc "/Backend/public"
const LOCAL_API      = "http://127.0.0.1:8000";

function rootDomain(host){
  const parts = host.split('.');
  return parts.length >= 2 ? parts.slice(-2).join('.') : host;
}

(function initConfig(){
  const qs = new URLSearchParams(location.search);
  const fromQuery   = qs.get('api');
  const fromStorage = localStorage.getItem('api_base');
  const h = location.hostname;

  let base;
  if (fromQuery) {
    base = fromQuery;
    localStorage.setItem('api_base', base);
  } else if (fromStorage) {
    base = fromStorage;
  } else if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local') || h.endsWith('.test')) {
    base = LOCAL_API; // local
  } else {
    const guess = `https://api.${rootDomain(h)}`;
    base = PRODUCTION_API || guess;
  }

  window.CONFIG = {
    BASE_URL: base,
    setApiBase(v){
      if(!v) return;
      localStorage.setItem('api_base', v);
      window.CONFIG.BASE_URL = v;
      console.info('[CONFIG] API base =>', v);
    }
  };

  // Thử ping nhanh, nếu fail thì fallback LOCAL/PROD/relative
  window.API_READY = (async () => {
    async function ok(u){
      try{
        const ctl = new AbortController();
        const t = setTimeout(()=>ctl.abort(), 1500);
        const res = await fetch(u + '/tours?page=1&page_size=1', { signal: ctl.signal });
        clearTimeout(t);
        return res.ok;
      }catch{ return false; }
    }
    if (await ok(window.CONFIG.BASE_URL)) return;

    const backups = [];
    if (window.CONFIG.BASE_URL !== PRODUCTION_API && PRODUCTION_API) backups.push(PRODUCTION_API);
    if (window.CONFIG.BASE_URL !== LOCAL_API) backups.push(LOCAL_API);
    if (!backups.includes('/Backend/public')) backups.push('/Backend/public');

    for (const b of backups){
      if (!b) continue;
      if (await ok(b)) { window.CONFIG.setApiBase(b); return; }
    }
  })();
})();