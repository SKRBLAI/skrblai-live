import { NextResponse } from 'next/server';

export type Handler = (req: Request) => Promise<Response> | Response;

export function withSafeJson(handler: Handler): Handler {
  return async (req: Request) => {
    try {
      const res = await handler(req);
      return res;
    } catch (e: any) {
      console.error('[api error]', e?.stack || e?.message || e);
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
  };
}
