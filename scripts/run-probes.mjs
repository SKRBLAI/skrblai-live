#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const PROD_BASE = process.env.PROD_BASE || 'https://skrblai.io';

const endpoints = [
  '/api/_probe/env',
  '/api/_probe/supabase',
  '/api/_probe/stripe',
  '/api/_probe/auth',
  '/api/_probe/flags',
];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function hit(base, route) {
  const url = base.replace(/\/$/, '') + route;
  const res = await fetch(url, { method: 'GET', headers: { 'cache-control': 'no-store' } });
  const text = await res.text();
  try {
    return { ok: true, status: res.status, json: JSON.parse(text) };
  } catch {
    return { ok: true, status: res.status, body: text };
  }
}

async function safeHit(base, route) {
  try {
    return await hit(base, route);
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' +
    pad(d.getHours()) + '-' + pad(d.getMinutes()) + '-' + pad(d.getSeconds())
  );
}

async function main() {
  const iso = stamp();
  const outBase = path.join(__dirname, '..', 'analysis', 'probes', iso);
  const localDir = path.join(outBase, 'local');
  const prodDir = path.join(outBase, 'prod');
  ensureDir(localDir);
  ensureDir(prodDir);

  const localResults = await Promise.all(endpoints.map(ep => safeHit(LOCAL_BASE, ep)));
  const prodResults = await Promise.all(endpoints.map(ep => safeHit(PROD_BASE, ep)));

  for (let i = 0; i < endpoints.length; i++) {
    const name = endpoints[i].split('/').filter(Boolean).slice(-1)[0];
    const localPath = path.join(localDir, `${name}.json`);
    const prodPath = path.join(prodDir, `${name}.json`);

    fs.writeFileSync(localPath, JSON.stringify(localResults[i], null, 2));
    fs.writeFileSync(prodPath, JSON.stringify(prodResults[i], null, 2));
  }

  console.log('Wrote probe artifacts to', path.relative(process.cwd(), outBase));
}

main().catch(err => {
  console.error('Probe runner failed:', err);
  process.exit(1);
});
