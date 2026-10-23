import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync('assets/stainher-v1524-theme.js','utf8');

assert.match(src,/MODERN='modern'/,'Debe declarar tercer tema moderno');
assert.match(src,/:root\[data-theme="modern"\]/,'Debe definir variables del tema moderno');
const modernCss=src.match(/:root\\[data-theme="modern"\\]\\{([^}]+)\\}/)?.[1]||'';
const accentHex=modernCss.match(/--accent:#([0-9a-f]{6})/i)?.[1];
const orangeHex=modernCss.match(/--accent2:#([0-9a-f]{6})/i)?.[1];
const rgb=hex=>hex?.match(/../g).map(v=>parseInt(v,16))||[];
const [tr,tg,tb]=rgb(accentHex);
const [or,og,ob]=rgb(orangeHex);
assert.ok([tr,tg,tb].every(Number.isFinite)&&tg>tr&&tb>tr&&Math.abs(tb-tg)<70,'El tema Moderno conserva acento teal contrastado');
assert.ok([or,og,ob].every(Number.isFinite)&&or>og&&og>ob,'El tema Moderno conserva acento naranja diferenciado');

assert.match(src,/current===DARK\?MODERN:current===MODERN\?LIGHT:DARK/,'Selector debe ciclar Oscuro → Moderno → Claro');
assert.match(src,/v===DARK\|\|v===LIGHT\|\|v===MODERN/,'Tema moderno debe persistir');
assert.match(src,/modern\?'#b9c8d8'/,'Gráficos deben adaptar texto al tema moderno');
assert.match(src,/rgba\(47,139,230,.78\)/,'Gráficos deben usar paleta moderna de mayor contraste');

new Function(src);
console.log('theme-modern-r185: ok');
