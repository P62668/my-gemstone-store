export function maskIdentifier(id?: string | null) {
  if (!id || typeof id !== 'string') return undefined;
  return id.replace(/(^[^@]{2})([^@]*)(@.*$)/, (_m, a, _b, c) => `${a}***${c}`);
}

export function getRequestIp(req: any) {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req?.socket?.remoteAddress || 'unknown';
}
