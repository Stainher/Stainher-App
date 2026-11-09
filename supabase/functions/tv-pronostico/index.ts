const upstream = 'https://api.met.no/weatherapi/locationforecast/2.0/complete';
const locations = new Map(Object.entries({
  // Proyecto Traspaso Andina, valle de Río Blanco (Codelco).
  andina: { lat: '-32.9833', lon: '-70.2667', altitude: '3500' },
  // GeoNames 3871336, Santiago.
  santiago: { lat: '-33.4569', lon: '-70.6482', altitude: '556' },
}).map(([key, coordinates]) => [key, { coordinates, cached: null, lastModified: null, pending: null, retryAt: 0 }]));
const origin = 'https://stainher.github.io';
const minimumRefresh = 3 * 60 * 60 * 1000;
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' });
function localDay(value) {
  const parts = Object.fromEntries(dayFormatter.formatToParts(value).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
const localHour = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Santiago', hour: '2-digit', hourCycle: 'h23' });
const rank = { unknown: -1, sun: 0, partly: 0, cloud: 0, fog: 1, rain: 2, sleet: 3, snow: 4, thunder: 5 };

function condition(code) {
  if (!code) return 'unknown';
  if (code.includes('thunder')) return 'thunder';
  if (code.includes('snow')) return 'snow';
  if (code.includes('sleet')) return 'sleet';
  if (code.includes('rain')) return 'rain';
  if (code.includes('fog')) return 'fog';
  if (code.includes('partlycloudy') || code.includes('fair')) return 'partly';
  if (code.includes('cloudy')) return 'cloud';
  if (code.includes('clearsky')) return 'sun';
  return 'unknown';
}

function summarize(series, now) {
  const today = localDay(now);
  const days = new Map();
  for (const item of series) {
    const at = new Date(item.time);
    const temperature = item.data?.instant?.details?.air_temperature;
    if (!Number.isFinite(at.getTime()) || !Number.isFinite(temperature)) continue;
    const date = localDay(at);
    if (date < today) continue;
    const period = item.data.next_6_hours;
    const details = period?.details;
    const withinDay = localDay(at.getTime() + 6 * 60 * 60 * 1000 - 1) === date;
    const minimum = withinDay && Number.isFinite(details?.air_temperature_min) ? details.air_temperature_min : temperature;
    const maximum = withinDay && Number.isFinite(details?.air_temperature_max) ? details.air_temperature_max : temperature;
    const symbol = condition(item.data.next_1_hours?.summary?.symbol_code || period?.summary?.symbol_code);
    const distance = Math.abs(Number(localHour.format(at)) - 13);
    const day = days.get(date) ?? { date, min: temperature, max: temperature, condition: 'unknown', distance: Infinity };
    day.min = Math.min(day.min, temperature, minimum);
    day.max = Math.max(day.max, temperature, maximum);
    if (rank[symbol] > rank[day.condition] || (rank[symbol] === rank[day.condition] && distance < day.distance)) {
      day.condition = symbol;
      day.distance = distance;
    }
    days.set(date, day);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 9)
    .map(({ date, min, max, condition }) => ({ date, min: Math.round(min), max: Math.round(max), condition }));
}

async function refresh(location, state, now) {
  const url = new URL(upstream);
  url.search = new URLSearchParams(state.coordinates).toString();
  const headers = { 'User-Agent': 'StainherApp/15.24 (https://github.com/Stainher/Stainher-App)' };
  if (state.lastModified) headers['If-Modified-Since'] = state.lastModified;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  const expiresAt = Math.max(now + minimumRefresh, Date.parse(response.headers.get('Expires') || '') || 0);
  if (response.status === 304 && state.cached) return { ...state.cached, expiresAt };
  if (response.status === 429) {
    const retry = response.headers.get('Retry-After');
    const retryDelay = Number(retry)*1000 || Date.parse(retry || '')-now;
    if (Number.isFinite(retryDelay)) state.retryAt = now + retryDelay;
  }
  if (!response.ok) throw new Error('MET Norway HTTP ' + response.status);
  const { properties } = await response.json();
  const days = summarize(properties.timeseries, now);
  const updatedAt = properties.meta?.updated_at;
  if (days.length < 7 || !Number.isFinite(Date.parse(updatedAt))) throw new Error('Pronóstico incompleto');
  state.lastModified = response.headers.get('Last-Modified');
  return { location, updatedAt, expiresAt, days };
}

function json(status, body, maxAge = 0) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json',
    'Cache-Control': maxAge ? 'public, max-age=' + maxAge : 'no-store',
  } });
}

Deno.serve(async request => {
  if (request.method !== 'GET') return json(405, { error: 'Método no permitido.' });
  const location = new URL(request.url).searchParams.get('location') ?? 'andina';
  const state = locations.get(location);
  if (!state) return json(400, { error: 'Ubicación de pronóstico inválida.' });
  const now = Date.now();
  try {
    if ((!state.cached || state.cached.expiresAt <= now) && now >= state.retryAt) {
      state.pending ??= refresh(location, state, now).then(result => { state.cached = result; }).catch(error => {
        state.retryAt = Math.max(state.retryAt, Date.now() + 15 * 60 * 1000);
        console.warn('[tv-pronostico]', error.message);
      }).finally(() => { state.pending = null; });
      await state.pending;
    }
    if (!state.cached || state.cached.expiresAt <= now) return json(503, { error: 'Pronóstico temporalmente no disponible.' });
    return json(200, state.cached, Math.max(1, Math.floor((state.cached.expiresAt - now) / 1000)));
  } catch {
    return json(503, { error: 'Pronóstico temporalmente no disponible.' });
  }
});
