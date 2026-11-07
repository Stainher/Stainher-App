/* Test helper: mount the real RIT wizard inside a visible modal host.
 * R390 modal integration is independently validated by tests/rit-modal-r390.mjs.
 * Legacy form tests validate field behavior, not the initial display mode.
 */
export async function showRITFormInModal(page){
 await page.evaluate(()=>{
  const root=document.getElementById('page-liderazgo');
  const rit=root?.querySelector('#rit-r331');
  if(!root||!rit)throw Error('RIT form missing from test fixture');
  let overlay=root.querySelector('#stainher-rit-overlay-r390');
  if(!overlay){
   overlay=document.createElement('section');
   overlay.id='stainher-rit-overlay-r390';
   overlay.innerHTML='<div id="stainher-rit-modal-body-r390"></div>';
   root.appendChild(overlay);
  }
  overlay.hidden=false;
  const slot=overlay.querySelector('#stainher-rit-modal-body-r390');
  slot.appendChild(rit);
  rit.dataset.r390Modal='1';
 });
}
