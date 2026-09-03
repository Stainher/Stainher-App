/* Stainher V15.24 · mantiene sincronizado el texto automático de Confiabilidad. */
(function bootstrapReliabilityTextSync(){
  'use strict';

  if(typeof window.v158OpenReliabilityReview!=='function'||typeof window.v158CollectReview!=='function'||!window.state){
    setTimeout(bootstrapReliabilityTextSync,100);
    return;
  }
  if(window.v158OpenReliabilityReview.__v1524ReliabilityTextSync)return;

  const contentKeys=['resumen','fallas','horas','tendencia','disponibilidad','pareto','hallazgos','hipotesis','recomendaciones','conclusiones'];
  const automaticSummary=/^Durante (?:el per[ií]odo\s+)?\d{2}-\d{2}-\d{4}(?:\s+al\s+\d{2}-\d{2}-\d{4})? se registraron \d+ atenciones v[aá]lidas, acumulando \d+(?:[.,]\d+)? horas de intervenci[oó]n\./i;

  function signature(review){
    const rows=(review?.valid||[]).map(row=>[
      row.id||row.uuid||row.created_at||'',row.updated_at||'',row.equipo||'',
      Number(row.duracion_horas||0),Boolean(row.excluir_kpi)
    ]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
    return JSON.stringify({from:window.state.correctivoFrom,to:window.state.correctivoTo,equipment:review?.eq||'',rows});
  }

  const originalCollect=window.v158CollectReview;
  window.v158CollectReview=function(){
    const content=originalCollect.apply(this,arguments);
    const review=window.state.v158ReliabilityReview;
    content.__source_signature=signature(review);
    content.__automatic_fields=contentKeys.filter(key=>(content[key]||'').trim()===(review?.defaultContent?.[key]||'').trim());
    return content;
  };

  const originalOpen=window.v158OpenReliabilityReview;
  async function openReliabilityReview(){
    const result=await originalOpen.apply(this,arguments);
    const review=window.state.v158ReliabilityReview;
    if(!review?.content||!review.defaultContent)return result;

    const savedSignature=review.content.__source_signature;
    const sourceChanged=savedSignature&&savedSignature!==signature(review);
    const automaticFields=Array.isArray(review.content.__automatic_fields)?review.content.__automatic_fields:[];
    if(sourceChanged){
      automaticFields.forEach(key=>{if(contentKeys.includes(key))review.content[key]=review.defaultContent[key]});
    }

    /* Compatibilidad con borradores anteriores a la firma de datos. */
    if(!savedSignature&&automaticSummary.test((review.content.resumen||'').trim())){
      review.content.resumen=review.defaultContent.resumen;
    }

    document.querySelectorAll('[data-v158-review]').forEach(field=>{
      const key=field.dataset.v158Review;
      if(contentKeys.includes(key))field.value=review.content[key]||'';
    });
    return result;
  }
  openReliabilityReview.__v1524ReliabilityTextSync=true;
  window.v158OpenReliabilityReview=openReliabilityReview;
})();
