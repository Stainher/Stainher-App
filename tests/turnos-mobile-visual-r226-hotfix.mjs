import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const direct = read('assets/stainher-turnos-direct-r18.js');
const legacy = read('assets/stainher-turnos-light-contrast-r18.js');
const themeSource = read('assets/stainher-v1524-theme.js');
const themeCss = themeSource.match(/const css=`([\s\S]*?)`;/)?.[1];
assert.ok(themeCss, 'CSS real de Claro/Moderno');
const directCss = direct.match(/s\.textContent=`([\s\S]*?)`;document\.head\.appendChild\(s\);/)?.[1];
const lightCss = [...legacy.matchAll(/style\.textContent=`([\s\S]*?)`;/g)]
  .map(match => match[1].replace(/\$\{eventCss\}/g, ''));
assert.ok(directCss, 'CSS real del renderizador de turnos');
assert.ok(lightCss.length >= 2, 'Capas reales de color de turnos');
assert.match(directCss, /\.r18-turn-actions\{display:grid!important/);
assert.match(directCss, /\.r18-mobile-day \.r18-event-code/);
assert.match(legacy, /html:is\(\[data-theme="light"\],\[data-theme="modern"\]\) #page-turnos \.r18-event-code\.ET/);

const browser = await chromium.launch({ headless: true });
mkdirSync('artifacts', { recursive: true });
try {
  for (const theme of ['light', 'modern']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const days = Array.from({ length: 31 }, (_, n) =>
      `<div class="r18-mobile-day editable"><span class="r18-mobile-date"><small class="r18-mobile-weekday">Vie</small><b>${n + 1}</b></span><span class="r18-shift A">A</span><div class="r18-cell-events"><span class="r18-event-code ET">ET</span>${n===0?'<span class="r18-event-code HE">HE 4h</span>':''}</div></div>`
    ).join('');
    await page.setContent(`<!doctype html><html data-theme="${theme}"><head><style>body{margin:0}#page-turnos{box-sizing:border-box;width:100%;padding:10px}#page-turnos .r18-turn-tabs>button{min-width:165px!important;white-space:nowrap!important;font-size:18px!important}</style></head><body><section id="page-turnos">
      <div class="r18-turn-meta"><span class="status">Turnos directos</span><span>3000 ms datos</span></div>
      <div class="r18-turn-actions">
        <button class="btn" data-r18-template>↓ Plantilla anual</button>
        <button class="btn" data-r18-import>↑ Importar Excel</button>
        <button class="btn primary" data-r18-new>+ Nuevo evento</button>
        <button class="btn" data-r18-report>↓ Informe</button>
        <button class="btn" data-r18-publish>Publicar turnos</button>
      </div>
      <div class="r18-turn-tabs">
        <button class="btn active" data-r18-tab="malla">Malla</button>
        <button class="btn" data-r18-tab="novedades">Eventos y novedades</button>
        <button class="btn" data-r18-tab="reporte">Reporte Semanal HP</button>
      </div>
      <div class="r18-mobile"><article class="r18-mobile-person">
      <b class="r18-person-name">Luis Adolfo Rojas Orellana</b>
      <small class="r18-person-role">Supervisor</small>
      <div class="r18-mobile-days">${days}</div></article></div>
    </section></body></html>`);
    await page.addStyleTag({ content: themeCss });
    await page.addStyleTag({ content: directCss });
    for (const css of lightCss) await page.addStyleTag({ content: css });
    const layout = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect();
      const style = selector => getComputedStyle(document.querySelector(selector));
      return {
        btn1: rect('[data-r18-template]').toJSON(),
        btn2: rect('[data-r18-import]').toJSON(),
        primary: rect('[data-r18-new]').toJSON(),
        tabs: [...document.querySelectorAll('.r18-turn-tabs button')].map(el => ({...el.getBoundingClientRect().toJSON(), text:el.textContent.trim(), whiteSpace:getComputedStyle(el).whiteSpace})),
        day: rect('.r18-mobile-day').toJSON(),
        codeColor: style('.r18-event-code.ET').color,
        shiftColor: style('.r18-shift.A').color,
        metaDisplay: style('.r18-turn-meta').display,
        pageWidth: rect('#page-turnos').width,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth
      };
    });
    assert.ok(Math.abs(layout.btn1.y - layout.btn2.y) < 2, 'Primera fila con dos acciones');
    assert.ok(layout.primary.width > layout.btn1.width * 1.8, 'Nuevo evento ocupa una fila completa');
    assert.ok(layout.btn1.height >= 44, 'Acciones táctiles de 44px o más');
    assert.ok(layout.day.height >= 62, 'Celdas diarias legibles');
    assert.equal(layout.tabs.length, 3, 'El tercer reporte HP está presente');
    assert.ok(layout.tabs.every(t => t.left >= 0 && t.right <= layout.viewportWidth + 1), 'Ninguna pestaña recortada horizontalmente');
    assert.ok(layout.tabs.every(t => t.height >= 54 && t.whiteSpace === 'normal'), 'Todas las pestañas muestran sus títulos en varias líneas: '+JSON.stringify(layout.tabs));
    assert.ok(Math.abs(layout.tabs[0].y-layout.tabs[2].y) < 2, 'Las tres pestañas comparten una fila');
    assert.ok(layout.tabs[2].right > layout.tabs[1].right && layout.tabs[0].left < layout.tabs[1].left, 'Las pestañas se mantienen ordenadas');
    assert.equal(layout.metaDisplay, 'none', 'Telemetría no ocupa espacio móvil');
    assert.equal(layout.codeColor, 'rgb(6, 118, 71)', 'Código ET legible en ' + theme);
    assert.equal(layout.shiftColor, 'rgb(21, 94, 239)', 'Turno A legible en ' + theme);
    assert.ok(layout.scrollWidth <= layout.viewportWidth + 1, 'Sin desbordamiento horizontal global');
    await page.screenshot({ path: `artifacts/turnos-mobile-${theme}-r226-hotfix.png`, fullPage: true });
    console.log('PASS: Turnos móvil ' + theme);
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.setContent('<div id="page-turnos"><div class="r18-turn-actions"><button class="btn">Uno</button><button class="btn">Dos</button></div></div>');
  await page.addStyleTag({content: directCss});
  assert.equal(await page.locator('.r18-turn-actions').evaluate(el => getComputedStyle(el).display), 'flex', 'Escritorio conserva la barra original');
  await page.close();
} finally {
  await browser.close();
}
