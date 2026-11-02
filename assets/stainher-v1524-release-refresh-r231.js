/* Stainher App · R309 · comprobación automática de versión y renovación de caché.
 * Se respetan la sesión, formularios abiertos y registros del usuario. */
(()=>{
 'use strict';
 if(window.__STAINHER_RELEASE_REFRESH_R309__)return;
 window.__STAINHER_RELEASE_REFRESH_R309__=true;
 const BASE=new URL('../release.json',document.currentScript?.src||document.baseURI);
 const LOCAL_REV='R309';
 const key='stainher-release-refresh-attempt';
 let checking=false,lastCheck=0;
 const revNumber=value=>Number(String(value||'').match(/^R(\d+)$/)?.[1]||0);
 async function invalidate(){
   try{
     if('serviceWorker' in navigator){
       const registrations=await navigator.serviceWorker.getRegistrations();
       for(const registration of registrations){
         if(registration.scope.startsWith(new URL('./',BASE).href))await registration.unregister();
       }
     }
   }catch(error){console.debug('[Stainher cache] service worker',error)}
   try{
     if('caches' in window){
       const keys=await caches.keys();
       await Promise.all(keys.filter(name=>/stainher/i.test(name)).map(name=>caches.delete(name)));
     }
   }catch(error){console.debug('[Stainher cache] CacheStorage',error)}
 }
 function renderedRevision(){
   const title=document.title.match(/R\d{2,4}/)?.[0];
   return title||LOCAL_REV;
 }
 async function check(){
   const now=Date.now();
   if(checking||now-lastCheck<15000||!navigator.onLine)return;
   checking=true;lastCheck=now;
   try{
     const url=new URL(BASE.href);url.searchParams.set('check',String(now));
     const response=await fetch(url,{cache:'no-store',credentials:'same-origin'});
     if(!response.ok)return;
     const data=await response.json();
     const next=String(data.revision||'');
     if(!revNumber(next))return;
     const current=renderedRevision();
     if(revNumber(next)<=revNumber(current))return;
     if(document.querySelector('#modalRoot .modal,#modalRoot .modal-bg'))return;
     const target=new URL(location.href);
     const last=sessionStorage.getItem(key);
     const attempt=last?JSON.parse(last):null;
     if(attempt?.revision===next&&now-attempt.timestamp<60000&&attempt.count>=2)return;
     const count=attempt?.revision===next?attempt.count+1:1;
     sessionStorage.setItem(key,JSON.stringify({revision:next,timestamp:now,count}));
     await invalidate();
     target.searchParams.set('app_rev',next);
     target.searchParams.set('fresh',String(now));
     location.replace(target.href);
   }catch(error){console.debug('[Stainher release check]',error)}
   finally{checking=false}
 }
 window.addEventListener('pageshow',check);
 window.addEventListener('focus',check);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
 window.addEventListener('online',check);
 setTimeout(check,0);
 setInterval(check,60000);
})();
