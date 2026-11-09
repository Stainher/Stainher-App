const source = 'https://deve.codelco.cl/';
const cacheDuration = 5 * 60 * 1000;
const allowedDocuments = new Map([
  ['pronóstico meteorológico operativo andina', 'Pronóstico operativo Andina'],
  ['pronóstico semanal', 'Pronóstico semanal'],
  ['boletín riesgos naturales', 'Boletín de riesgos naturales'],
  ['informe pluviométrico', 'Informe pluviométrico'],
  ['aviso meteorológico', 'Aviso meteorológico'],
]);
let cached = null;
let pending = null;

function plain(text) {
  const entities = { nbsp: ' ', amp: '&', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ' };
  return text.replace(/<[^>]*>/g, ' ').replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match)
    .replace(/\s+/g, ' ').trim();
}

function documentUrl(href) {
  try {
    const url = new URL(href, source);
    if (url.origin !== new URL(source).origin || url.username || url.password ||
        !url.pathname.startsWith('/deve/site/docs/') || !/\.(pdf|pptx)$/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

function extractPortal(html, consultedAt) {
  const alertMatch = html.match(/<p\b[^>]*>\s*Alerta vigente:\s*([^<]{1,240})<\/p>/i);
  const documents = new Map();
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = allowedDocuments.get(plain(match[3]).toLowerCase());
    const url = label && documentUrl(match[2]);
    if (url && !documents.has(label)) documents.set(label, { label, url });
  }
  if (!alertMatch && !documents.size) throw new Error('Contenido público de DEVE no reconocido');
  return { alert: alertMatch ? plain(alertMatch[1]) : null, documents: [...documents.values()], consultedAt };
}

async function loadPortal() {
  const response = await fetch(source, {
    redirect: 'error', signal: AbortSignal.timeout(8000),
    headers: { Accept: 'text/html', 'User-Agent': 'StainherApp/15.24 (https://github.com/Stainher/Stainher-App)' },
  });
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('Portal DEVE no disponible');
  const html = await response.text();
  return extractPortal(html, new Date().toISOString());
}

function json(status, body, maxAge = 0) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://stainher.github.io',
    'Cache-Control': maxAge ? 'public, max-age=' + maxAge : 'no-store',
  } });
}

Deno.serve(async request => {
  if (request.method !== 'GET') return json(405, { error: 'Método no permitido.' });
  try {
    if (!cached || Date.now() - Date.parse(cached.consultedAt) >= cacheDuration) {
      pending ??= loadPortal().then(data => { cached = data; }).finally(() => { pending = null; });
      await pending;
    }
    const seconds = Math.max(1, Math.floor((cacheDuration - Date.now() + Date.parse(cached.consultedAt)) / 1000));
    return json(200, cached, seconds);
  } catch {
    return json(503, { error: 'Información de DEVE temporalmente no disponible.' });
  }
});
