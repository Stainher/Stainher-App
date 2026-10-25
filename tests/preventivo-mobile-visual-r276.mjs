import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

/* R276: actual computed-style regression for the month picker visible on iPhone. */
const css=readFileSync('assets/stainher-v1524-visual-r199.css','utf8');
assert.match(css,/#page-preventivo :is\(input\[type="month"\],input\[type="date"\],select\)/);
assert.match(css,/@media \(max-width:780px\)/);
mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
  for(const theme of ['light','modern','dark']){
    const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
    await page.setContent(`<!doctype html><html data-theme="${theme}"><head>
      <style>
        html body #page-preventivo input[type="month"],
        html body #page-preventivo select{
          background:#0b1019!important;color:#fff!important;
          -webkit-text-fill-color:#fff!important;border:1px solid #111!important;
        }
        #v151MobileHead{background:#101a24;color:#f5f9ff}
        body{font-family:Arial;background:#dcecf4}
      </style><style>${css}</style></head>
      <body><div id="v151MobileHead">Preventivo</div>
        <section id="page-preventivo">
          <label>MES CONTRACTUAL
            <span class="stainher-date-picker">
              <input type="month" value="2026-11" aria-label="Mes contractual">
              <button class="stainher-calendar-button" type="button" aria-label="Abrir selector de mes">▦</button>
            </span>
          </label>
          <label>ESTADO <select><option>Todos</option></select></label>
        </section>
      </body></html>`);
    const computed=await page.evaluate(()=>{
      const month=getComputedStyle(document.querySelector('input[type="month"]'));
      const select=getComputedStyle(document.querySelector('select'));
      const head=getComputedStyle(document.querySelector('#v151MobileHead'));
      return {background:month.backgroundImage,color:month.color,fill:month.webkitTextFillColor,
        selectBackground:select.backgroundImage,headBackground:head.backgroundColor};
    });
    if(theme==='dark'){
      assert.equal(computed.background,'none','Dark theme must keep its original month-field styling');
    }else{
      assert.match(computed.background,/linear-gradient/,`${theme}: month field should not stay black`);
      assert.equal(computed.color,'rgb(23, 52, 77)',`${theme}: month text must be dark`);
      assert.equal(computed.fill,'rgb(23, 52, 77)',`${theme}: Safari month text fill must be dark`);
      assert.match(computed.selectBackground,/linear-gradient/,`${theme}: select should match month field`);
    }
    assert.equal(computed.headBackground,'rgb(16, 26, 36)','Mobile nav must retain its dark fill');
    await page.screenshot({path:`artifacts/preventivo-mobile-r276-${theme}.png`});
    await page.close();
  }
}finally{await browser.close()}
console.log('R276 Preventivo mobile light/modern contrast OK; dark and navigation preserved');
