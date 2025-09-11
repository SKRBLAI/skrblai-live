export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // safe on Vercel/Railway Node runtimes
export async function GET() {
  return Response.json({ ok: true, service: 'skrblai', ts: Date.now() });
}