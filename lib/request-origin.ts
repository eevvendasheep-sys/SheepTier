// Netlify proxies can present an internal URL to Next.js. Trust only explicit site origins.
export function isSameSiteRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  try {
    const incoming = new URL(origin);
    if (incoming.origin !== origin || !['http:', 'https:'].includes(incoming.protocol)) return false;
    const allowed = [new URL(request.url).origin, 'https://sheeptier-580e077a.netlify.app'];
    for (const value of [process.env.SITE_URL, process.env.URL, process.env.DEPLOY_URL, process.env.DEPLOY_PRIME_URL]) {
      if (!value) continue;
      try { const url = new URL(value); if (url.protocol === 'https:' && !url.username && !url.password) allowed.push(url.origin); } catch {}
    }
    return allowed.includes(origin);
  } catch { return false; }
}
