/***** Utilities *****/
const $ = (id)=>document.getElementById(id);
function getApiBase(){ return (window.CONFIG && window.CONFIG.getApiBase()) || window.API_BASE || "http://127.0.0.1:8000"; }
function getToken(){ return (window.CONFIG && window.CONFIG.getToken && window.CONFIG.getToken()) || ""; }
function authHeader(){ const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }
function handleAuthFail(res){
  if (res.status === 401) alert('Bạn chưa đăng nhập (401). Hãy đăng nhập admin để tạo/sửa/xoá.');
}

/***** State *****/
let elRows, elBtnNew, elBtnFilter, elQuery, elPageSize, elMeta, btnPrev, btnNext;
let dlgWrap, dlgTitle, dlgClose, dlgSave, fName, fDesc;
const state = { page:1, pageSize:10, q:"", mode:"create", editId:null };

/***** API *****/
function catUrl(){
  const u = new URL(getApiBase().replace(/\/$/,'') + '/categories');
  u.searchParams.set('page', state.page);
  u.searchParams.set('page_size', state.pageSize);
  if (state.q) u.searchParams.set('q', state.q);
  return u.toString();
}
async function apiGet(){
  const res = await fetch(catUrl(), { headers:{Accept:'application/json'} });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}
async function apiPost(body){
  const res = await fetch(getApiBase().replace(/\/$/,'') + '/categories', {
    method:'POST', headers:{'Content-Type':'application/json', ...authHeader()}, body: JSON.stringify(body)
  });
  if (!res.ok) { handleAuthFail(res); throw new Error(`HTTP ${res.status}: ${await res.text()}`); }
  return res.json();
}
async function apiPut(id, body){
  const res = await fetch(getApiBase().replace(/\/$/,'') + '/categories/' + encodeURIComponent(id), {
    method:'PUT', headers:{'Content-Type':'application/json', ...authHeader()}, body: JSON.stringify(body)
  });
  if (!res.ok) { handleAuthFail(res); throw new Error(`HTTP ${res.status}: ${await res.text()}`); }
  return res.json();
}
async function apiDel(id){
  const res = await fetch(getApiBase().replace(/\/$/,'') + '/categories/' + encodeURIComponent(id), {
    method:'DELETE', headers:{Accept:'application/json', ...authHeader()}
  });
  if (!res.ok) { handleAuthFail(res); throw new Error(`HTTP ${res.status}: ${await res.text()}`); }
  return res.json();
}

/***** Render *****/
function normList(json){ return Array.isArray(json) ? json : (json?.items || json?.data || []); }
function normMeta(json){ const m=json?.meta||{}; return { page:m.page||1, pages:m.pages||1, total:m.total||0, page_size:m.page_size||state.pageSize }; }

function render(data){
  const rows = normList(data);
  const meta = normMeta(data);

  if (!rows.length){
    elRows.innerHTML = `<tr><td colspan="4" class="muted">Không có dữ liệu.</td></tr>`;
  }else{
    elRows.innerHTML = rows.map(c=>`
      <tr data-id="${c.id}">
        <td>${c.id}</td>
        <td>${c.name || ""}</td>
        <td>${c.description || ""}</td>
        <td>
          <button type="button" class="btn light small" data-act="edit" data-id="${c.id}">Sửa</button>
          <button type="button" class="btn danger small" data-act="del"  data-id="${c.id}">Xoá</button>
        </td>
      </tr>
    `).join('');
  }

  if (elMeta) elMeta.textContent = `Trang ${meta.page}/${meta.pages} · ${meta.total} items`;
  if (btnPrev) btnPrev.disabled = meta.page <= 1;
  if (btnNext) btnNext.disabled = meta.page >= meta.pages;
}

/***** Load *****/
async function load(){
  try{
    elRows.innerHTML = `<tr><td colspan="4" class="muted">Đang tải…</td></tr>`;
    render(await apiGet());
  }catch(e){
    console.error(e);
    elRows.innerHTML = `<tr><td colspan="4" class="error">Lỗi tải: ${e.message||e}</td></tr>`;
  }
}

/***** Modal *****/
function openModal(mode, data){
  state.mode = mode;
  state.editId = data?.id || null;
  dlgTitle.textContent = mode==='create' ? 'Thêm Category' : `Sửa Category #${state.editId}`;
  fName.value = data?.name || '';
  fDesc.value = data?.description || '';
  dlgWrap.style.display = 'grid';
}
function closeModal(){ dlgWrap.style.display = 'none'; }

/***** Events *****/
function wireEvents(){
  // table actions
  elRows.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const { act, id } = btn.dataset;
    const tr = btn.closest('tr');
    if (act === 'edit'){
      openModal('edit', {
        id,
        name: tr.children[1]?.textContent?.trim() || '',
        description: tr.children[2]?.textContent?.trim() || ''
      });
    } else if (act === 'del'){
      if (confirm(`Xoá category #${id}?`)) apiDel(id).then(load).catch(err=>alert('Xoá thất bại: '+(err.message||err)));
    }
  });

  elBtnNew?.addEventListener('click', ()=>openModal('create'));
  elBtnFilter?.addEventListener('click', ()=>{
    state.q = (elQuery?.value || '').trim();
    state.page = 1;
    state.pageSize = Number(elPageSize?.value || state.pageSize);
    load();
  });
  btnPrev?.addEventListener('click', ()=>{ state.page = Math.max(1, state.page-1); load(); });
  btnNext?.addEventListener('click', ()=>{ state.page = state.page+1; load(); });

  dlgClose?.addEventListener('click', closeModal);
  dlgSave?.addEventListener('click', async ()=>{
    try{
      const name = fName.value.trim();
      const desc = fDesc.value.trim();
      if (!name){ fName.focus(); return; }
      dlgSave.disabled = true;
      if (state.mode === 'create') await apiPost({ name, description: desc||null });
      else await apiPut(state.editId, { name, description: desc||null });
      closeModal(); load();
    }catch(e){ alert('Lưu thất bại: '+(e.message||e)); }
    finally{ dlgSave.disabled = false; }
  });

  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
}

/***** Init *****/
function init(){
  elRows      = $('rows');
  elBtnNew    = $('btnNew');
  elBtnFilter = $('btnFilter');
  elQuery     = $('q');
  elPageSize  = $('pageSize');
  elMeta      = $('meta');
  btnPrev     = $('prev');
  btnNext     = $('next');

  dlgWrap  = $('dlgWrap');
  dlgTitle = $('dlgTitle');
  dlgClose = $('dlgClose');
  dlgSave  = $('dlgSave');
  fName    = $('fName');
  fDesc    = $('fDesc');

  if (elPageSize) state.pageSize = Number(elPageSize.value || state.pageSize);
  wireEvents();
  load();
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
