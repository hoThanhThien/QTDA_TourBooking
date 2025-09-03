(function(){
const $=(q,p=document)=>p.querySelector(q);
const rows=$('#rows'), rolesT=$('#roles');
let q='', role='';

async function loadUsers(){
    const qs=new URLSearchParams({page:1,page_size:100,q,role});
    const r=await api(`/users?${qs}`,{auth:true});
    const items=r?.data?.items||[];
    if(!items.length){ rows.innerHTML=`<tr><td colspan="6" class="muted">Không có user</td></tr>`; return; }
    rows.innerHTML=items.map(u=>`
    <tr>
        <td>${u.id}</td><td>${u.username||''}</td><td>${u.email||''}</td>
        <td>${u.phone||''}</td><td>${u.role||u.role_name||''}</td>
        <td>${(u.created_at||'').replace('T',' ').slice(0,16)}</td>
    </tr>`).join('');
}

async function loadRoles(){
    try{
    const r=await api('/roles',{auth:true});
    rolesT.innerHTML=(r?.data||[]).map(x=>`<tr><td>${x.id}</td><td>${x.name}</td></tr>`).join('');
    }catch{ rolesT.innerHTML=`<tr><td colspan="2" class="muted">Không tải được roles</td></tr>`; }
}

$('#btnFilter').onclick=()=>{ q=$('#q').value.trim(); role=$('#role').value; loadUsers(); };

document.addEventListener('DOMContentLoaded', ()=>{ updateNavAuth(); setBaseUrlHint(); guardAdmin(); loadUsers(); loadRoles(); });
})();
