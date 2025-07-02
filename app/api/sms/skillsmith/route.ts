// Windsurf: Skill Smith/Percy SMS Agent Flows [2025-07-02]
// Skill Smith SMS webhook handler – mirrors Percy but tailored to sports & fitness flows.
import { NextRequest, NextResponse } from 'next/server';
import { twiml } from 'twilio';
import { isVipNumber, sendSms } from '@/utils/twilioSms';

interface Session {
  stage: 'init' | 'awaiting_name' | 'awaiting_goal' | 'processing' | 'suggesting';
  name?: string;
  goal?: string;
  lastActive: number;
}

const sessions = new Map<string, Session>();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1m
const RATE_LIMIT_MAX = 4;
const rateLimits = new Map<string, { count: number; windowStart: number }>();

function garbageCollect() {
  const now = Date.now();
  sessions.forEach((sess, phone) => {
    if (now - sess.lastActive > SESSION_TTL_MS) sessions.delete(phone);
  });
  rateLimits.forEach((rl, phone) => {
    if (now - rl.windowStart > RATE_LIMIT_WINDOW_MS) rateLimits.delete(phone);
  });
}

export async function POST(req: NextRequest) {
  garbageCollect();
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);
  const from = params.get('From') || '';
  const body = (params.get('Body') || '').trim();

  const twimlResponse = new twiml.MessagingResponse();

  if (!from) {
    twimlResponse.message('Missing sender');
    return xmlResponse(twimlResponse);
  }

  if (!isVipNumber(from)) {
    twimlResponse.message('Sorry, this SKRBL AI service is VIP-only. Apply at skrbl.ai to join.');
    return xmlResponse(twimlResponse);
  }

  // Rate-limit check
  const now = Date.now();
  const rl = rateLimits.get(from) || { count: 0, windowStart: now };
  if (now - rl.windowStart < RATE_LIMIT_WINDOW_MS) {
    if (++rl.count > RATE_LIMIT_MAX) {
      twimlResponse.message('Let’s slow down so I can review your progress without racking up SMS fees. 💸');
      return xmlResponse(twimlResponse);
    }
  } else {
    rl.count = 1;
    rl.windowStart = now;
  }
  rateLimits.set(from, rl);

  // Session retrieval
  let session = sessions.get(from);
  if (!session) {
    session = { stage: 'init', lastActive: now };
    sessions.set(from, session);
  }
  session.lastActive = now;

  // ---- Flow logic ----
  switch (session.stage) {
    case 'init': {
      twimlResponse.message('Hey! I’m Skill Smith 🏋️‍♂️ – your AI Sports & Fitness trainer. What’s your first name?');
      session.stage = 'awaiting_name';
      break;
    }

    case 'awaiting_name': {
      session.name = body.split(' ')[0];
      twimlResponse.message(`Great to meet you, ${session.name}! Tell me your #1 fitness goal or send a workout video link.`);
      session.stage = 'awaiting_goal';
      break;
    }

    case 'awaiting_goal': {
      if (body.toLowerCase().includes('quick win')) {
        twimlResponse.message('Quick Win incoming! 20 burpees EMOM for 5 minutes. 🔥 Reply "Done" when finished!');
        session.stage = 'processing';
        break;
      }

      if (body.match(/https?:\/\//i)) {
        // Video link provided
        twimlResponse.message('Analyzing your form… I’ll text you back with feedback shortly!');
        session.stage = 'processing';
        analyzeVideo(body, from, session.name);
        break;
      }

      // Treat as goal description
      session.goal = body;
      twimlResponse.message(`Love it! Here’s a 3-step Quick Win plan:\n1️⃣ Warm-up mobility – 5 min\n2️⃣ ${session.goal} focused drill – 10 min\n3️⃣ Cool-down stretch – 5 min\nReply "Quick Win" anytime for a different booster or send a video.`);
      session.stage = 'suggesting';
      break;
    }

    case 'processing': {
      twimlResponse.message('Working on it… you’ll hear back soon ✅');
      break;
    }

    case 'suggesting': {
      if (body.toLowerCase().startsWith('quick')) {
        twimlResponse.message('Here’s another Quick Win: 3 sets of 30-second plank holds with 30-second rests. ⏱️');
      } else {
        twimlResponse.message('Send a workout video or ask for a nutrition tip for more personalised advice!');
      }
      break;
    }
  }

  return xmlResponse(twimlResponse);
}

function xmlResponse(twimlResponse: twiml.MessagingResponse) {
  return new NextResponse(twimlResponse.toString(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

async function analyzeVideo(url: string, phone: string, name?: string) {
  try {
    // TODO: integrate video analysis agent logic. Simulate delay for MVP.
    setTimeout(async () => {
      await sendSms({
        to: phone,
        body: `All done, ${name ?? 'friend'}! 🧐 Your squat depth looks solid, but knees cave slightly. Quick fix: think "drive knees out" on descent. Need a full plan? Reply "Plan".`,
      });
      const sess = sessions.get(phone);
      if (sess) sess.stage = 'suggesting';
    }, 20000);
  } catch (err) {
    console.error('Video analysis failed', err);
    await sendSms({ to: phone, body: 'Hmm, that link did not work. Try a different video URL.' });
  }
}
