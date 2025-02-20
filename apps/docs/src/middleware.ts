import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  
  if (url.pathname.startsWith('/ingest/static/')) {
    const newUrl = url.pathname.replace(
      '/ingest/static/',
      'https://us-assets.i.posthog.com/static/'
    );
    return fetch(newUrl);
  }
  
  if (url.pathname.startsWith('/ingest/')) {
    const newUrl = url.pathname.replace(
      '/ingest/',
      'https://us.i.posthog.com/'
    );
    return fetch(newUrl, {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body
    });
  }

  return next();
});