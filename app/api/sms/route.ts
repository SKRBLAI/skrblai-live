// Windsurf: Consolidated SMS Webhook for Percy & Skill Smith [2025-07-02]
// Single Twilio endpoint that intelligently routes messages to the proper agent
// based on session context or intent keywords. Supports VIP whitelist, rate-limit
// and per-agent conversational state.

import { NextRequest, NextResponse } from 'next/server';
import { twiml } from 'twilio';
import { isVipNumber, sendSms } from '@/utils/twilioSms';

// ---------------------------------------------------------------------------
// Shared types / utilities
// ---------------------------------------------------------------------------

type AgentName = 'percy' | 'skillsmith';

type PercyStage = 'init' | 'awaiting_name' | 'awaiting_business' | 'awaiting_link' | 'scanning' | 'suggesting';
interface PercyData { name?: string; business?: string; }

type SmithStage = 'init' | 'awaiting_name' | 'awaiting_goal' | 'processing' | 'suggesting';
interface SmithData { name?: string; goal?: string; }

interface Session {
  agent?: AgentName; // Active agent
  lastActive: number;
  // Agent-specific state
  percy?: { stage: PercyStage } & PercyData;
  skillsmith?: { stage: SmithStage } & SmithData;
}

const sessions = new Map<string, Session>();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 4;
const rateLimits = new Map<string, { count: number; windowStart: number }>();

// Clean up old sessions / rate-limit buckets
function gc() {
  const now = Date.now();
  sessions.forEach((s, phone) => {
    if (now - s.lastActive > SESSION_TTL_MS) sessions.delete(phone);
  });
  rateLimits.forEach((rl, phone) => {
    if (now - rl.windowStart > RATE_LIMIT_WINDOW_MS) rateLimits.delete(phone);
  });
}

// Detect intent keywords to switch agent
function detectAgentKeyword(body: string): AgentName | undefined {
  const text = body.toLowerCase();
  if (/skill\s*smith|sports|fitness|workout/.test(text)) return 'skillsmith';
  if (/percy|business|growth/.test(text)) return 'percy';
  return undefined;
}

