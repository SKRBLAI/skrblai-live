#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

const base = process.env.PROBES_BASE_URL || 'http://localhost:3000';
const targets = [
  '/api/_probe/v2/env',
  '/api/_probe/v2/supabase',
  '/api/_probe/v2/stripe',
  '/api/_probe/v2/auth',
];

async function run() {
  const tstamp = ts();
  const outDir = path.join(process.cwd(), 'analysis', 'probes', tstamp, process.env.PROBE_ENV || 'local');
  fs.mkdirSync(outDir, { recursive: true });
  const report = {};

  for (const rel of targets) {
    const url = `${base}${rel}`;
    try {
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));
      report[rel] = { status: res.status, body: json };
      fs.writeFileSync(path.join(outDir, rel.replaceAll('/', '_') + '.json'), JSON.stringify(report[rel], null, 2));
    } catch (e) {
      report[rel] = { status: 0, error: e?.message || 'fetch-error' };
    }
  }

  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(report, null, 2));
  console.log(`Probe results written to ${outDir}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
