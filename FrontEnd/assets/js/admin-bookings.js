(function(){
  let page=1,size=10,q='',status='',date_from='',date_to='';
  const $=(q,p=document)=>p.querySelector(q);
  const rows=$('#rows'), meta=$('#meta');

  async function load(){
    size=Number($('#pageSize').value||10);
    const qs=new URLSearchParams({page,page_size:size,q,status,date_from,date_to});
    const r=await api(`/bookings?${qs}`,{auth:true});
    const items=r?.data?.items||[], m=r?.data?.meta;
    if(!items.length){ rows.innerHTML=`<tr><td colspan="8" class="muted">Không có dữ liệu</td></tr>`; }
    else{
      rows.innerHTML=items.map(b=>`
        <tr>
          <td>#${b.id}</td><td>${b.username||''}</td><td>${b.title||''}</td>
          <td>${b.number_of_people||0}</td>
          <td><span class="badge ${b.status.toLowerCase()}">${b.status}</span></td>
          <td>${Number(b.total_amount||0).toLocaleString('vi-VN')}đ</td>
          <td>${(b.created_at||'').replace('T',' ').slice(0,16)}</td>
          <td>
            <select data-status="${b.id}" class="input small">
              <option ${b.status==='Pending'?'selected':''}>Pending</option>
              <option ${b.status==='Confirmed'?'selected':''}>Confirmed</option>
              <option ${b.status==='Cancelled'?'selected':''}>Cancelled</option>
            </select>
          </td>
        </tr>`).join('');
    }
    meta.textContent=`Trang ${m.page}/${m.total_pages} • ${m.total} đơn`;
    $('#prev').disabled=!m.has_prev; $('#next').disabled=!m.has_next;
  }

  document.addEventListener('change',e=>{
    const id=e.target.getAttribute?.('data-status');
    if(id){
      const status=e.target.value;
      api(`/bookings/${id}`,{method:'PATCH',auth:true,body:{status}})
        .then(()=>console.info('updated')).catch(err=>alert(err.message));
    }
  });

  $('#btnFilter').onclick=()=>{ q=$('#q').value.trim(); status=$('#status').value; date_from=$('#dateFrom').value; date_to=$('#dateTo').value; page=1; load(); };
  $('#prev').onclick=()=>{ page--; load(); }; $('#next').onclick=()=>{ page++; load(); };

  document.addEventListener('DOMContentLoaded', ()=>{ updateNavAuth(); setBaseUrlHint(); guardAdmin(); load(); });
})();
