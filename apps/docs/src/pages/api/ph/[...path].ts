import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/ph/', '');
  
  const proxyUrl = new URL(path, 'https://us.i.posthog.com/').href;
  //TODO: remove logs
  console.log(`Proxying ${path} to ${proxyUrl}`);

  try {
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    const response = await fetch(proxyUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        'accept-encoding': 'identity',
        'origin': 'https://us.i.posthog.com',
        'host': 'us.i.posthog.com'
      },
      body
    });

    const responseBody = await response.text();
    
    const headers = new Headers();
    headers.set('content-type', response.headers.get('content-type') || 'application/javascript');
    headers.set('cache-control', 'public, max-age=3600');
    headers.set('access-control-allow-origin', '*');

    return new Response(responseBody, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response('Proxy Error', { status: 500 });
  }
};