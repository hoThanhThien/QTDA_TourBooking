function qs(sel, parent=document){ return parent.querySelector(sel); }
function qsa(sel, parent=document){ return [...parent.querySelectorAll(sel)]; }
function getQuery(name){ const u = new URL(window.location.href); return u.searchParams.get(name); }
function setBaseUrlHint(){ const el = document.getElementById("baseUrlHint"); if(el) el.textContent = CONFIG.BASE_URL; }
function renderPager(meta, container, onChange){
  container.innerHTML = "";
  const { page, page_size, total_pages, has_prev, has_next } = meta || {page:1,page_size:10,total_pages:1,has_prev:false,has_next:false};
  const info = document.createElement("div"); info.textContent = `Trang ${page}/${total_pages} (size ${page_size})`;
  const wrap = document.createElement("div"); wrap.className = "pager";
  const prev = document.createElement("button"); prev.className = "btn secondary small"; prev.textContent = "← Prev"; prev.disabled = !has_prev; prev.onclick = ()=> onChange(page-1);
  const next = document.createElement("button"); next.className = "btn secondary small"; next.textContent = "Next →"; next.disabled = !has_next; next.onclick = ()=> onChange(page+1);
  wrap.appendChild(prev); wrap.appendChild(next); container.appendChild(info); container.appendChild(wrap);
}