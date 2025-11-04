#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const AUDIT_MD_PATH = path.join(ROOT, 'docs', 'FEATURE_FLAGS_AUDIT.md');
const AUDIT_JSON_PATH = path.join(ROOT, 'docs', 'FEATURE_FLAGS_AUDIT.json');

const IGNORE_DIRS = new Set([
  '.git',
  '.next',
  'node_modules',
  'dist',
  'out',
  'build',
  'coverage',
  '.turbo',
  'tmp',
  'public',
  'docs',
  'analysis',
  '.cursor',
  'mcp-server',
]);

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.sql',
  '.ps1',
  '.sh',
  '.cjs',
  '.mts',
  '.cts',
  '.txt',
]);

const STRING_FLAG_HINTS = new Set([
  'FF_SITE_VERSION',
  'NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT',
  'NEXT_PUBLIC_PRICE_MAP_JSON',
]);

const EXTRA_KEYS = new Set([
  'FF_USE_BOOST_FOR_AUTH',
  'NEXT_PUBLIC_SUPABASE_URL_BOOST',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST',
  'SUPABASE_SERVICE_ROLE_KEY_BOOST',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
]);

const ENV_ACCESS_REGEX = /process\.env(?:\??\.)?(?:\[['"])?([A-Z0-9_]+)(?:['"])?/g;
const FLAG_LITERAL_REGEX = /['"]((?:FF|NEXT_PUBLIC_FF|NEXT_PUBLIC_ENABLE|NEXT_PUBLIC_USE|NEXT_PUBLIC_SHOW|NEXT_PUBLIC_HP|NEXT_PUBLIC_AI|NEXT_PUBLIC_ENHANCED|NEXT_PUBLIC_URGENCY|NEXT_PUBLIC_LIVE|NEXT_PUBLIC_PERCY|NEXT_PUBLIC_CLERK|NEXT_PUBLIC_SUPABASE|ENABLE)_[A-Z0-9_]+)['"]/g;
const BARE_FLAG_REGEX = /\b((?:FF|NEXT_PUBLIC_FF|NEXT_PUBLIC_ENABLE|NEXT_PUBLIC_USE|NEXT_PUBLIC_SHOW|NEXT_PUBLIC_HP|NEXT_PUBLIC_AI|NEXT_PUBLIC_ENHANCED|NEXT_PUBLIC_URGENCY|NEXT_PUBLIC_LIVE|NEXT_PUBLIC_PERCY|NEXT_PUBLIC_CLERK|NEXT_PUBLIC_SUPABASE|ENABLE)_[A-Z0-9_]+)\b/g;

const registry = new Map();
const lastTouchedCache = new Map();

function isFlagKey(key) {
  if (!key) return false;
  if (EXTRA_KEYS.has(key)) return true;
  if (/^FF_[A-Z0-9_]+$/.test(key)) return true;
  if (/^NEXT_PUBLIC_(?:FF|ENABLE|USE|SHOW|HP|AI|ENHANCED|URGENCY|LIVE|PERCY|CLERK|SUPABASE)_[A-Z0-9_]+$/.test(key)) return true;
  if (/^ENABLE_[A-Z0-9_]+$/.test(key)) return true;
  return false;
}

function normalizePath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

async function walk(dir, collector) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, collector);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!TEXT_EXTENSIONS.has(ext) && ext !== '') continue;
      await collector(fullPath);
    }
  }
}

function analyzeLine(line, file, lineNumber) {
  const keys = new Set();

  let match;
  ENV_ACCESS_REGEX.lastIndex = 0;
  while ((match = ENV_ACCESS_REGEX.exec(line)) !== null) {
    const key = match[1];
    if (isFlagKey(key)) {
      keys.add(key);
    }
  }

  FLAG_LITERAL_REGEX.lastIndex = 0;
  while ((match = FLAG_LITERAL_REGEX.exec(line)) !== null) {
    const key = match[1];
    if (isFlagKey(key)) {
      keys.add(key);
    }
  }

  if (line.includes('process.env')) {
    const candidates = line.match(/[A-Z][A-Z0-9_]+/g) ?? [];
    for (const candidate of candidates) {
      if (isFlagKey(candidate)) {
        keys.add(candidate);
      }
    }
  }

  BARE_FLAG_REGEX.lastIndex = 0;
  while ((match = BARE_FLAG_REGEX.exec(line)) !== null) {
    const key = match[1];
    if (isFlagKey(key)) {
      keys.add(key);
    }
  }

  for (const key of keys) {
    registerFlag(key, file, lineNumber, line);
  }
}

