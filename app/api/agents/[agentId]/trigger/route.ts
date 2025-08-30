// Alias for deprecated /api/agents/[agentId]/trigger route. Forwards to /api/agents/[agentId]/trigger-n8n with deprecation warning.
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  // Forward request to /trigger-n8n
  const { agentId } = await params;
  const url = new URL(request.url);
  const baseUrl = url.origin;
  const relayUrl = `${baseUrl}/api/agents/${agentId}/trigger-n8n`;

  // Forward the body and headers
  const body = await request.text();
  const response = await fetch(relayUrl, {
    method: 'POST',
    headers: {
      ...Object.fromEntries(request.headers.entries()),
      'x-skrbl-deprecation-warning': '/api/agents/[agentId]/trigger is deprecated. Use /trigger-n8n.'
    },
    body,
  });
  // Forward the response, but inject deprecation warning
  const data = await response.json();
  return NextResponse.json({
    ...data,
    deprecation: '/api/agents/[agentId]/trigger is deprecated. Use /trigger-n8n.'
  }, { status: response.status });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  // Forward GET to /trigger-n8n (for status checks)
  const { agentId } = await params;
  const url = new URL(request.url);
  const baseUrl = url.origin;
  const relayUrl = `${baseUrl}/api/agents/${agentId}/trigger-n8n${url.search}`;
  const response = await fetch(relayUrl, {
    method: 'GET',
    headers: {
      ...Object.fromEntries(request.headers.entries()),
      'x-skrbl-deprecation-warning': '/api/agents/[agentId]/trigger is deprecated. Use /trigger-n8n.'
    },
  });
  const data = await response.json();
  return NextResponse.json({
    ...data,
    deprecation: '/api/agents/[agentId]/trigger is deprecated. Use /trigger-n8n.'
  }, { status: response.status });
}
