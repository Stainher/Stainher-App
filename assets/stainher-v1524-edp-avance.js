/* Avance físico y financiero por partida del contrato base. */
(()=>{
  'use strict';
  if(window.__stainherEdpAvanceLoaded)return;
  window.__stainherEdpAvanceLoaded=true;
  const table = 'edp_avance_partidas';
  const catalog = [["A",10,"Mantenimiento eléctrico mensual",55000,1236832,68025760,12000,24352584],["A",20,"Mantenimiento mecánico mensual",55000,1236832,68025760,12000,24352584],["A",30,"Mantenimiento eléctrico trimestral",18000,1236832,22262976,4000,8751568],["A",40,"Mantenimiento mecánico trimestral",18000,1236832,22262976,4000,8751568],["A",50,"Mantenimiento mecánico semestral",9000,1236832,11131488,2000,4375784],["A",60,"Mantenimiento mecánico anual",5000,1236832,6184160,1000,1236832],["A",70,"Inspección de Sala de Máquinas, accesorios, cables y pique.",110000,820342,90237620,24000,32305068],["A",80,"Cambio cables de levante",5000,16706433,83532165,0,0],["A",90,"Certificación sistema de levante (cables y poleas)",18000,2900230,52204140,4000,20519088],["B",110,"Mantenimiento eléctrico quincenal",111000,1236832,137288352,23000,45566216],["B",120,"Mantenimiento mecánico mensual",55000,1236832,68025760,12000,24352584],["B",130,"Mantenimiento mecánico trimestral",17000,1236832,21026144,4000,10653688],["B",140,"Mantenimiento mecánico anual",5000,1236832,6184160,2000,2473664],["B",150,"Inspección de Sala de Máquinas, accesorios, cables y pique.",110000,820342,90237620,24000,32305068],["B",160,"Cambio cables de levante",5000,14050686,70253430,0,0],["B",170,"Certificación sistema de levante (cables y poleas)",18000,2900230,52204140,4000,20519088],["C",190,"Mantenimiento eléctrico mensual",55000,1236832,68025760,12000,24352584],["C",200,"Mantenimiento mecánico mensual",57000,1236832,70499424,11000,19311512],["C",210,"Mantenimiento mecánico trimestral",19000,1236832,23499808,4000,6849448],["C",220,"Mantenimiento mecánico anual",5000,1236832,6184160,1000,1236832],["C",230,"Certificación sistema de levante (cables y poleas)",19000,940304,17865776,4000,5207387],["C",240,"Inspección de Sala de Máquinas, accesorios, cables y estructura",57000,820342,46759494,12000,13822731],["C",250,"Pauta de engrase trimestral Alimak",19000,1236832,23499808,4000,6625504],["C",260,"Pauta de engrase semestral Alimak",9000,1236832,11131488,1000,3138952],["D",280,"Mantenimiento eléctrico quincenal",120000,1236832,148419840,3000,3710496],["D",290,"Mantenimiento mecánico mensual",60000,1236832,74209920,0,0],["D",300,"Mantenimiento mecánico trimestral",20000,1236832,24736640,0,0],["D",310,"Mantenimiento mecánico anual",5000,1236832,6184160,0,0],["D",320,"Inspección de Sala de Máquinas, accesorios, cables y pique.",120000,820342,98441040,13000,10664446],["D",330,"Cambio cables de levante",5000,11385949,56929745,0,0],["D",340,"Certificación sistema de levante (cables y poleas)",19000,2900230,55104370,3000,13159774],["E",360,"Mantenimiento eléctrico mensual",56000,1236832,69262592,12000,22450464],["E",370,"Mantenimiento mecánico mensual",56000,1236832,69262592,12000,22450464],["E",380,"Mantenimiento mecánico trimestral",18000,1236832,22262976,4000,8751568],["E",390,"Mantenimiento mecánico anual",5000,1236832,6184160,1000,1236832],["E",400,"Certificación sistema de levante (cables y poleas)",19000,1066214,20258066,4000,5904584],["E",410,"Inspección de Sala de Máquinas, accesorios, cables y estructura",56000,820342,45939152,12000,14890848],["E",420,"Pauta de engrase trimestral",18000,1236832,22262976,4000,8751568],["E",430,"Pauta de engrase semestral",10000,1236832,12368320,2000,2473664],["F",450,"Inspección de Sala de Máquinas, accesorios, cables y estructura mensual",55000,703723,38704765,12000,13855946],["F",460,"Mantenimiento mecánico y eléctrico mensual",55000,1236832,68025760,12000,24352584],["F",470,"Mantenimiento mecánico anual",5000,1236832,6184160,1000,1236832],["F",480,"Certificación sistema de levante (cables y poleas)",18000,816650,14699700,4000,5778086],["G",500,"Inspección de Sala de Máquinas, accesorios, cables y estructura",57000,1193649,67441169,11000,20747808],["G",510,"Mantenimiento mecánico y eléctrico mensual",58000,1357072,78031640,11000,19429491],["G",520,"Certificación sistema de levante (cables y poleas)",18000,485214,8733852,4000,3422702],["H",540,"Servicios adicionales, incluye atención de fallas y servicios de apoyo",55000,45364683,2495057579,13000,567307624],["I",560,"Estandarización e innovación",5000,79242000,396210000,0,71264034],["J",10,"GGRR",5000,35622265,178111325,1593,56817474]];
  const groups = {
    A:'HUINCHE ASEA (Concentradora)', B:'HUINCHE OTIS', C:'HUINCHE ALIMAK',
    D:'Huinche Tercer Panel (PTP)', E:'Nodo 3700', F:'Ascensor EILA 1 y 2',
    G:'Montacargas Hilton (EQUIPOS 2 Y 3)', H:'Gastos generales',
    I:'Cumplimiento Normativo', J:'Gastos Reembolsables'
  };
  const declaredBase = 5506993265;
  const previousPricePayments = [
    [1,'junio 2025',36872256], [2,'julio 2025',51678742], [3,'agosto 2025',44422458],
    [4,'septiembre 2025',45919184], [5,'octubre 2025',108521758]
  ];
  const previousPriceTotal = previousPricePayments.reduce((total,[,,amount])=>total+amount,0);
  const currency = new Intl.NumberFormat('es-CL', {style:'currency',currency:'CLP'});
  const quantity = new Intl.NumberFormat('es-CL', {maximumFractionDigits:3,useGrouping:false});
  const percent = new Intl.NumberFormat('es-CL', {style:'percent',maximumFractionDigits:2});
  const money = value => currency.format(value);
  const units = value => quantity.format(value / 1000);
  const lineAmount = (value, price) => Math.round(value * price / 1000);

  function eligiblePayments(){
    return (window.state?.contractData?.edp || [])
      .filter(ep=>Number(ep.ep_num)>=18)
      .sort((a,b)=>Number(b.ep_num)-Number(a.ep_num));
  }

  async function openPanel(panel){
    const host = panel.querySelector('[data-avance-body]');
    host.textContent = 'Cargando avance por partida…';
    try {
      const {data,error} = await window.sb.from(table).select('revision,meses').eq('id',1).single();
      if(error) throw error;
      render(host,data,eligiblePayments());
    } catch(error) {
      host.textContent = 'No se pudo cargar el avance por partida. ' + error.message;
    }
  }

  function render(host, loaded, payments){
    let snapshot = loaded;
    let epNumber = Number(payments[0]?.ep_num);
    let draft = {};
    let dirty = false;
    let saving = false;
    let stale = false;
    const editable = typeof v1520CanEdit === 'function' && v1520CanEdit('contrato');
    if(!epNumber){
      host.textContent = 'El detalle por partida está disponible desde el EDP 18.';
      return;
    }
    const baseSum = catalog.reduce((sum, item)=>sum+item[5],0);
    host.innerHTML = `
      <div class="toolbar">
        <label>Estado de Pago <select class="field" data-avance-month></select></label>
        ${editable?'<button type="button" class="btn primary" data-avance-save>Guardar cantidades</button>':''}
      </div>
      <p class="muted">Partidas informadas: ${money(baseSum)}. Facturación con precios anteriores a la modificación contractual (EP1 a EP5): ${money(previousPriceTotal)}. Total conciliado: ${money(baseSum+previousPriceTotal)}. Total declarado: ${money(declaredBase)}. Diferencia residual: ${money(Math.abs(baseSum+previousPriceTotal-declaredBase))}.</p>
      <details data-no-collapse="1"><summary>Ver facturación a precios anteriores</summary>
        <table><thead><tr><th>Estado de Pago</th><th>Período</th><th>Monto facturado</th></tr></thead>
          <tbody>${previousPricePayments.map(([ep,period,amount])=>`<tr><td>EP${ep}</td><td>${period}</td><td>${money(amount)}</td></tr>`).join('')}</tbody>
          <tfoot><tr><th colspan="2" scope="row">Total</th><td>${money(previousPriceTotal)}</td></tr></tfoot>
        </table>
      </details>
      <p role="status" data-avance-status></p>
      <div style="overflow-x:auto" tabindex="0" aria-label="Tabla de avance por partida">
        <table style="min-width:1320px;width:100%;white-space:nowrap">
          <thead>
            <tr><th colspan="7" scope="colgroup">Contrato base</th><th colspan="3" scope="colgroup">Avance físico</th><th colspan="7" scope="colgroup">Avance financiero</th></tr>
            <tr><th>Ítem</th><th>Descripción</th><th>Unidad</th><th>Cantidad</th><th>Saldo cantidad</th><th>Precio unitario</th><th>Total base</th><th>Cantidad del mes</th><th>Anterior</th><th>A la fecha</th><th>Presente</th><th>%</th><th>Anterior</th><th>%</th><th>A la fecha</th><th>%</th><th>Saldo contrato</th></tr>
          </thead>
          <tbody></tbody><tfoot></tfoot>
        </table>
      </div>`;
    const body = host.querySelector('tbody');
    const foot = host.querySelector('tfoot');
    const selector = host.querySelector('[data-avance-month]');
    const status = host.querySelector('[data-avance-status]');
    const save = host.querySelector('[data-avance-save]');
    const cells = [];
    payments.forEach(ep=>{
      selector.add(new Option(`EDP ${ep.ep_num} · ${String(ep.mes_edp).padStart(2,'0')}/${ep.anio_edp}`,ep.ep_num));
    });

    let previousGroup;
    for(const item of catalog){
      const [group,code,description,baseQty,price,base] = item;
      if(previousGroup!==group){
        const heading = body.insertRow();
        const cell = document.createElement('th');
        cell.colSpan = 17;
        cell.scope = 'row';
        cell.style.textAlign = 'left';
        cell.textContent = `${group} · ${groups[group]}`;
        heading.append(cell);
        previousGroup = group;
      }
      const row = body.insertRow();
      const key = group+code;
      const step = group==='J'?1:1000;
      row.innerHTML = `<td>${code}</td><td style="white-space:normal;min-width:200px">${description}</td><td>${group==='J'?'GL':'Unidad'}</td><td>${units(baseQty)}</td><td></td><td>${money(price)}</td><td>${money(base)}</td><td><input type="number" class="field" style="width:85px" min="0" step="${step/1000}" aria-label="Cantidad presente ${key}: ${description}"></td>`+'<td></td>'.repeat(9);
      const input = row.querySelector('input');
      input.readOnly = !editable;
      input.addEventListener('input',()=>{
        const scaled = Number(input.value)*1000;
        const rounded = Math.round(scaled);
        draft[key] = input.validity.badInput || Math.abs(rounded-scaled)>1e-7 ? NaN : rounded;
        dirty = true;
        refresh();
      });
      cells.push({item,key,step,row,input});
    }

    function refresh(){
      let presentTotal=0, previousTotal=0, runningTotal=0, balanceTotal=0;
      let valid=true;
      for(const {item,key,step,row,input} of cells){
        const [, , , baseQty, price, base, initialQty, initialAmount] = item;
        let previousQty = initialQty;
        let previousAmount = initialAmount;
        let futureQty = 0;
        for(const [period,values] of Object.entries(snapshot.meses)){
          const qty = values[key] || 0;
          if(Number(period)<epNumber){
            previousQty += qty;
            previousAmount += lineAmount(qty,price);
          }
          if(Number(period)>epNumber) futureQty += qty;
        }
        const entered = draft[key] ?? 0;
        const max = baseQty-previousQty-futureQty;
        const itemValid = Number.isSafeInteger(entered) && entered>=0 && entered<=max && entered%step===0;
        input.max = max/1000;
        input.setCustomValidity(itemValid?'':`Cantidad inválida. Máximo disponible: ${units(max)}.`);
        input.setAttribute('aria-invalid',String(!itemValid));
        valid &&= itemValid;
        const current = Number.isFinite(entered)?entered:0;
        const present = lineAmount(current,price);
        const accumulated = previousAmount+present;
        const balance = base-accumulated;
        const values = {4:units(baseQty-previousQty-current),8:units(previousQty),9:units(previousQty+current),
          10:money(present),11:percent.format(present/base),12:money(previousAmount),13:percent.format(previousAmount/base),
          14:money(accumulated),15:percent.format(accumulated/base),16:money(balance)};
        for(const [index,value] of Object.entries(values)) row.cells[index].textContent=value;
        presentTotal += present;
        previousTotal += previousAmount;
        runningTotal += accumulated;
        balanceTotal += balance;
      }
      const ratio = value=>percent.format(value/baseSum);
      foot.innerHTML = `<tr><th colspan="6" scope="row">Subtotal partidas informadas</th><td>${money(baseSum)}</td><td colspan="3"></td><td>${money(presentTotal)}</td><td>${ratio(presentTotal)}</td><td>${money(previousTotal)}</td><td>${ratio(previousTotal)}</td><td>${money(runningTotal)}</td><td>${ratio(runningTotal)}</td><td>${money(balanceTotal)}</td></tr>`;
      const official = Number(payments.find(ep=>Number(ep.ep_num)===epNumber)?.total_neto);
      const delta = Number.isFinite(official) && presentTotal !== official
        ? ` · Diferencia frente al total neto registrado (${money(official)}): ${money(presentTotal-official)}.` : '';
      status.textContent = stale ? 'Otro usuario guardó cambios. Cierra y vuelve a abrir el detalle para cargar la versión vigente.' :
        !valid ? 'Revisa las cantidades señaladas. Deben respetar el saldo y la unidad de cada partida.' :
        `Presente: ${money(presentTotal)}${delta}`;
      if(save) save.disabled = !dirty || !valid || saving || stale;
    }

    function changePeriod(){
      epNumber = Number(selector.value);
      draft = {...snapshot.meses[epNumber]};
      dirty = false;
      cells.forEach(({key,input})=>{input.value=Object.hasOwn(draft,key)?draft[key]/1000:''});
      refresh();
    }
    selector.addEventListener('change',()=>{
      if(dirty&&!window.confirm('¿Descartar las cantidades sin guardar de este EDP?')){
        selector.value=epNumber;
        return;
      }
      changePeriod();
    });
    if(save) save.addEventListener('click',async()=>{
      if(save.disabled)return;
      saving=true;
      selector.disabled=true;
      cells.forEach(({input})=>{input.disabled=true});
      refresh();
      let message='';
      try {
        const values=Object.fromEntries(Object.entries(draft).filter(([,value])=>value>0));
        const meses={...snapshot.meses,[epNumber]:values};
        const {data,error}=await window.sb.from(table).update({meses})
          .eq('id',1).eq('revision',snapshot.revision).select('revision,meses').maybeSingle();
        if(error)throw error;
        if(!data){
          stale=true;
          return;
        }
        snapshot=data;
        dirty=false;
        message='Cantidades guardadas.';
      } catch(error) {
        message='No se pudieron guardar las cantidades. '+error.message;
      } finally {
        saving=false;
        selector.disabled=false;
        cells.forEach(({input})=>{input.disabled=false});
        refresh();
        if(message)status.textContent += ' '+message;
      }
    });
    changePeriod();
  }

  function mount(){
    if(window.state?.contractTab!=='edp')return;
    const host=document.getElementById('contractContent');
    if(!host || !eligiblePayments().length || host.querySelector('[data-edp-avance]'))return;
    const panel=document.createElement('details');
    panel.className='panel';
    panel.dataset.edpAvance='';
    panel.dataset.noCollapse='1';
    panel.innerHTML='<summary>Avance físico y financiero por partida</summary><div data-avance-body></div>';
    let loaded=false;
    panel.addEventListener('toggle',()=>{
      if(!panel.open)return;
      if(!loaded || panel.querySelector('[data-avance-status]')?.textContent.startsWith('Otro usuario')){
        loaded=true;
        openPanel(panel);
      }
    });
    host.prepend(panel);
  }

  function boot(){
    const host=document.getElementById('page-contrato') || document.body;
    new MutationObserver(mount).observe(host,{subtree:true,childList:true});
    mount();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
