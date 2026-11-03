import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import vm from "node:vm";
import {webcrypto} from "node:crypto";
const source=readFileSync("assets/stainher-v1524-rit-pdf-r331.js","utf8");
test("R339: bundled RIT resolves script-relative URLs on mobile/PWA",async()=>{
 const requested=[];
 const context={
  URL,TextDecoder,Uint8Array,ArrayBuffer,Promise,console,
  crypto:webcrypto,
  atob:s=>Buffer.from(s,"base64").toString("binary"),
  location:{href:"https://stainher.github.io/Stainher-App/?mobile=1"},
  document:{currentScript:{src:"https://stainher.github.io/Stainher-App/assets/stainher-v1524-rit-pdf-r331.js"}},
  window:{PDFLib:{PDFDocument:{load:async()=>({getPages:()=>[0,1].map(()=>({getWidth:()=>1190.55,getHeight:()=>841.89}))})}}},
  fetch:async url=>{
   requested.push(String(url));
   const match=String(url).match(/r331-part-(\\d{2})\\.txt$/);
   assert.ok(match,"unexpected template URL: "+url);
   return {ok:true,text:async()=>readFileSync("assets/rit-template/r331-part-"+match[1]+".txt","utf8")};
  }
 };
 vm.createContext(context);
 vm.runInContext(source,context,{filename:"stainher-v1524-rit-pdf-r331.js"});
 assert.equal(await context.window.StainherRITPDF.hasTemplate(),true);
 assert.equal(requested.length,15);
 assert.ok(requested.every(url=>url.startsWith("https://stainher.github.io/Stainher-App/assets/rit-template/")));
});
test("R339: date icon is constrained within the mobile input",()=>{
 const ui=readFileSync("assets/stainher-v1524-rit-r331.js","utf8");
 assert.match(ui,/calendar-picker-indicator/);
 assert.match(ui,/display:none!important/);
 assert.match(ui,/max-width:100%!important/);
});
