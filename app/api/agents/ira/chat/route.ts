export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/getSession";
import { isAllowedIRA } from "@/lib/auth/isAllowedIRA";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const email = session?.user?.email ?? null;
    if (!isAllowedIRA(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { message, context } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content:
          "You are IRA, Rod’s trading mentor. Prioritize AOIs, volume profile, liquidity, options flow, earnings catalysts, and risk-first entries. Be concise and actionable." },
        ...(Array.isArray(context) ? context : []),
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content ?? "…";
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("[IRA chat] error:", e?.message || e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
