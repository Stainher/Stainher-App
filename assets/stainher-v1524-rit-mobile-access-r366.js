/* R366 · Liderazgo / RIT: controles móviles accesibles sobre el dock fijo.
 * Sin cambios en cálculos, solicitudes, permisos ni PDF.
 */
(()=>{
'use strict';
if(window.StainherRITMobileR366)return;
function install(){
 if(document.getElementById('stainher-rit-mobile-r366'))return;
 const style=document.createElement('style');
 style.id='stainher-rit-mobile-r366';
 style.textContent=[
 '@media(max-width:780px){',
 'html body #page-liderazgo{padding-bottom:max(170px,calc(130px + env(safe-area-inset-bottom,0px)))!important;scroll-padding-bottom:160px;min-width:0;box-sizing:border-box}',
 'html body #page-liderazgo .rit331{margin-bottom:max(165px,calc(125px + env(safe-area-inset-bottom,0px)))!important;min-width:0;max-width:100%;overflow:visible}',
 'html body #page-liderazgo .rit331 .rt-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;min-width:0}',
 'html body #page-liderazgo .rit331 .rt-row{display:flex;flex-wrap:wrap;gap:8px;min-width:0}',
 'html body #page-liderazgo .rit331 :is(.rt-bar,.rt-row) button{min-height:44px!important;min-width:0;flex:1 1 auto;font-size:14px;line-height:1.3;white-space:normal;touch-action:manipulation}',
 'html body #page-liderazgo .rit331 :is(button,input,select,textarea){scroll-margin-bottom:calc(115px + env(safe-area-inset-bottom,0px))}',
 'html body #page-liderazgo .rit331 #rt-message{flex:1 0 100%;overflow-wrap:anywhere}',
 'html body #page-liderazgo .rit331 :is(.rt-box,.rt-grid,.rt-grid3){max-width:100%;min-width:0}',
 '}',
 '@media(max-width:380px){',
 'html body #page-liderazgo .rit331>.rt-bar>.rt-row{width:100%}',
 'html body #page-liderazgo .rit331>.rt-bar>.rt-row button{flex:1 1 45%}',
 '}'
 ].join('\n');
 document.head.appendChild(style);
}
window.StainherRITMobileR366={install};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();