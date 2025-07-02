// Windsurf: Skill Smith/Percy SMS Agent Flows [2025-07-02]
import { NextRequest, NextResponse } from 'next/server';
import { twiml } from 'twilio';
import { isVipNumber, sendSms } from '@/utils/twilioSms';

// Very lightweight in-memory session store (resets on redeploy)
interface Session {
  stage: 'init' | 'awaiting_name' | 'awaiting_business' | 'awaiting_link' | 'scanning' | 'suggesting';
  name?: string;
  business?: string;
  lastActive: number; // epoch ms
}

const sessions = new Map<string, Session>();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 min
const RATE_LIMIT_MAX = 4;
const rateLimits = new Map<string, { count: number; windowStart: number }>();

/** Clean up old sessions periodically */
function garbageCollect() {
  const now = Date.now();
  sessions.forEach((sess, phone) => {
    if (now - sess.lastActive > SESSION_TTL_MS) {
      sessions.delete(phone);
    }
  });
  rateLimits.forEach((rl, phone) => {
    if (now - rl.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimits.delete(phone);
    }
  });
}

export async function POST(req: NextRequest) {
  garbageCollect();

  // Twilio sends x-www-form-urlencoded. Parse manually.
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);
  const from = params.get('From') || '';
  const body = (params.get('Body') || '').trim();

  const twimlResponse = new twiml.MessagingResponse();

  if (!from) {
    twimlResponse.message('Missing sender information.');
    return xmlResponse(twimlResponse);
  }

  // VIP check
  if (!isVipNumber(from)) {
    twimlResponse.message('This number is not enrolled in SKRBL AI VIP service.');
    return xmlResponse(twimlResponse);
  }

  // Rate limiting (simple token per minute)
  const now = Date.now();
  const rl = rateLimits.get(from) || { count: 0, windowStart: now };
  if (now - rl.windowStart < RATE_LIMIT_WINDOW_MS) {
    rl.count += 1;
    if (rl.count > RATE_LIMIT_MAX) {
      twimlResponse.message('Whoa! Let\'s slow down so I can keep Twilio fees low.');
      return xmlResponse(twimlResponse);
    }
  } else {
    rl.count = 1;
    rl.windowStart = now;
  }
  rateLimits.set(from, rl);

  // Retrieve or create session
  let session = sessions.get(from);
  if (!session) {
    session = { stage: 'init', lastActive: now };
    sessions.set(from, session);
  }
  session.lastActive = now;

  // --- Core conversational flow ---
  switch (session.stage) {
    case 'init': {
      twimlResponse.message('Hi! I\'m Percy 🤖. What\'s your first name?');
      session.stage = 'awaiting_name';
      break;
    }

    case 'awaiting_name': {
      session.name = body.split(' ')[0];
      twimlResponse.message(`Great to meet you, ${session.name}! What business or project are you working on?`);
      session.stage = 'awaiting_business';
      break;
    }

    case 'awaiting_business': {
      session.business = body;
      twimlResponse.message('Awesome. Send me your website or social link and I\'ll scan it for Quick Wins.');
      session.stage = 'awaiting_link';
      break;
    }

    case 'awaiting_link': {
      if (!body.match(/https?:\/\//i)) {
        twimlResponse.message('Please send a valid URL starting with http or https.');
        break;
      }
      // Simulate scan trigger by calling internal API asynchronously – fire & forget
      triggerScan(body, from, session.name);

      twimlResponse.message('Scanning… I\'ll text you back in a moment with tailored Quick Wins!');
      session.stage = 'scanning';
      break;
    }

    case 'scanning': {
      twimlResponse.message('Scan in progress 🛰️. I\'ll update you once done.');
      break;
    }

    case 'suggesting': {
      // Placeholder for accepting task selections
      if (body === '1') {
        twimlResponse.message('Great! Kicking off your Quick Fix now. I\'ll update you when complete.');
      } else if (body === '2') {
        twimlResponse.message('Roger that – preparing full project plan. Expect a proposal shortly.');
      } else {
        twimlResponse.message('Reply 1 for Quick Fix or 2 for Full Project.');
      }
      break;
    }

    default: {
      twimlResponse.message('Sorry, I\'m not sure what to do. Let\'s start over. What\'s your first name?');
      session.stage = 'awaiting_name';
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

// Fire-and-forget scan trigger demo – replace with real scan logic / Percy agent call.
async function triggerScan(url: string, phone: string, name?: string) {
  try {
    // TODO: Call existing Percy scan API and await completion.
    // For now, simulate delay then reply with suggestions.
    setTimeout(async () => {
      const quickWin = 'Remove broken links and compress images for 34% faster load time';
      const fullProject = 'Deploy a personalised AI-powered conversion chatbot across the site';
      await sendSms({
        to: phone,
        body: `Scan complete! Here are suggestions:\n1️⃣ Quick Win – ${quickWin}\n2️⃣ Full Project – ${fullProject}\nReply 1 to start the Quick Win or 2 for the Full Project idea.`,
      });
      // Update session stage so follow-ups route correctly
      const sess = sessions.get(phone);
      if (sess) sess.stage = 'suggesting';
    }, 15000); // simulate 15s scan
  } catch (err) {
    console.error('Scan trigger failed', err);
    await sendSms({ to: phone, body: 'Oops, something went wrong while scanning. Please try again later.' });
  }
}
