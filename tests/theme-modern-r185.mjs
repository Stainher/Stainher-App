import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync('assets/stainher-v1524-theme.js','utf8');

assert.match(src,/MODERN='modern'/,'Debe declarar tercer tema moderno');
assert.match(src,/:root\[data-theme="modern"\]/,'Debe definir variables del tema moderno');
const modernStart=src.indexOf(':root[data-theme="modern"]{');
assert.ok(modernStart>=0,'Variables Moderno presentes');
const modernCss=src.slice(modernStart,src.indexOf('}',modernStart));
const accentHex=modernCss.match(/--accent:#([0-9a-f]{6})/i)?.[1];
const orangeHex=modernCss.match(/--accent2:#([0-9a-f]{6})/i)?.[1];
const rgb=hex=>hex?.match(/../g).map(v=>parseInt(v,16))||[];
const [tr,tg,tb]=rgb(accentHex);
const [or,og,ob]=rgb(orangeHex);
assert.ok([tr,tg,tb].every(Number.isFinite)&&tg>tr&&tb>tr&&Math.abs(tb-tg)<70,'El tema Moderno conserva acento teal contrastado');
assert.ok([or,og,ob].every(Number.isFinite)&&or>og&&og>ob,'El tema Moderno conserva acento naranja diferenciado');

assert.match(src,/current===DARK\?MODERN:current===MODERN\?LIGHT:DARK/,'Selector debe ciclar Oscuro → Moderno → Claro');
assert.match(src,/v===DARK\|\|v===LIGHT\|\|v===MODERN/,'Tema moderno debe persistir');
const chartTextHex=src.match(/const textColor=light\\?'#[0-9a-f]{6}':modern\\?'(#[0-9a-f]{6})'/i)?.[1];
assert.ok(chartTextHex,'Los gráficos deben adaptar el texto al tema Moderno');
const channel=x=>{const v=x/255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4};
const [cr,cg,cb]=rgb(chartTextHex.slice(1));
const luminance=0.2126*channel(cr)+0.7152*channel(cg)+0.0722*channel(cb);
assert.ok((1.05)/(luminance+0.05)>=4.5,'Texto de gráficos debe contrastar con fondos claros');
assert.match(src,/rgba\(47,139,230,.78\)/,'Gráficos deben usar paleta moderna de mayor contraste');

new Function(src);
console.log('theme-modern-r185: ok');
