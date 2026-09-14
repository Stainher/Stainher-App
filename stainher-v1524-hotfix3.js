/* Compatibilidad de ruta para el loader V15.24. */
(function(){
  'use strict';
  if(document.getElementById('stainher-hotfix3-assets-r50'))return;
  var script=document.createElement('script');
  script.id='stainher-hotfix3-assets-r50';
  script.src='assets/stainher-v1524-hotfix3.js?build=20260914-r50';
  script.async=false;
  script.addEventListener('error',function(){console.error('No se pudo cargar hotfix3 desde assets.');},{once:true});
  document.head.appendChild(script);
})();
