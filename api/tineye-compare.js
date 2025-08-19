// api/tineye-compare.js
export const config = { runtime: 'edge' }; // быстрый старт, без нативных модулей

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ status: 'fail', error: ['Method not allowed'] }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ct = req.headers.get('content-type') || '';
    let url1 = '', url2 = '';

    if (ct.includes('application/json')) {
      const body = await req.json();
      url1 = body.url1 || '';
      url2 = body.url2 || '';
    } else {
      const formData = await req.formData();
      url1 = formData.get('url1') || '';
      url2 = formData.get('url2') || '';
    }

    if (!url1 || !url2) {
      return new Response(JSON.stringify({
        status: 'fail',
        error: ['Missing argument: url1 or url2'],
        result: []
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Составляем form-data для TinEye
    const fd = new FormData();
    fd.append('url1', url1);
    fd.append('url2', url2);

    const upstream = 'https://services.tineye.com/matchengine_sandbox/rest/compare';
    const resp = await fetch(upstream, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd
    });

    const text = await resp.text();
    // TinEye отдаёт JSON; вернём как есть
    return new Response(text, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({
      status: 'fail',
      error: [String(e)],
      result: []
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
