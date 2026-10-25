import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

const css=readFileSync('assets/stainher-v1524-visual-r199.css','utf8');
assert.match(css,/R278 - Gastos Reembolsables/);
assert.match(css,/#contractContent:has\(> \.v1523-reemb-grid\)/);
mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
  for(const width of [320,390,430,780,1024]){
    const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
    await page.setContent(`<!doctype html><html data-theme="light"><head>
      <style>
        *{box-sizing:border-box}
        body{margin:0;padding:16px;font-family:Arial;background:#e9f4fc}
        #page-contrato{max-width:100%}
        .row-between,.toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .row-between h3{margin:0 0 10px}
        .btn,.field,.contract-tab{font:inherit;border:1px solid #b9c9db;border-radius:9px;padding:12px;background:#fff;color:#163852}
        .primary,.active{background:#1769c2;color:#fff}
        .toolbar{margin:20px 0}
        .toolbar label{display:flex;align-items:center;gap:12px}
        .contract-tabs{display:flex;overflow-x:auto;gap:10px;white-space:nowrap;width:100%}
        .contract-tab{flex:0 0 auto}
      </style>
      <style>${css}</style>
      </head><body><main id="page-contrato">
        <nav class="contract-tabs">
          <button class="contract-tab">Estados de Pago</button>
          <button class="contract-tab active">Gastos Reembolsables</button>
          <button class="contract-tab">Estandarización e Innovación</button>
        </nav>
        <div id="contractContent">
          <div class="row-between"><div><h3>Gastos Reembolsables</h3><p>Detalle documental y conciliación por Estado de Pago.</p></div><button class="btn primary" id="add" type="button">+ Agregar gasto</button></div>
          <div class="toolbar"><label>EDP<select class="field" id="edp"><option>EP17 · Octubre 2026</option></select></label><button id="report" class="btn" type="button">Generar informe</button></div>
          <div class="v1520-kpis"><div>Documentos: 6</div></div>
          <section class="v1523-reemb-grid">Datos</section>
        </div>
      </main></body></html>`);
    const positions=await page.evaluate(()=>{
      const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return {x:r.x,width:r.width,left:r.left,right:r.right,center:r.left+r.width/2};};
      return {add:rect('add'),edp:rect('edp'),report:rect('report'),pageWidth:document.documentElement.clientWidth,
        tabsOverflow:document.querySelector('.contract-tabs').scrollWidth>document.querySelector('.contract-tabs').clientWidth};
    });
    if(width<=780){
      assert.ok(Math.abs(positions.add.center-positions.edp.center)<1,`Agregar gasto y EDP deben centrarse: ${width}`);
      assert.ok(Math.abs(positions.add.center-positions.report.center)<1,`Generar informe debe centrarse: ${width}`);
      assert.ok(Math.abs(positions.add.width-positions.report.width)<1,`Botones deben medir lo mismo: ${width}`);
      assert.ok(Math.abs(positions.add.width-positions.edp.width)<1,`Botones y selector deben medir lo mismo: ${width}`);
      for(const key of ['add','edp','report']){
        assert.ok(positions[key].left>=0&&positions[key].right<=width+1,`Sin desbordamientos (${width}, ${key})`);
      }
      if(width<=430)assert.ok(positions.tabsOverflow,'Pestañas largas no deben ocultarse, sino poder desplazarse');
    } else {
      assert.ok(Math.abs(positions.add.center-positions.report.center)>1,'Escritorio conserva su barra horizontal');
    }
    if(width===390)await page.screenshot({path:'artifacts/ggrr-mobile-controls-r278.png',fullPage:true});
    await page.close();
  }
}finally{await browser.close()}
console.log('R278 GGRR mobile alignment OK (320/390/430/780) and desktop unchanged (1024).');
