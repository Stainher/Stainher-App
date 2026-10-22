import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync('assets/stainher-v1524-theme.js','utf8');

assert.match(src,/MODERN='modern'/,'Debe declarar tercer tema moderno');
assert.match(src,/:root\[data-theme="modern"\]/,'Debe definir variables del tema moderno');
assert.match(src,/--accent:#19a7a0/,'Tema moderno debe usar acento teal');
assert.match(src,/--accent2:#ff7a2f/,'Tema moderno debe usar acento naranja controlado');
assert.match(src,/current===DARK\?MODERN:current===MODERN\?LIGHT:DARK/,'Selector debe ciclar Oscuro → Moderno → Claro');
assert.match(src,/v===DARK\|\|v===LIGHT\|\|v===MODERN/,'Tema moderno debe persistir');
assert.match(src,/modern\?'#b9c8d8'/,'Gráficos deben adaptar texto al tema moderno');
assert.match(src,/rgba\(47,139,230,.78\)/,'Gráficos deben usar paleta moderna de mayor contraste');

new Function(src);
console.log('theme-modern-r185: ok');
