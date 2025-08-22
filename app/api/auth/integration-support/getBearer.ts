// Extracts Bearer token from the request headers
export function getBearer(req: Request) {
  const h = new Headers(req.headers);
  const auth = h.get('authorization') || h.get('Authorization');
  return auth?.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
}
