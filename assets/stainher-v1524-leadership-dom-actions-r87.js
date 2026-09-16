/* Stainher V15.24 · R87 · acciones Liderazgo sobre DOM real.
 * Corrige R86: no depende de IDs internos de las vistas de Liderazgo.
 * Inserta PDF en Controles realizados y Eliminar en Programación usando
 * la estructura visible bajo #page-liderazgo. Sin MutationObserver global.
 */
(()=>{
  'use strict';
  const BUILD='20260916-r87-leadership-dom-actions';
  if(window.__STAINHER_LEADERSHIP_DOM_ACTIONS_R87__===BUILD)return;
  window.__STAINHER_LEADERSHIP_DOM_ACTIONS_R87__=BUILD;
  const WRAP=Symbol('stainherLeadershipDomActionsR87');

  const canManage=()=>{try{return !!window.canManageLeadershipV11?.()}catch(_){return false}};
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  const page=()=>document.getElementById('page-liderazgo');

  function panels(){
    const root=page();if(!root)return [];
    return [...root.querySelectorAll('.panel')];
  }
  function panelByTitle(rx){
    return panels().find(p=>{
      const h=p.querySelector('h2,h3,h4,summary');
      return h&&rx.test(norm(h.textContent));
    })||null;
  }
  function tableByHeaders(required=[]){
    const root=page();if(!root)return null;
    return [...root.querySelectorAll('table')].find(t=>{
      const headers=[...t.querySelectorAll('thead th')].map(x=>norm(x.textContent));
      return required.every(r=>headers.some(h=>h.includes(r)));
    })||null;
  }
  function ensureActionCell(table,tr){
    const head=table.querySelector('thead tr');
    let idx=[...head?.children||[]].findIndex(x=>norm(x.textContent)==='acciones');
    if(idx<0&&head){const th=document.createElement('th');th.textContent='Acciones';head.appendChild(th);idx=head.children.length-1;}
    let td=idx>=0?tr.children[idx]:null;
    if(!td){td=document.createElement('td');tr.appendChild(td);}
    let box=td.querySelector('.v1523-lead-record-actions');
    if(!box){box=document.createElement('div');box.className='v1523-lead-record-actions';td.appendChild(box);}
    return box;
  }

  async function data(){
    if(typeof window.v1512LoadLeadershipData!=='function')return null;
    try{const out=await window.v1512LoadLeadershipData();return out?.error?null:out}catch(_){return null}
  }

  async function enhanceDone(){
    const root=page();if(!root)return false;
    const panel=panelByTitle(/controles realizados/);
    const table=panel?.querySelector('table')||tableByHeaders(['fecha','usuario','control','tipo','acciones']);
    if(!table)return false;
    const d=await data();if(!d)return false;
    const rows=d.done||[];
    const trs=[...table.querySelectorAll('tbody tr')];
    trs.forEach((tr,index)=>{
      const row=rows[index];if(!row?.id)return;
      const box=ensureActionCell(table,tr);
      if(box.querySelector('[data-r87-pdf]'))return;
      const b=document.createElement('button');
      b.type='button';b.className='action-mini';b.dataset.r87Pdf='1';b.textContent='PDF';
      b.title='Descargar PDF del control realizado';
      b.onclick=()=>window.v1524DownloadLeadershipRecordPdf?.(row.id);
      box.prepend(b);
    });
    return true;
  }

  async function enhanceProgramming(){
    const root=page();if(!root||!canManage())return false;
    let table=panelByTitle(/programaci/ )?.querySelector('table')||null;
    if(!table){
      const candidates=[...root.querySelectorAll('table')].filter(t=>{
        const h=[...t.querySelectorAll('thead th')].map(x=>norm(x.textContent)).join(' | ');
        return h.includes('usuario')&&h.includes('control')&&!h.includes('cumplimiento');
      });
      table=candidates.find(t=>!panelByTitle(/controles realizados/)?.contains(t))||null;
    }
    if(!table)return false;
    const d=await data();if(!d)return false;
    const goals=d.goals||[];
    const trs=[...table.querySelectorAll('tbody tr')];
    trs.forEach((tr,index)=>{
      const goal=goals[index];if(!goal?.id)return;
      const box=ensureActionCell(table,tr);
      if(box.querySelector('[data-r87-delete-goal]'))return;
      const b=document.createElement('button');
      b.type='button';b.className='action-mini';b.dataset.r87DeleteGoal='1';b.textContent='Eliminar';
      b.title='Eliminar programación';b.style.color='#fca5a5';b.style.borderColor='#7f1d1d';
      b.onclick=()=>window.v1524DeleteLeadershipGoal?.(goal.id);
      box.appendChild(b);
    });
    return true;
  }

  async function enhanceAll(){
    await enhanceDone();
    await enhanceProgramming();
  }

  function wrapRender(){
    const current=window.renderLiderazgoV95;
    if(typeof current!=='function'||current[WRAP])return;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      queueMicrotask(()=>enhanceAll().catch(()=>{}));
      setTimeout(()=>enhanceAll().catch(()=>{}),120);
      return out;
    };
    wrapped[WRAP]=true;wrapped.__base=current;window.renderLiderazgoV95=wrapped;
  }

  function installLocalTabHook(){
    const root=page();if(!root||root.dataset.r87LeadershipHook==='1')return;
    root.dataset.r87LeadershipHook='1';
    root.addEventListener('click',event=>{
      const btn=event.target?.closest?.('button,[role="tab"]');if(!btn)return;
      const text=norm(btn.textContent);
      if(text==='indicadores'||text==='programacion'||text==='controles stainher'){
        setTimeout(()=>enhanceAll().catch(()=>{}),0);
        setTimeout(()=>enhanceAll().catch(()=>{}),160);
      }
    });
  }

  function install(){
    wrapRender();installLocalTabHook();
    enhanceAll().catch(()=>{});
  }

  window.StainherLeadershipR87=Object.freeze({install,enhanceDone,enhanceProgramming,enhanceAll});
  install();
  window.addEventListener('stainher:modules-ready',()=>{install();setTimeout(install,120);setTimeout(install,900)},{once:true});
  [300,900,1800,3200].forEach(ms=>setTimeout(install,ms));
})();
