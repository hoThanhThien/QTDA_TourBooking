(function(){
  let page=1,size=10,q='',editId=null;
  const $=(q,p=document)=>p.querySelector(q);
  const rows=$('#rows'), metaEl=$('#meta');

  function openDlg(title,data){
    $('#dlgTitle').textContent=title;
    $('#fName').value=data?.name||'';
    $('#fDesc').value=data?.description||'';
    $('#dlgWrap').classList.add('show');
  }
  function closeDlg(){ $('#dlgWrap').classList.remove('show'); editId=null; }

  async function load(){
    size=Number($('#pageSize').value||10);
    const qs=new URLSearchParams({page,page_size:size,q});
    const r=await api(`/categories?${qs}`);
    const items=r?.data?.items||[], m=r?.data?.meta;
    if(!items.length){ rows.innerHTML=`<tr><td colspan="4" class="muted">Không có dữ liệu</td></tr>`; }
    else{
      rows.innerHTML=items.map(c=>`
        <tr>
          <td>${c.id}</td><td>${c.name}</td><td>${c.description||''}</td>
          <td>
            <button class="btn small light" data-edit="${c.id}">Sửa</button>
            <button class="btn small danger" data-del="${c.id}">Xoá</button>
          </td>
        </tr>`).join('');
    }
    metaEl.textContent=`Trang ${m.page}/${m.total_pages} • ${m.total} items`;
    $('#prev').disabled=!m.has_prev; $('#next').disabled=!m.has_next;
  }

  async function save(){
    const body={ name:$('#fName').value.trim(), description:$('#fDesc').value.trim() };
    if(!body.name) return alert('Nhập tên!');
    if(editId) await api(`/categories/${editId}`,{method:'PUT',auth:true,body});
    else await api(`/categories`,{method:'POST',auth:true,body});
    closeDlg(); load();
  }

  // events
  document.addEventListener('click',e=>{
    const idE=e.target.getAttribute?.('data-edit'), idD=e.target.getAttribute?.('data-del');
    if(idE){
      const tr=e.target.closest('tr'); editId=Number(idE);
      openDlg('Sửa category',{ name:tr.children[1].textContent, description:tr.children[2].textContent });
    }
    if(idD && confirm('Xoá category này?')) api(`/categories/${idD}`,{method:'DELETE',auth:true}).then(load);
  });
  $('#btnNew').onclick = ()=> openDlg('Thêm category');
  $('#dlgClose').onclick = closeDlg; $('#dlgSave').onclick = save;
  $('#btnFilter').onclick= ()=>{ q=$('#q').value.trim(); page=1; load(); };
  $('#prev').onclick = ()=>{ page--; load(); }; $('#next').onclick=()=>{ page++; load(); };

  document.addEventListener('DOMContentLoaded', ()=>{ updateNavAuth(); setBaseUrlHint(); guardAdmin(); load(); });
})();