function registerFlag(key, file, lineNumber, line) {
  if (!registry.has(key)) {
    registry.set(key, {
      key,
      seen: 0,
      usedIn: new Set(),
      contexts: [],
      defaults: new Set(),
      boolIndicators: 0,
      stringIndicators: 0,
      conditional: false,
    });
  }

  const entry = registry.get(key);
  entry.seen += 1;
  entry.usedIn.add(file);
  entry.contexts.push({ file, line: lineNumber, snippet: line.trim() });

  const defaultMatch = line.match(/(?:\?\?|\|\|)\s*(?:['"]([^'"\\]+)['"]|(true|false|1|0))/i);
  if (defaultMatch) {
    const [, text, boolLiteral] = defaultMatch;
    entry.defaults.add(text ?? boolLiteral ?? '');
  }

  if (/(===|!==|==|!=)\s*['"]?(?:1|0|true|false)['"]?/i.test(line)) {
    entry.boolIndicators += 1;
  }

  if (/(legacy|new|split)/i.test(line)) {
    entry.stringIndicators += 1;
  }

  if (/(\bif\s*\(|\?|&&|\|\|)/.test(line)) {
    entry.conditional = true;
  }
}

async function analyzeFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  if (content.includes('\u0000')) return;

  const relativePath = normalizePath(filePath);
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    analyzeLine(lines[index], relativePath, index + 1);
  }
}

function guessOwner(key, files) {
  if (/STRIPE|PAY|CHECKOUT|PRICE/i.test(key) || files.some((f) => f.includes('/stripe/'))) {
    return 'payments';
  }
  if (/CLERK/i.test(key) || files.some((f) => f.includes('clerk'))) {
    return 'auth-clerk';
  }
  if (/BOOST|SUPABASE/i.test(key) || files.some((f) => f.includes('supabase'))) {
    return 'auth-boost';
  }
  if (/N8N|WEBHOOK/i.test(key) || files.some((f) => f.includes('n8n'))) {
    return 'automation';
  }
  if (/PERCY|ORBIT/i.test(key) || files.some((f) => f.includes('percy'))) {
    return 'experience';
  }
  if (/BUNDLE|LEGACY|SITE_VERSION/i.test(key) || files.some((f) => f.includes('middleware'))) {
    return 'platform';
  }
  if (/HP_|AI_AUTOMATION|URGENCY|LIVE_METRICS/i.test(key) || files.some((f) => f.includes('home'))) {
    return 'growth';
  }
  return 'core';
}

function guessControls(key, files) {
  if (/SITE_VERSION/i.test(key)) return 'Site shell routing';
  if (/BOOST/i.test(key)) return 'Boost Supabase auth';
  if (/CLERK/i.test(key)) return 'Clerk auth integration';
  if (/STRIPE|PAY|CHECKOUT/i.test(key)) return 'Stripe checkout flows';
  if (/N8N/i.test(key)) return 'n8n automations';
  if (/BUNDLE/i.test(key)) return 'Legacy bundle routes';
  if (/PERCY/i.test(key)) return 'Percy UI components';
  if (/ORBIT/i.test(key)) return 'Orbit visualization';
  if (/HP_|AI_AUTOMATION/i.test(key)) return 'Homepage hero modules';
  if (/URGENCY|LIVE_METRICS/i.test(key)) return 'Marketing urgency widgets';
  if (/ENABLE_LEGACY/i.test(key)) return 'Legacy UI guardrails';
  return files.length ? `Referenced in ${files[0]}` : 'Unknown';
}

function getLastTouched(file) {
  if (lastTouchedCache.has(file)) {
    return lastTouchedCache.get(file);
  }

  try {
    const result = execSync(`git log -1 --format=%cI -- "${file}"`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    lastTouchedCache.set(file, result || null);
    return result || null;
  } catch {
    lastTouchedCache.set(file, null);
    return null;
  }
}

function deriveType(entry) {
  if (STRING_FLAG_HINTS.has(entry.key)) return 'string';
  if (entry.boolIndicators > entry.stringIndicators) return 'boolean';
  if (entry.stringIndicators > entry.boolIndicators) return 'string';
  if (entry.defaults.size > 0) {
    const defaultValue = Array.from(entry.defaults)[0];
    if (defaultValue && /^(1|0|true|false)$/i.test(defaultValue)) {
      return 'boolean';
    }
    if (defaultValue && /(legacy|new|split)/i.test(defaultValue)) {
      return 'string';
    }
  }
  if (/^NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT$/.test(entry.key)) return 'string';
  if (/^NEXT_PUBLIC_(?:SUPABASE|CLERK)_/.test(entry.key)) return 'string';
  return 'boolean';
}

function buildNotes(entry) {
  const snippets = entry.contexts.slice(0, 2).map((ctx) => ctx.snippet).join(' | ');
  const defaults = Array.from(entry.defaults).filter(Boolean).join(', ');
  const parts = [];
  if (defaults) parts.push(`defaults: ${defaults}`);
  if (entry.conditional) parts.push('conditional usage');
  if (snippets) parts.push(`ctx: ${snippets.substring(0, 140)}`);
  return parts.join(' • ');
}

function computeRemoveCandidate(entry, danger) {
  if (danger) return 'no';
  if (entry.usedIn.size > 1) return 'no';
  if (entry.conditional) return 'no';
  if (/LEGACY|ORBIT|BUNDLE/i.test(entry.key)) return 'yes';
  return 'no';
}

function toFlagRecord(entry) {
  const files = Array.from(entry.usedIn).sort();
  const type = deriveType(entry);
  const danger = /AUTH|PAY|STRIPE|CHECKOUT|CLERK|BOOST|PAYMENT/i.test(entry.key);
  const owner = guessOwner(entry.key, files);
  const controls = guessControls(entry.key, files);
  const lastTouched = files.length ? getLastTouched(files[0]) : null;
  const removeCandidate = computeRemoveCandidate(entry, danger);
  const notes = buildNotes(entry);
  const defaults = Array.from(entry.defaults);

  return {
    key: entry.key,
    default: defaults[0] ?? '',
    type,
    public: entry.key.startsWith('NEXT_PUBLIC_'),
    used_in: files,
    used_in_count: files.length,
    controls,
    owner_guess: owner,
    last_touched: lastTouched,
    remove_candidate: removeCandidate,
    notes,
    seen: entry.seen,
    danger,
    conditional: entry.conditional,
    shadowGroup: entry.key.replace(/^NEXT_PUBLIC_/, ''),
  };
}

function escapeCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, '<br>');
}

