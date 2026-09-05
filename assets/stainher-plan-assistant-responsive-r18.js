/* Stainher App V15.24 r18 · ajuste responsive del Asistente de Plan Matriz. */
(()=>{
  'use strict';
  if(window.__STAINHER_PLAN_ASSISTANT_RESPONSIVE_R18__)return;
  window.__STAINHER_PLAN_ASSISTANT_RESPONSIVE_R18__=true;

  const id='stainher-plan-assistant-responsive-r18-style';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    .stainher-plan-assistant{
      container-type:inline-size;
      min-width:0!important;
      max-width:100%!important;
      box-sizing:border-box!important;
      overflow:hidden!important;
    }
    .stainher-plan-assistant-head,
    .stainher-plan-assistant-head > *,
    .stainher-plan-assistant-list,
    .stainher-plan-assistant-row{
      min-width:0!important;
      max-width:100%!important;
      box-sizing:border-box!important;
    }
    .stainher-plan-assistant-head > div{flex:1 1 auto;min-width:0!important}
    .stainher-plan-assistant-head [data-generate]{
      flex:0 0 auto;
      max-width:180px;
      white-space:normal;
      line-height:1.15;
    }
    .stainher-plan-assistant-row{
      width:100%!important;
      grid-template-columns:minmax(0,.9fr) minmax(0,1.5fr) minmax(0,.85fr) minmax(0,.9fr) minmax(88px,auto)!important;
      gap:9px!important;
      overflow:hidden!important;
    }
    .stainher-plan-assistant-row label,
    .stainher-plan-assistant-row .field,
    .stainher-plan-assistant-row input,
    .stainher-plan-assistant-row select{
      min-width:0!important;
      width:100%!important;
      max-width:100%!important;
      box-sizing:border-box!important;
    }
    .stainher-plan-assistant-row button{
      min-width:88px!important;
      max-width:100%!important;
      box-sizing:border-box!important;
    }
    @container (max-width:820px){
      .stainher-plan-assistant-head{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        align-items:start!important;
      }
      .stainher-plan-assistant-row{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
      .stainher-plan-assistant-row label:nth-child(2){grid-column:1/-1!important}
      .stainher-plan-assistant-row button{
        grid-column:1/-1!important;
        width:100%!important;
      }
    }
    @container (max-width:540px){
      .stainher-plan-assistant-head{grid-template-columns:1fr!important}
      .stainher-plan-assistant-head [data-generate]{width:100%!important;max-width:none!important}
      .stainher-plan-assistant-row{grid-template-columns:1fr!important}
      .stainher-plan-assistant-row label:nth-child(2){grid-column:auto!important}
    }
  `;
  document.head.appendChild(style);
})();
