/***** Utilities *****/
const $p = (id)=>document.getElementById(id);
function apiBase(){ return (window.CONFIG && window.CONFIG.getApiBase()) || "http://127.0.0.1:8000"; }
function pToken(){ return (window.CONFIG && window.CONFIG.getToken && window.CONFIG.getToken()) || ""; }
function authHdr(){ const t=pToken(); return t?{Authorization:`Bearer ${t}`}:{ }; }
function yn(v){ return !!v && String(v)!=='0' && String(v).toLowerCase()!=='false'; }

/***** DOM *****/
let elRows, elTourId, elBtnFilter, btnNew, dlgWrap, dlgTitle, dlgClose, dlgSave, fTour, fUrl, fCap, fPrimary;
let mode='create', editId=null;

/***** API *****/
async function fetchPhotos(tourId){
  const u = new URL(apiBase().replace(/\/$/,'') + '/photos');
  if (tourId) u.searchParams.set('tour_id', tourId);
  const res = await fetch(u, { headers:{Accept:'application/json'} });
  if(!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}
async function createPhoto(b){
  const res = await fetch(apiBase().replace(/\/$/,'') + `/tours/${encodeURIComponent(b.tour_id)}/photos`, {
    method:'POST', headers:{'Content-Type':'application/json', ...authHdr()}, body: JSON.stringify(b)
  });
  if(!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}
async function updatePhoto(id, b){
  const res = await fetch(apiBase().replace(/\/$/,'') + `/photos/${encodeURIComponent(id)}`, {
    method:'PUT', headers:{'Content-Type':'application/json', ...authHdr()}, body: JSON.stringify(b)
  });
  if(!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}
async function deletePhoto(id){
  const res = await fetch(apiBase().replace(/\/$/,'') + `/photos/${encodeURIComponent(id)}`, {
    method:'DELETE', headers:{Accept:'application/json', ...authHdr()}
  });
  if(!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

/***** Render *****/
function normList(j){ return Array.isArray(j)?j:(j?.items||j?.data||[]); }
function mapPhoto(p){
  return {
    id: p.id || p.photo_id || p.Id,
    tourId: p.tour_id || p.TourID,
    url: p.image_url || p.ImageURL || p.url,
    cap: p.caption || "",
    primary: p.is_primary || 0,
  };
}
function badgeYesNo(v){ return yn(v) ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'; }
function render(list){
  const arr = normList(list).map(mapPhoto);
  if (!arr.length){
    elRows.innerHTML = `<tr><td colspan="6" class="muted">Không có ảnh.</td></tr>`;
    return;
  }
  elRows.innerHTML = arr.map(p=>`
    <tr data-id="${p.id}">
      <td>#${p.id}</td>
      <td>${p.tourId ?? '—'}</td>
      <td>${p.url ? `<img src="${p.url}" alt="" class="thumb" style="max-width:140px;max-height:90px;border-radius:8px" onerror="this.replaceWith(document.createTextNode('⛔'))">` : '—'}</td>
      <td>${p.cap || '—'}</td>
      <td>${badgeYesNo(p.primary)}</td>
      <td>
        <button class="btn light small" data-act="edit">Sửa</button>
        <button class="btn danger small" data-act="del">Xoá</button>
      </td>
    </tr>
  `).join('');
}

/***** Load *****/
async function load(){
  try{
    elRows.innerHTML = `<tr><td colspan="6" class="muted">Đang tải…</td></tr>`;
    const list = await fetchPhotos((elTourId?.value||'').trim());
    render(list);
  }catch(e){
    console.error(e);
    elRows.innerHTML = `<tr><td colspan="6" class="error">Lỗi tải: ${e.message||e}</td></tr>`;
  }
}

/***** Modal *****/
function openDlg(m, data){
  mode = m;
  editId = data?.id || null;
  dlgTitle.textContent = m==='create' ? 'Thêm ảnh' : `Sửa ảnh #${editId}`;
  fTour.value = data?.tourId || '';
  fUrl.value  = data?.url || '';
  fCap.value  = data?.cap || '';
  fPrimary.value = yn(data?.primary) ? '1':'0';
  dlgWrap.style.display = 'grid';
}
function closeDlg(){ dlgWrap.style.display='none'; }

/***** Events *****/
function wire(){
  elBtnFilter?.addEventListener('click', load);
  btnNew?.addEventListener('click', ()=>openDlg('create'));
  dlgClose?.addEventListener('click', closeDlg);
  dlgSave?.addEventListener('click', async ()=>{
    try{
      const body = {
        tour_id: (fTour.value||'').trim(),
        image_url: (fUrl.value||'').trim(),
        caption: (fCap.value||'').trim() || null,
        is_primary: Number(fPrimary.value||0)
      };
      if (!body.tour_id || !body.image_url){ alert('Thiếu tour_id / image_url'); return; }
      dlgSave.disabled = true;
      if (mode==='create') await createPhoto(body);
      else await updatePhoto(editId, body);
      closeDlg(); load();
    }catch(e){ alert('Lưu thất bại: ' + (e.message||e)); }
    finally{ dlgSave.disabled = false; }
  });

  elRows.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const tr = btn.closest('tr');
    const id = tr.dataset.id;
    if (btn.dataset.act==='edit'){
      openDlg('edit', {
        id,
        tourId: tr.children[1]?.textContent?.trim() || '',
        url: tr.querySelector('img')?.getAttribute('src') || '',
        cap: tr.children[3]?.textContent?.trim() || '',
        primary: /Yes/i.test(tr.children[4]?.textContent||'0') ? 1 : 0
      });
    }else{
      if (confirm(`Xoá ảnh #${id}?`)) deletePhoto(id).then(load).catch(e=>alert('Xoá thất bại: '+(e.message||e)));
    }
  });

  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDlg(); });
}

/***** Init *****/
function init(){
  elRows = $p('rows');
  elTourId = $p('tourId');
  elBtnFilter = $p('btnFilter');
  btnNew = $p('btnNew');

  dlgWrap = $p('dlgWrap'); dlgTitle=$p('dlgTitle'); dlgClose=$p('dlgClose'); dlgSave=$p('dlgSave');
  fTour=$p('fTour'); fUrl=$p('fUrl'); fCap=$p('fCap'); fPrimary=$p('fPrimary');

  wire(); load();
}
document.readyState==='loading' ? document.addEventListener('DOMContentLoaded', init) : init();
