// YÊU CẦU: đã có CONFIG.BASE_URL từ ../assets/js/config.js

(function(){
  const form   = document.getElementById('registerForm');
  const msgEl  = document.getElementById('msg');
  const btn    = document.getElementById('btnRegister');

  const usernameEl = document.getElementById('username');
  const emailEl    = document.getElementById('email');
  const phoneEl    = document.getElementById('phone');
  const passEl     = document.getElementById('password');
  const confirmEl  = document.getElementById('confirm');
  const agreeEl    = document.getElementById('agree');

  const togglePass    = document.getElementById('togglePass');
  const toggleConfirm = document.getElementById('toggleConfirm');

  function showError(t){ msgEl.textContent = t; msgEl.className='error'; }
  function showSuccess(t){ msgEl.textContent = t; msgEl.className='success'; }

  function validate(){
    const username = usernameEl.value.trim();
    const email    = emailEl.value.trim();
    const phone    = phoneEl.value.trim();
    const password = passEl.value;
    const confirm  = confirmEl.value;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneOk = /^0\d{9}$/.test(phone);

    if(!username) return showError('Vui lòng nhập tên hiển thị.'), null;
    if(!emailOk)  return showError('Email không hợp lệ.'), null;
    if(!phoneOk)  return showError('SĐT VN phải 10 số, bắt đầu bằng 0.'), null;
    if(password.length < 6) return showError('Mật khẩu tối thiểu 6 ký tự.'), null;
    if(password !== confirm) return showError('Mật khẩu nhập lại không khớp.'), null;
    if(!agreeEl.checked) return showError('Vui lòng đồng ý Điều khoản & Chính sách.'), null;

    msgEl.textContent = ''; msgEl.className='';
    return { username, email, phone, password };
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

  // events
  togglePass.addEventListener('click', ()=> {
    passEl.type = (passEl.type === 'password') ? 'text' : 'password';
  });
  toggleConfirm.addEventListener('click', ()=> {
    confirmEl.type = (confirmEl.type === 'password') ? 'text' : 'password';
  });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = validate();
    if(!payload) return;

    try{
      btn.disabled = true; btn.style.opacity = .7;
      await post('/auth/register', payload);
      showSuccess('Đăng ký thành công! Đang chuyển tới đăng nhập...');
      setTimeout(()=> location.href = './login.html', 1200);
    }catch(err){
      showError(err.message);
    }finally{
      btn.disabled = false; btn.style.opacity = 1;
    }
  });
})();
