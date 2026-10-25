import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

// R277: the two outlines introduced by legacy input and date-picker wrappers
// must disappear without altering the orange field or calendar button.
const css=readFileSync('assets/stainher-v1524-visual-r199.css','utf8');
assert.match(css,/#corrFromV1519/);
assert.match(css,/#corrToV1519/);
mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
  for(const width of [390,780,1024]){
    const page=await browser.newPage({viewport:{width,height:844}});
    await page.setContent(`<!doctype html><html data-theme="light"><head><style>
      .v1519-filter-grid{display:grid;gap:12px}
      .stainher-date-picker{display:block;position:relative;background:linear-gradient(125deg,#f45c23,#ba330c);
        border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 0 0 1px #fff;border-radius:30px;padding:12px}
      .stainher-date-picker>input[type="date"]{display:block;box-sizing:border-box;width:100%;
        background:linear-gradient(125deg,#f45c23,#ba330c);color:#fff;
        border:1px solid #fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.9);border-radius:25px;padding:8px}
      .stainher-calendar-button{position:absolute;right:18px;top:16px;color:#fff}
    </style><style>${css}</style></head><body><section id="page-correctivo">
      <div class="v1519-filter-grid">
        <label>DESDE<span class="stainher-date-picker"><input id="corrFromV1519" type="date" value="2026-10-01">
           <button type="button" class="stainher-calendar-button">Calendario</button></span></label>
        <label>HASTA<span class="stainher-date-picker"><input id="corrToV1519" type="date" value="2026-10-31">
           <button type="button" class="stainher-calendar-button">Calendario</button></span></label>
      </div></section></body></html>`);
    const styles=await page.evaluate(()=>['corrFromV1519','corrToV1519'].map(id=>{
      const input=document.getElementById(id),wrapper=input.parentElement;
      const field=getComputedStyle(input),shell=getComputedStyle(wrapper);
      return {
        value:input.value,
        fieldBorder:field.borderTopWidth,
        fieldShadow:field.boxShadow,
        shellBorder:shell.borderTopWidth,
        shellShadow:shell.boxShadow,
        background:field.backgroundImage,
        button:!!wrapper.querySelector('.stainher-calendar-button')
      };
    }));
    for(const field of styles){
      assert.ok(field.button,'Calendar action retained');
      assert.match(field.background,/linear-gradient/,'Orange background is retained');
      if(width<=900){
        assert.equal(field.fieldBorder,'0px','No inner border on date input');
        assert.equal(field.fieldShadow,'none','No inset shadow on input');
        assert.equal(field.shellBorder,'0px','No secondary frame on wrapper');
        assert.equal(field.shellShadow,'none','No inset shadow on wrapper');
      }else{
        assert.equal(field.fieldBorder,'1px','Desktop styles unchanged');
        assert.equal(field.shellBorder,'1px','Desktop wrapper unchanged');
      }
    }
    if(width===390)await page.screenshot({path:'artifacts/correctivo-dates-r277-mobile.png',fullPage:true});
    await page.close();
  }
}finally{await browser.close();}
console.log('R277: mobile date inner frames removed; colors/calendar/Desktop retained.');
