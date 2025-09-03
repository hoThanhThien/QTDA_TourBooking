// Dashboard: thống kê + recent lists (đếm KHÁCH HÀNG, loại admin)
(function(){
  const $ = (q,p=document)=>p.querySelector(q);

  function fmtMoney(v){ return (v==null||isNaN(v)) ? '—' : Number(v).toLocaleString('vi-VN')+'đ'; }
  function fmtDate(s){
    if(!s) return '';
    const d=new Date(String(s).replace(' ','T'));
    return isNaN(+d)? s : d.toLocaleString('vi-VN');
  }

  async function totalFrom(endpoint,{auth=false,params={}}={}){
    const qs=new URLSearchParams({page:1,page_size:1,...params});
    const r=await api(`${endpoint}?${qs}`,{auth});
    return r?.data?.meta?.total ?? 0;
  }
  async function listFrom(endpoint,{auth=false,params={}}={}){
    const qs=new URLSearchParams({page:1,page_size:8,...params});
    const r=await api(`${endpoint}?${qs}`,{auth});
    return r?.data?.items ?? [];
  }

  async function countCustomers(){
    // nếu backend hỗ trợ ?role=customer -> dùng luôn
    try{
      const q=new URLSearchParams({page:1,page_size:1,role:'customer'});
      const r=await api(`/users?${q}`,{auth:true});
      const t=r?.data?.meta?.total;
      if(typeof t==='number') return t;
    }catch{}
    // fallback: duyệt tất cả, loại admin/super_admin
    let page=1,total=0,hasNext=true;
    while(hasNext){
      const qs=new URLSearchParams({page,page_size:200});
      const r=await api(`/users?${qs}`,{auth:true});
      const items=r?.data?.items||[];
      for(const u of items){
        const role=(u.role||u.role_name||'').toLowerCase();
        if(role && role!=='admin' && role!=='super_admin') total++;
      }
      const m=r?.data?.meta||{};
      hasNext=!!m.has_next; page=(m.page||page)+1; if(page>50) break;
    }
    return total;
  }

  async function revenueLast30Days(){
    const end=new Date(), start=new Date(); start.setDate(end.getDate()-30);
    const date_to=end.toISOString().slice(0,10), date_from=start.toISOString().slice(0,10);
    let page=1,total=0,hasNext=true;
    while(hasNext){
      const qs=new URLSearchParams({page,page_size:200,status:'Confirmed',date_from,date_to});
      const r=await api(`/bookings?${qs}`,{auth:true});
      const items=r?.data?.items||[];
      for(const b of items){ const v=Number(b.total_amount||0); if(!isNaN(v)) total+=v; }
      const m=r?.data?.meta||{}; hasNext=!!m.has_next; page=(m.page||page)+1; if(page>50) break;
    }
    return total;
  }

  function fillUserChip(){
    const role=localStorage.getItem('role_name')||'admin';
    const email=localStorage.getItem('user_email')||'';
    $('#roleName').textContent=role; $('#userEmail').textContent=email;
  }

  async function loadStats(){
    const set=(id,txt)=>{ const el=$(id); if(el) el.textContent=txt; };
    try{
      const [tours,bookings,pending,cats,customers]=await Promise.all([
        totalFrom('/tours'),
        totalFrom('/bookings',{auth:true}),
        totalFrom('/bookings',{auth:true,params:{status:'Pending'}}),
        totalFrom('/categories'),
        countCustomers()
      ]);
      set('#statTours',tours); set('#statBookings',bookings); set('#statPending',pending);
      set('#statCats',cats); set('#statUsers',customers);
      $('#statToursHint').textContent='tất cả tours';
      $('#statBookingsHint').textContent='mọi trạng thái';
      $('#statPendingHint').textContent='chờ duyệt';
      $('#statCatsHint').textContent='loại tour';
      $('#statUsersHint').textContent='khách hàng';
      const rev=await revenueLast30Days();
      $('#statRevenue').textContent=fmtMoney(rev);
    }catch(e){ console.error(e); }
  }

  async function loadRecent(){
    // bookings
    try{
      const items=await listFrom('/bookings',{auth:true,params:{page_size:8}});
      const tb=$('#recentBookings');
      if(!items.length){ tb.innerHTML=`<tr><td colspan="7" class="muted">Chưa có dữ liệu</td></tr>`; }
      else{
        tb.innerHTML=items.map(b=>`
          <tr>
            <td>#${b.id}</td><td>${b.username||''}</td><td>${b.title||''}</td>
            <td>${b.number_of_people||0}</td><td>${b.status}</td>
            <td>${Number(b.total_amount||0).toLocaleString('vi-VN')}đ</td>
            <td>${fmtDate(b.created_at)}</td>
          </tr>`).join('');
      }
    }catch(e){ $('#recentBookings').innerHTML=`<tr><td colspan="7" class="muted">Lỗi: ${e.message}</td></tr>`; }
    // tours
    try{
      const items=await listFrom('/tours',{params:{page_size:6,sort:'created_at_desc'}});
      const wrap=$('#recentTours');
      if(!items.length){ wrap.innerHTML=`<div class="muted">Chưa có tour</div>`; }
      else{
        wrap.innerHTML=items.map(t=>`
          <div class="t-card">
            <img class="t-cover" src="${t.primary_photo || 'https://picsum.photos/seed/'+t.id+'/176/120'}" alt="">
            <div><div class="t-title">${t.title}</div><div class="t-meta">${t.location||''} · ${Number(t.price).toLocaleString('vi-VN')}đ</div></div>
          </div>`).join('');
      }
    }catch(e){ $('#recentTours').innerHTML=`<div class="muted">Lỗi: ${e.message}</div>`; }
  }

  function boot(){
    updateNavAuth(); setBaseUrlHint(); guardAdmin(); fillUserChip();
    $('#btnRefresh')?.addEventListener('click', ()=>{ loadStats(); loadRecent(); });
    loadStats(); loadRecent();
  }
  document.addEventListener('DOMContentLoaded', boot);
})();