// ---------------------------------------------------------------------------
// Percy conversational handler (extracted from previous dedicated route)
// ---------------------------------------------------------------------------
async function handlePercy(body: string, session: Session, phone: string, twimlResp: twiml.MessagingResponse) {
  if (!session.percy) session.percy = { stage: 'init' };
  const s = session.percy;
  switch (s.stage) {
    case 'init':
      twimlResp.message("Hi! I'm Percy 🤖. What's your first name?");
      s.stage = 'awaiting_name';
      break;
    case 'awaiting_name':
      s.name = body.split(' ')[0];
      twimlResp.message(`Great to meet you, ${s.name}! What business or project are you working on?`);
      s.stage = 'awaiting_business';
      break;
    case 'awaiting_business':
      s.business = body;
      twimlResp.message('Awesome. Send me your website or social link and I\'ll scan it for Quick Wins.');
      s.stage = 'awaiting_link';
      break;
    case 'awaiting_link':
      if (!body.match(/https?:\/\//i)) {
        twimlResp.message('Please send a valid URL starting with http or https.');
        break;
      }
      // Trigger scan asynchronously
      triggerScan(body, phone, s.name);
      twimlResp.message('Scanning… I\'ll text you back in a moment with tailored Quick Wins!');
      s.stage = 'scanning';
      break;
    case 'scanning':
      twimlResp.message('Scan in progress 🛰️. I\'ll update you once done.');
      break;
    case 'suggesting':
      if (body === '1') {
        twimlResp.message('Great! Kicking off your Quick Fix now. I\'ll update you when complete.');
      } else if (body === '2') {
        twimlResp.message('Roger that – preparing full project plan. Expect a proposal shortly.');
      } else {
        twimlResp.message('Reply 1 for Quick Fix or 2 for Full Project.');
      }
      break;
    default:
      twimlResp.message('Let\'s start over. What\'s your first name?');
      s.stage = 'awaiting_name';
  }
}

// ---------------------------------------------------------------------------
// Skill Smith handler (excerpt)
// ---------------------------------------------------------------------------
async function handleSkillSmith(body: string, session: Session, phone: string, twimlResp: twiml.MessagingResponse) {
  if (!session.skillsmith) session.skillsmith = { stage: 'init' };
  const s = session.skillsmith;
  switch (s.stage) {
    case 'init':
      twimlResp.message('Hey! I\'m Skill Smith 🏋️‍♂️ – your AI Sports & Fitness trainer. What\'s your first name?');
      s.stage = 'awaiting_name';
      break;
    case 'awaiting_name':
      s.name = body.split(' ')[0];
      twimlResp.message(`Great to meet you, ${s.name}! Tell me your #1 fitness goal or send a workout video link.`);
      s.stage = 'awaiting_goal';
      break;
    case 'awaiting_goal':
      if (body.toLowerCase().includes('quick win')) {
        twimlResp.message('Quick Win incoming! 20 burpees EMOM for 5 minutes. 🔥 Reply "Done" when finished!');
        s.stage = 'processing';
        break;
      }
      if (body.match(/https?:\/\//i)) {
        twimlResp.message('Analyzing your form… I\'ll text you back with feedback shortly!');
        s.stage = 'processing';
        analyzeVideo(body, phone, s.name);
        break;
      }
      s.goal = body;
      twimlResp.message(`Love it! Here’s a 3-step Quick Win plan:\n1️⃣ Warm-up mobility – 5 min\n2️⃣ ${s.goal} focused drill – 10 min\n3️⃣ Cool-down stretch – 5 min\nReply "Quick Win" anytime for a different booster or send a video.`);
      s.stage = 'suggesting';
      break;
    case 'processing':
      twimlResp.message('Working on it… you’ll hear back soon ✅');
      break;
    case 'suggesting':
      if (body.toLowerCase().startsWith('quick')) {
        twimlResp.message('Here’s another Quick Win: 3 sets of 30-second plank holds with 30-second rests. ⏱️');
      } else {
        twimlResp.message('Send a workout video or ask for a nutrition tip for more personalised advice!');
      }
      break;
  }
}

// ---------------------------------------------------------------------------
// Main POST entry – Twilio webhook
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  gc();
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);
  const from = params.get('From') || '';
  const body = (params.get('Body') || '').trim();

  const twimlResp = new twiml.MessagingResponse();

  if (!from) {
    twimlResp.message('Missing sender information.');
    return xml(twimlResp);
  }

  if (!isVipNumber(from)) {
    twimlResp.message('This number is not enrolled in SKRBL AI VIP service.');
    return xml(twimlResp);
  }

  // Rate limiting
  const now = Date.now();
  const rl = rateLimits.get(from) || { count: 0, windowStart: now };
  if (now - rl.windowStart < RATE_LIMIT_WINDOW_MS) {
    rl.count += 1;
    if (rl.count > RATE_LIMIT_MAX) {
      twimlResp.message('Whoa! Let\'s slow down to keep Twilio fees in check.');
      return xml(twimlResp);
    }
  } else {
    rl.count = 1;
    rl.windowStart = now;
  }
  rateLimits.set(from, rl);

  // Retrieve session
  let session = sessions.get(from);
  if (!session) {
    session = { lastActive: now };
    sessions.set(from, session);
  }
  session.lastActive = now;

  // Agent switching keywords override current agent
  const keywordAgent = detectAgentKeyword(body);
  if (keywordAgent) {
    session.agent = keywordAgent;
  }

  // If no agent yet, prompt selection
  if (!session.agent) {
    twimlResp.message('Which agent would you like to speak with: Percy (business) or Skill Smith (sports)?');
    // Set tentative agent if message exactly matches name
    if (body.toLowerCase().includes('percy')) session.agent = 'percy';
    if (body.toLowerCase().includes('skill')) session.agent = 'skillsmith';
    return xml(twimlResp);
  }

  // Route to agent handler
  if (session.agent === 'percy') {
    await handlePercy(body, session, from, twimlResp);
  } else {
    await handleSkillSmith(body, session, from, twimlResp);
  }

  return xml(twimlResp);
}

function xml(res: twiml.MessagingResponse) {
  return new NextResponse(res.toString(), { status: 200, headers: { 'Content-Type': 'text/xml' } });
}

// ---------------------------------------------------------------------------
// Async placeholders – replace with real agent integrations
// ---------------------------------------------------------------------------
async function triggerScan(url: string, phone: string, name?: string) {
  // TODO: call Percy scan API
  setTimeout(async () => {
    await sendSms({
      to: phone,
      body: `Scan complete! Here are tailored Quick Wins and Projects.\n1️⃣ Quick Fix – Compress images for 34% faster load.\n2️⃣ Full Project – Deploy AI chatbot across site. Reply 1 or 2 to continue.`,
    });
    const s = sessions.get(phone);
    if (s?.percy) s.percy.stage = 'suggesting';
  }, 15000);
}

async function analyzeVideo(url: string, phone: string, name?: string) {
  setTimeout(async () => {
    await sendSms({
      to: phone,
      body: `Analysis ready, ${name ?? 'friend'}! 🏋️‍♂️ Your squat depth looks solid, but knees cave slightly. Quick cue: push knees out on descent. Reply "Quick Win" for another tip.`,
    });
    const s = sessions.get(phone);
    if (s?.skillsmith) s.skillsmith.stage = 'suggesting';
  }, 20000);
}
