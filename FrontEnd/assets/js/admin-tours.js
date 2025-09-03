(function(){
  let page=1,size=10,q='',status='',sort='',catId='',editId=null;
  const $=(q,p=document)=>p.querySelector(q);
  const rows=$('#rows'), meta=$('#meta');

  async function loadCats(sel){
    const r=await api('/categories?page=1&page_size=100');
    sel.innerHTML=['<option value="">--Danh mục--</option>']
      .concat((r?.data?.items||[]).map(c=>`<option value="${c.id}">${c.name}</option>`)).join('');
  }

  function openDlg(title,data){
    $('#dlgTitle').textContent=title;
    $('#fTitle').value=data?.title||'';
    $('#fLocation').value=data?.location||'';
    $('#fPrice').value=data?.price||'';
    $('#fCapacity').value=data?.capacity||'';
    $('#fStart').value=(data?.start_date||'').slice(0,10);
    $('#fEnd').value=(data?.end_date||'').slice(0,10);
    $('#fDesc').value=data?.description||'';
    $('#fStatus').value=data?.status||'Available';
    $('#fCat').value=data?.category_id||'';
    $('#dlgWrap').classList.add('show');
  }
  function closeDlg(){ $('#dlgWrap').classList.remove('show'); editId=null; }

  async function load(){
    size=Number($('#pageSize').value||10);
    const qs=new URLSearchParams({page,page_size:size,q,status,sort,category_id:catId});
    const r=await api(`/tours?${qs}`);
    const items=r?.data?.items||[], m=r?.data?.meta;
    if(!items.length){ rows.innerHTML=`<tr><td colspan="7" class="muted">Không có dữ liệu</td></tr>`; }
    else{
      rows.innerHTML=items.map(t=>`
        <tr>
          <td>${t.id}</td><td>${t.title}</td><td>${t.category_name||''}</td>
          <td>${Number(t.price).toLocaleString('vi-VN')}đ</td><td>${t.status}</td>
          <td>${(t.start_date||'').slice(0,10)} → ${(t.end_date||'').slice(0,10)}</td>
          <td>
            <button class="btn small light" data-edit="${t.id}">Sửa</button>
            <a class="btn small light" href="./photos.html?tour_id=${t.id}">Ảnh</a>
            <button class="btn small danger" data-del="${t.id}">Xoá</button>
          </td>
        </tr>`).join('');
    }
    meta.textContent=`Trang ${m.page}/${m.total_pages} • ${m.total} items`;
    $('#prev').disabled=!m.has_prev; $('#next').disabled=!m.has_next;
  }

  async function save(){
    const body={
      title:$('#fTitle').value.trim(),
      location:$('#fLocation').value.trim(),
      price:Number($('#fPrice').value||0),
      capacity:Number($('#fCapacity').value||1),
      start_date:$('#fStart').value, end_date:$('#fEnd').value,
      category_id:Number($('#fCat').value||0)||null,
      description:$('#fDesc').value.trim(),
      status:$('#fStatus').value
    };
    if(!body.title) return alert('Nhập tiêu đề!');
    if(editId) await api(`/tours/${editId}`,{method:'PUT',auth:true,body});
    else await api(`/tours`,{method:'POST',auth:true,body});
    closeDlg(); load();
  }

  // events
  $('#btnNew').onclick=()=> openDlg('Thêm tour');
  $('#dlgClose').onclick=closeDlg; $('#dlgSave').onclick=save;
  $('#btnFilter').onclick=()=>{ q=$('#q').value.trim(); status=$('#status').value; sort=$('#sort').value; catId=$('#cat').value; page=1; load(); };
  $('#prev').onclick=()=>{ page--; load(); }; $('#next').onclick=()=>{ page++; load(); };
  document.addEventListener('click',(e)=>{
    const idE=e.target.getAttribute?.('data-edit'), idD=e.target.getAttribute?.('data-del');
    if(idE){
      editId=Number(idE);
      // minimal prefill; nếu cần chi tiết -> gọi GET /tours/{id}
      const tr=e.target.closest('tr');
      openDlg('Sửa tour',{ title:tr.children[1].textContent, price:tr.children[3].textContent.replace(/[^\d]/g,''), status:tr.children[4].textContent });
    }
    if(idD && confirm('Xoá tour này?')) api(`/tours/${idD}`,{method:'DELETE',auth:true}).then(load);
  });

  document.addEventListener('DOMContentLoaded', async ()=>{
    updateNavAuth(); setBaseUrlHint(); guardAdmin();
    await loadCats($('#cat')); await loadCats($('#fCat')); load();
  });
})();
