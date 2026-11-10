/* Nómina compartida de Controles Stainher. */
(() => {
  'use strict';

  const fields = new WeakMap();
  let roster;

  function loadRoster() {
    const userId = window.state?.session?.user?.id;
    if (!userId) return Promise.reject(new Error('Sesión no disponible.'));
    if (roster?.userId === userId && roster.expires > Date.now()) return roster.promise;

    const request = {userId, expires: Date.now() + 60_000};
    request.promise = Promise.resolve().then(async () => {
      const {data, error} = await window.sb.rpc('controles_responsables_r416');
      if (error) throw error;
      return (data || []).filter(row => row.user_id && row.nombre);
    }).catch(error => {
      if (roster === request) roster = undefined;
      throw error;
    });
    roster = request;
    return request.promise;
  }

  function element(target) {
    return typeof target === 'string' ? document.getElementById(target) : target;
  }

  async function fill(target, {byName = false, initial = ''} = {}) {
    const select = element(target);
    if (!select) return;
    if (fields.has(select)) return fields.get(select);
    const selected = select.value || initial;
    select.disabled = false;
    select.removeAttribute('aria-disabled');
    select.replaceChildren(new Option('Cargando perfiles…', ''));

    const request = loadRoster().then(rows => {
      if (!select.isConnected) return;
      const options = rows.map(({user_id, nombre}) => {
        const option = new Option(nombre, byName ? nombre : user_id);
        option.dataset.userId = user_id;
        return option;
      });
      // Los borradores de RIT almacenan el nombre, incluso si el perfil ya no está activo.
      if (byName && selected && !options.some(option => option.value === selected)) {
        options.unshift(new Option(selected, selected));
      }
      select.replaceChildren(new Option(options.length ? 'Seleccionar supervisor' : 'Sin perfiles activos', ''), ...options);
      if (options.some(option => option.value === selected)) select.value = selected;
    }).catch(error => {
      fields.delete(select);
      if (!select.isConnected) return;
      const retry = () => {
        select.removeEventListener('focus', retry);
        select.removeEventListener('pointerdown', retry);
        void fill(select, {byName, initial: selected});
      };
      select.replaceChildren(new Option('No se pudo cargar. Pulsa para reintentar.', ''));
      select.addEventListener('focus', retry);
      select.addEventListener('pointerdown', retry);
      console.warn('[Controles Stainher] Error al cargar perfiles', error);
    });
    fields.set(select, request);
    return request;
  }

  function read(target) {
    const option = element(target)?.selectedOptions?.[0];
    return {
      supervisor_user_id: option?.value ? option.dataset.userId || null : null,
      supervisor_nombre: option?.value ? option.textContent.trim() : ''
    };
  }

  window.StainherControlSupervisor = Object.freeze({fill, read});
})();
