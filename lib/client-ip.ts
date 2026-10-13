export function clientIP(request:Request):string|null {
  const value=process.env.VERCEL==='1'
    ? request.headers.get('x-vercel-forwarded-for')??request.headers.get('x-forwarded-for')
    : request.headers.get('x-nf-client-connection-ip');
  const ip=value?.split(',')[0].trim();
  return ip&&/^[0-9a-fA-F:.]{3,64}$/.test(ip)?ip:null;
}
