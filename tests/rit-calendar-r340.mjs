/* R340 - calendar works without native iOS date input or horizontal overflow. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {chromium} from "playwright";
import {resolve} from "node:path";
import {showRITFormInModal} from "./helpers/rit-modal-fixture.mjs";
test("RIT calendar remains within the form on desktop and mobile",async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
   const page=await browser.newPage({viewport});
   await page.setContent('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><section id="page-liderazgo" style="width:100%;max-width:100%;box-sizing:border-box"></section></body></html>');
   await page.evaluate(()=>{
    window.state={session:{user:{id:"test"}},profile:{nombre:"Supervisor Test"}};
    window.sb={from(name){
     if(name==="dotacion_contrato")return {select(){return {eq(){return {order(){return Promise.resolve({data:[],error:null})}}}}}};
     throw Error("Unexpected table "+name);
    }};
   });
   await page.addScriptTag({path:resolve("assets/stainher-v1524-rit-r331.js")});
  await showRITFormInModal(page);
   const container=page.locator(".rt-date-field");
   const input=container.locator("input.rt-date-display");
   assert.equal(await input.getAttribute("type"),"text");
   assert.equal(await page.locator('#rit-r331 input[data-field="fecha"]').count(),0);
   const control=container.locator(".rt-date-control");
   const bounds=await Promise.all([container.boundingBox(),control.boundingBox(),input.boundingBox()]);
   assert.ok(bounds.every(Boolean),"Date controls must be visible");
   assert.ok(bounds[1].x>=bounds[0].x-1 && bounds[1].x+bounds[1].width<=bounds[0].x+bounds[0].width+1,"Date controls must fit the form");
   await container.locator('[data-act="date-toggle"]').click();
   const calendar=container.locator(".rt-calendar");
   assert.equal(await calendar.count(),1);
   const calBounds=await calendar.boundingBox();
   const fieldBounds=await container.boundingBox();
   assert.ok(calBounds.x>=fieldBounds.x-1 && calBounds.x+calBounds.width<=fieldBounds.x+fieldBounds.width+1,"Month selector must fit");
   await container.locator('[data-act="date-prev"]').click();
   await container.locator('[data-act="date-next"]').click();
   const day=container.locator('[data-date-day$="-15"]').first();
   const iso=await day.getAttribute("data-date-day");
   await day.click();
   assert.equal(await input.inputValue(),iso.slice(8,10)+"-"+iso.slice(5,7)+"-"+iso.slice(0,4));
   assert.equal(await container.locator(".rt-calendar").count(),0);
   await page.close();
  }
 }finally{await browser.close()}
});