function computeCounts(flags) {
  const total = flags.length;
  const active = flags.filter((flag) => flag.conditional || flag.seen > 1 || /1|true/.test(flag.default)).length;
  const danger = flags.filter((flag) => flag.danger).length;

  const groups = new Map();
  for (const flag of flags) {
    const key = flag.shadowGroup;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  let shadow = 0;
  for (const [, count] of groups) {
    if (count > 1) shadow += 1;
  }

  const unused = Math.max(total - active, 0);

  return { total, active, unused, danger, shadow };
}

function renderMarkdown(flags, counts, generatedAt) {
  const summary = [
    `- Total flags: **${counts.total}**`,
    `- Active guards: **${counts.active}**`,
    `- Unused/low-signal: **${counts.unused}**`,
    `- Auth/Payment sensitive: **${counts.danger}**`,
    `- Shadow/duplicate groups: **${counts.shadow}**`,
  ].join('\n');

  const header = ['Key', 'Type', 'Default', 'Public', 'Used In', 'Controls', 'Owner', 'Last Touched', 'Remove?', 'Notes'];
  const rows = flags
    .map((flag) => {
      const usedIn = flag.used_in.slice(0, 5).join('<br>') + (flag.used_in.length > 5 ? '<br>…' : '');
      return [
        escapeCell(flag.key),
        escapeCell(flag.type),
        escapeCell(flag.default || ''),
        flag.public ? 'yes' : 'no',
        escapeCell(usedIn),
        escapeCell(flag.controls),
        escapeCell(flag.owner_guess),
        escapeCell(flag.last_touched ?? 'n/a'),
        escapeCell(flag.remove_candidate),
        escapeCell(flag.notes),
      ].join(' | ');
    })
    .join('\n');

  return `# Feature Flags Audit\n\nGenerated: ${generatedAt}\n\n${summary}\n\n| ${header.join(' | ')} |\n| ${header.map(() => '---').join(' | ')} |\n${rows}\n`;
}

async function writeOutputs(flags, counts, generatedAt) {
  const markdown = renderMarkdown(flags, counts, generatedAt);
  await fs.mkdir(path.dirname(AUDIT_MD_PATH), { recursive: true });
  await fs.writeFile(AUDIT_MD_PATH, markdown, 'utf8');

  const payload = {
    generatedAt,
    counts,
    flags,
  };

  await fs.writeFile(AUDIT_JSON_PATH, JSON.stringify(payload, null, 2), 'utf8');
}

async function main() {
  await walk(ROOT, analyzeFile);

  const flags = Array.from(registry.values()).map(toFlagRecord).sort((a, b) => a.key.localeCompare(b.key));
  const counts = computeCounts(flags);
  const generatedAt = new Date().toISOString();

  const tableData = flags.map((flag) => ({
    key: flag.key,
    seen: flag.seen,
    used_in_count: flag.used_in_count,
    public: flag.public,
    type: flag.type,
  }));

  console.table(tableData);

  await writeOutputs(flags, counts, generatedAt);

  console.log(`\nAudit complete. Markdown → ${path.relative(ROOT, AUDIT_MD_PATH)} | JSON → ${path.relative(ROOT, AUDIT_JSON_PATH)}`);
}

main().catch((error) => {
  console.error('[audit-feature-flags] Failed:', error);
  process.exitCode = 1;
});
