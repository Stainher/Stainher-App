(function(){
  'use strict';
  const w=window;
  function escAttr(v){return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
  async function addEditField(uid){
    const form=document.getElementById('editUserFormV1517');
    if(!form||form.querySelector('[name="saldo_vacaciones"]')||!w.sb)return;
    const q=await w.sb.from('perfiles').select('saldo_vacaciones').eq('id',uid).maybeSingle();
    if(q.error){w.toast?.('No se pudo cargar el saldo de vacaciones: '+q.error.message,'error');return}
    const label=document.createElement('label');
    label.innerHTML=`Saldo de vacaciones (días)<input class="field" name="saldo_vacaciones" type="number" min="0" step="0.5" value="${escAttr(Number(q.data?.saldo_vacaciones??15))}"><small class="muted">Valor editable manualmente. Saldo inicial: 15 días.</small>`;
    const permissions=form.querySelector('.v11-permissions,.permission-grid,[data-permission-editor]');
    form.insertBefore(label,permissions||form.querySelector('.full')||form.firstChild);
    const input=label.querySelector('input');
    let saved=String(input.value);
    input.addEventListener('change',async()=>{
      const value=Number(input.value);
      if(!Number.isFinite(value)||value<0){input.value=saved;return w.toast?.('Ingresa un saldo válido igual o superior a 0.','error')}
      input.disabled=true;
      const up=await w.sb.from('perfiles').update({saldo_vacaciones:value}).eq('id',uid);
      input.disabled=false;
      if(up.error){input.value=saved;return w.toast?.('No se pudo actualizar el saldo: '+up.error.message,'error')}
      saved=String(value);w.toast?.('Saldo de vacaciones actualizado','success');
    });
  }
  function addCreateDefault(){
    const form=document.getElementById('userFormV1517');
    if(!form||form.querySelector('[data-vacation-default]'))return;
    const note=document.createElement('div');note.className='full notice';note.dataset.vacationDefault='1';note.innerHTML='<b>Saldo inicial de vacaciones:</b> el usuario será creado con 15 días, editables posteriormente en su ficha.';
    form.insertBefore(note,form.querySelector('.full:last-child'));
  }
  function install(){
    if(typeof w.openEditUserModal==='function'&&!w.openEditUserModal.__vacBalance){
      const base=w.openEditUserModal;
      const wrapped=async function(uid,...args){const out=await base.call(this,uid,...args);await addEditField(uid);return out};
      wrapped.__vacBalance=true;w.openEditUserModal=wrapped;
    }
    if(typeof w.openUserModal==='function'&&!w.openUserModal.__vacBalance){
      const base=w.openUserModal;
      const wrapped=async function(...args){const out=await base.apply(this,args);addCreateDefault();return out};
      wrapped.__vacBalance=true;w.openUserModal=wrapped;
    }
  }
  let tries=0;(function boot(){install();if((typeof w.openEditUserModal!=='function'||typeof w.openUserModal!=='function')&&++tries<300)setTimeout(boot,100)})();
})();
