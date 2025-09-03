(function(){
  let tourFilter=new URLSearchParams(location.search).get('tour_id')||'', editId=null;
  const $=(q,p=document)=>p.querySelector(q);
  const rows=$('#rows');

  async function load(){
    const qs=new URLSearchParams({page:1,page_size:100,tour_id:tourFilter||''});
    const r=await api(`/photos?${qs}`);
    const items=r?.data?.items||[];
    if(!items.length){ rows.innerHTML=`<tr><td colspan="6" class="muted">Không có ảnh</td></tr>`; return; }
    rows.innerHTML=items.map(p=>`
      <tr>
        <td>${p.id}</td><td>${p.tour_id}</td>
        <td><img style="width:100px;height:64px;object-fit:cover;border-radius:8px" src="${p.image_url}" alt=""></td>
        <td>${p.caption||''}</td><td>${p.is_primary?'Yes':'No'}</td>
        <td>
          <button class="btn small light" data-edit="${p.id}">Sửa</button>
          <button class="btn small danger" data-del="${p.id}">Xoá</button>
        </td>
      </tr>`).join('');
  }

  function openDlg(title,data){
    $('#dlgTitle').textContent=title;
    $('#fTour').value=data?.tour_id || tourFilter || '';
    $('#fUrl').value=data?.image_url||'';
    $('#fCap').value=data?.caption||'';
    $('#fPrimary').value=data?.is_primary?'1':'0';
    $('#dlgWrap').classList.add('show');
  }
  function closeDlg(){ $('#dlgWrap').classList.remove('show'); editId=null; }

  async function save(){
    const body={
      tour_id:Number($('#fTour').value||0),
      image_url:$('#fUrl').value.trim(),
      caption:$('#fCap').value.trim(),
      is_primary:$('#fPrimary').value==='1'?1:0
    };
    if(!body.tour_id || !body.image_url) return alert('Nhập Tour ID & URL ảnh!');
    if(editId) await api(`/photos/${editId}`,{method:'PUT',auth:true,body});
    else await api(`/photos`,{method:'POST',auth:true,body});
    closeDlg(); load();
  }

  // events
  $('#btnNew').onclick=()=>openDlg('Thêm ảnh');
  $('#dlgClose').onclick=closeDlg; $('#dlgSave').onclick=save;
  $('#btnFilter').onclick=()=>{ tourFilter=$('#tourId').value.trim(); load(); };
  document.addEventListener('click',(e)=>{
    const idE=e.target.getAttribute?.('data-edit'), idD=e.target.getAttribute?.('data-del');
    if(idE){
      const tr=e.target.closest('tr'); editId=Number(idE);
      openDlg('Sửa ảnh',{
        tour_id:tr.children[1].textContent,
        image_url:tr.children[2].querySelector('img').src,
        caption:tr.children[3].textContent,
        is_primary:tr.children[4].textContent.trim()==='Yes'
      });
    }
    if(idD && confirm('Xoá ảnh này?')) api(`/photos/${idD}`,{method:'DELETE',auth:true}).then(load);
  });

  document.addEventListener('DOMContentLoaded', ()=>{ updateNavAuth(); setBaseUrlHint(); guardAdmin(); $('#tourId').value=tourFilter; load(); });
})();
