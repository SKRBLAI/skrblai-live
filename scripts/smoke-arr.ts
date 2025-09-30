/* eslint-disable no-console */
async function main() {
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/analytics/arr`).then(r => r.json());
  console.log("ARR check →", res);
}
main().catch(err => { console.error(err); process.exit(1); });