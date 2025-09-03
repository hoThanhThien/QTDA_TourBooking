function getToken(){ return localStorage.getItem("token") || ""; }
function setToken(t){ if(t) localStorage.setItem("token", t); }
function clearToken(){ localStorage.removeItem("token"); }
function setUserInfo(role, email){ if(role) localStorage.setItem("role_name", role); if(email) localStorage.setItem("user_email", email); }
function getRole(){ return localStorage.getItem("role_name") || ""; }
function authHeader(){ const t = getToken(); return t ? {"Authorization":"Bearer "+t} : {}; }

async function api(path, { method='GET', auth=false, body=null, headers={} } = {}) {
  if (window.API_READY && typeof window.API_READY.then === 'function') { await window.API_READY; }
  const BASE = window.CONFIG.BASE_URL;

  const h = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const tk = getToken();
    if (tk) h['Authorization'] = 'Bearer ' + tk;
  }
  const res = await fetch(BASE + path, {
    method, headers: h, body: body ? JSON.stringify(body) : null
  });
  const raw = await res.text();
  let data; try { data = JSON.parse(raw); } catch { data = { raw }; }
  if (!res.ok) throw new Error(data?.message || ('HTTP '+res.status));
  return data;
}

function updateNavAuth(){
  const isAuthed = !!getToken();
  qsa(".nav-login").forEach(e=> e.style.display = isAuthed ? "none":"inline");
  qsa(".nav-logout").forEach(e=> e.style.display = isAuthed ? "inline":"none");
  qsa(".nav-my").forEach(e=> e.style.display = isAuthed ? "inline":"none");
  const role = (getRole() || '').toLowerCase();
  qsa(".nav-admin").forEach(e=> e.style.display = (role==='admin' || role==='super_admin') ? "inline" : "none");
}

/* Điều hướng đúng ở mọi trang (root/pages/pages/admin) */
function logout(){ clearToken(); localStorage.removeItem("role_name"); localStorage.removeItem("user_email"); updateNavAuth(); go('index.html'); }
function guardCustomer(){ if(!getToken()){ alert("Bạn cần đăng nhập!"); go('pages/login.html'); } }
function guardAdmin(){
  const role = (getRole() || '').toLowerCase();
  if(role!=="admin" && role!=="super_admin"){
    alert("Chỉ admin được phép truy cập!"); go('pages/login.html');
  }
}