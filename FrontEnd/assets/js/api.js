function getToken(){ return localStorage.getItem("token") || ""; }
function setToken(t){ if(t) localStorage.setItem("token", t); }
function clearToken(){ localStorage.removeItem("token"); }
function setUserInfo(role, email){ if(role) localStorage.setItem("role_name", role); if(email) localStorage.setItem("user_email", email); }
function getRole(){ return localStorage.getItem("role_name") || ""; }
function authHeader(){ const t = getToken(); return t ? {"Authorization":"Bearer "+t} : {}; }
async function api(path, { method="GET", body=null, auth=false, headers={} } = {}){
  const url = CONFIG.BASE_URL + path;
  const allHeaders = { "Content-Type": "application/json", ...headers };
  if(auth){ Object.assign(allHeaders, authHeader()); }
  const res = await fetch(url, { method, headers: allHeaders, body: body ? JSON.stringify(body) : null });
  const raw = await res.text();
  let data; try { data = JSON.parse(raw); } catch { data = { raw }; }
  if(!res.ok) throw new Error(data?.message || ("HTTP "+res.status));
  return data;
}
function updateNavAuth(){
  const isAuthed = !!getToken();
  document.querySelectorAll(".nav-login").forEach(e=> e.style.display = isAuthed ? "none":"inline");
  document.querySelectorAll(".nav-logout").forEach(e=> e.style.display = isAuthed ? "inline":"none");
  document.querySelectorAll(".nav-my").forEach(e=> e.style.display = isAuthed ? "inline":"none");
  const role = getRole();
  document.querySelectorAll(".nav-admin").forEach(e=> e.style.display = (role==="admin"||role==="super_admin")?"inline":"none");
}
function logout(){ clearToken(); localStorage.removeItem("role_name"); localStorage.removeItem("user_email"); updateNavAuth(); location.href = "./index.html"; }
function guardCustomer(){ if(!getToken()){ alert("Bạn cần đăng nhập!"); location.href = "./pages/login.html"; } }
function guardAdmin(){
  const role = getRole();
  if(role!=="admin" && role!=="super_admin"){
    alert("Chỉ admin được phép truy cập!");
    location.href = "../login.html";
  }
}