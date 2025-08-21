// YÊU CẦU: đã có CONFIG.BASE_URL từ ../assets/js/config.js

(function(){
  const form = document.getElementById('loginForm');
  const emailEl = document.getElementById('email');
  const passEl  = document.getElementById('password');
  const rememberEl = document.getElementById('remember');
  const msgEl   = document.getElementById('msg');
  const btn     = document.getElementById('btnLogin');
  const toggle  = document.getElementById('togglePass');

  function setToken(t){ if(t) localStorage.setItem('token', t); }
  function setUserInfo(role, email){
    if(role) localStorage.setItem('role_name', role);
    if(email) localStorage.setItem('user_email', email);
  }

  async function post(path, body){
    const res = await fetch(CONFIG.BASE_URL + path, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(body || {})
    });
    const raw = await res.text();
    let data; try { data = JSON.parse(raw); } catch { data = { raw }; }
    if(!res.ok) throw new Error(data?.message || ('HTTP '+res.status));
    return data;
  }

  toggle.addEventListener('click', () => {
    passEl.type = (passEl.type === 'password') ? 'text' : 'password';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.textContent = '';
    const email = emailEl.value.trim();
    const password = passEl.value;

    if(!email || !password){
      msgEl.textContent = 'Vui lòng nhập email và mật khẩu.';
      return;
    }

    try{
      btn.disabled = true; btn.style.opacity = .7;

      const res = await post('/auth/login', { email, password });
      const token = res?.data?.token;
      const role  = res?.data?.user?.role;
      const uemail= res?.data?.user?.email;
      if(!token) throw new Error('Không nhận được token');

      setToken(token);
      setUserInfo(role, uemail);

      // (Tùy chọn) nếu không nhớ đăng nhập bạn có thể lưu token vào sessionStorage thay vì localStorage

      if(role === 'admin' || role === 'super_admin'){
        location.href = '../pages/admin/dashboard.html';
      } else {
        location.href = '../index.html';
      }
    }catch(err){
      msgEl.textContent = err.message;
    }finally{
      btn.disabled = false; btn.style.opacity = 1;
    }
  });
})();
