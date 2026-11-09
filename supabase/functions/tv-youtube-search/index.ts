const origin = 'https://stainher.github.io';
const cors = {
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

Deno.serve(async request => {
  const requestOrigin = request.headers.get('Origin');
  if (requestOrigin && requestOrigin !== origin) return json(403, { error: 'Origen no autorizado.' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return json(405, { error: 'Método no permitido.' });

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json(401, { error: 'Inicia sesión para buscar videos.' });
  const projectUrl = Deno.env.get('SUPABASE_URL');
  const apikey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!projectUrl || !apikey) return json(503, { error: 'El buscador no está disponible.' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { error: 'Escribe un término de búsqueda válido.' }); }
  const query = typeof body?.query === 'string' ? body.query.trim().replace(/\s+/g, ' ') : '';
  if (query.length < 2 || query.length > 120) {
    return json(400, { error: 'Escribe entre 2 y 120 caracteres.' });
  }

  try {
    const headers = { Authorization: authorization, apikey };
    const userResponse = await fetch(new URL('/auth/v1/user', projectUrl), {
      headers, signal: AbortSignal.timeout(8000),
    });
    if (!userResponse.ok) return json(401, { error: 'La sesión expiró. Ingresa nuevamente.' });
    const user = await userResponse.json();
    if (!user?.id) return json(401, { error: 'La sesión expiró. Ingresa nuevamente.' });

    const profileUrl = new URL('/rest/v1/perfiles', projectUrl);
    profileUrl.search = new URLSearchParams({ select: 'rol,activo', id: 'eq.' + user.id }).toString();
    const profileResponse = await fetch(profileUrl, { headers, signal: AbortSignal.timeout(8000) });
    if (!profileResponse.ok) return json(403, { error: 'La búsqueda requiere un perfil Administrador activo.' });
    const [profile] = await profileResponse.json();
    if (profile?.rol !== 'administrador' || profile.activo !== true) {
      return json(403, { error: 'La búsqueda requiere un perfil Administrador activo.' });
    }

    const youtubeKey = Deno.env.get('YOUTUBE_DATA_API_KEY');
    if (!youtubeKey) return json(503, { error: 'La búsqueda integrada requiere activar la conexión con YouTube.' });
    const search = new URL('https://www.googleapis.com/youtube/v3/search');
    search.search = new URLSearchParams({
      part: 'snippet', type: 'video', q: query, maxResults: '8',
      videoEmbeddable: 'true', videoSyndicated: 'true', regionCode: 'CL',
      relevanceLanguage: 'es', safeSearch: 'moderate',
      fields: 'items(id/videoId,snippet(title,channelTitle))',
    }).toString();
    const result = await fetch(search, {
      headers: { 'x-goog-api-key': youtubeKey },
      signal: AbortSignal.timeout(10000),
    });
    if (!result.ok) {
      return json(502, { error: 'YouTube no respondió a la búsqueda. Revisa la clave o la cuota de la API.' });
    }
    const data = await result.json();
    const items = (Array.isArray(data.items) ? data.items : [])
      .filter(item => /^[\w-]{11}$/.test(item.id?.videoId || ''))
      .slice(0, 8)
      .map(item => ({
        id: item.id.videoId,
        title: String(item.snippet?.title || 'Video de YouTube').slice(0, 200),
        channel: String(item.snippet?.channelTitle || '').slice(0, 120),
      }));
    return json(200, { items });
  } catch {
    return json(502, { error: 'No se pudo completar la búsqueda. Intenta nuevamente.' });
  }
});
