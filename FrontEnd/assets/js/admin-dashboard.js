// Uses: CONFIG, api(), updateNavAuth(), setBaseUrlHint(), guardAdmin() from your base JS.

(function(){
  const sel = (q,p=document)=>p.querySelector(q);

  function fmtMoney(v){
    if(v==null || isNaN(v)) return '—';
    return Number(v).toLocaleString('vi-VN') + 'đ';
  }

  function fmtDate(s){
    if(!s) return '';
    const d = new Date(s.replace(' ','T'));
    if(isNaN(+d)) return s;
    return d.toLocaleString('vi-VN');
  }

  async function totalFrom(endpoint, {auth=false, params={}}={}){
    const qs = new URLSearchParams({ page: 1, page_size: 1, ...params });
    const res = await api(`${endpoint}?${qs.toString()}`, { auth });
    return res?.data?.meta?.total ?? 0;
  }

  async function listFrom(endpoint, {auth=false, params={}}={}){
    const qs = new URLSearchParams({ page: 1, page_size: 8, ...params });
    const res = await api(`${endpoint}?${qs.toString()}`, { auth });
    return res?.data?.items ?? [];
  }

  async function revenueLast30Days(){
    // Sum total_amount of Confirmed bookings in last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate()-30);

    const date_to = end.toISOString().slice(0,10);
    const date_from = start.toISOString().slice(0,10);

    let page = 1, total = 0, hasNext = true;

    while(hasNext){
      const qs = new URLSearchParams({
        page, page_size: 200, status: 'Confirmed', date_from, date_to
      });
      const res = await api(`/bookings?${qs.toString()}`, { auth: true });
      const items = res?.data?.items || [];
      for(const b of items){
        const v = Number(b.total_amount || 0);
        if(!isNaN(v)) total += v;
      }
      const meta = res?.data?.meta || {};
      hasNext = !!meta.has_next;
      page = (meta.page||page) + 1;
      if(page>50) break; // guard
    }
    return total;
  }

  function fillUserChip(){
    const role = localStorage.getItem('role_name') || '';
    const email = localStorage.getItem('user_email') || '';
    const roleEl = sel('#roleName'); const emailEl = sel('#userEmail');
    if(roleEl) roleEl.textContent = role || 'Admin';
    if(emailEl) emailEl.textContent = email || '';
  }

  async function loadStats(){
    const setText = (id, txt)=>{ const el = sel(id); if(el) el.textContent = txt; };

    try{
      // counts
      const [
        tours, bookings, pending, cats, users
      ] = await Promise.all([
        totalFrom('/tours'),
        totalFrom('/bookings', { auth:true }),
        totalFrom('/bookings', { auth:true, params:{ status:'Pending' } }),
        totalFrom('/categories'),
        totalFrom('/users', { auth:true })
      ]);

      setText('#statTours', String(tours));
      setText('#statBookings', String(bookings));
      setText('#statPending', String(pending));
      setText('#statCats', String(cats));
      setText('#statUsers', String(users));

      setText('#statToursHint', 'tất cả tours');
      setText('#statBookingsHint', 'mọi trạng thái');
      setText('#statPendingHint', 'chờ duyệt');
      setText('#statCatsHint', 'loại tour');
      setText('#statUsersHint', 'tài khoản');

      // revenue
      const rev = await revenueLast30Days();
      setText('#statRevenue', fmtMoney(rev));
    }catch(e){
      console.error(e);
    }
  }

  async function loadRecent(){
    // Bookings
    try{
      const items = await listFrom('/bookings', { auth:true, params:{ page_size:8 } });
      const tb = sel('#recentBookings');
      if(!items.length){
        tb.innerHTML = `<tr><td colspan="7" class="muted">Chưa có dữ liệu</td></tr>`;
      } else {
        tb.innerHTML = items.map(b => `
          <tr>
            <td>#${b.id}</td>
            <td>${b.username||''}</td>
            <td>${b.title||''}</td>
            <td>${b.number_of_people||0}</td>
            <td>${b.status}</td>
            <td>${Number(b.total_amount||0).toLocaleString('vi-VN')}đ</td>
            <td>${fmtDate(b.created_at)}</td>
          </tr>
        `).join('');
      }
    }catch(e){
      sel('#recentBookings').innerHTML = `<tr><td colspan="7" class="muted">Lỗi tải bookings: ${e.message}</td></tr>`;
    }

    // Tours
    try{
      const items = await listFrom('/tours', { params:{ page_size:6, sort:'created_at_desc' }});
      const wrap = sel('#recentTours');
      if(!items.length){
        wrap.innerHTML = `<div class="muted">Chưa có tour</div>`;
      } else {
        wrap.innerHTML = items.map(t => `
          <div class="t-card">
            <img class="t-cover" src="${t.primary_photo || 'https://picsum.photos/seed/'+t.id+'/176/120'}" alt="">
            <div>
              <div class="t-title">${t.title}</div>
              <div class="t-meta">${t.location||''} · ${Number(t.price).toLocaleString('vi-VN')}đ</div>
            </div>
          </div>
        `).join('');
      }
    }catch(e){
      sel('#recentTours').innerHTML = `<div class="muted">Lỗi tải tours: ${e.message}</div>`;
    }
  }

  function boot(){
    // Auth/UI init
    updateNavAuth();
    setBaseUrlHint();
    guardAdmin();
    fillUserChip();

    // Events
    const btnRefresh = sel('#btnRefresh');
    if(btnRefresh) btnRefresh.addEventListener('click', ()=>{
      loadStats(); loadRecent();
    });

    // Load data
    loadStats();
    loadRecent();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
