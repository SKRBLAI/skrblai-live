// scripts/seed-stripe-addons.js
// PowerShell:  $env:STRIPE_SECRET_KEY="sk_live_..."; node scripts/seed-stripe-addons.js
// Bash/Zsh:    STRIPE_SECRET_KEY=sk_live_... node scripts/seed-stripe-addons.js
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY || "";
if (!key.startsWith("sk_")) {
  console.error("❌ STRIPE_SECRET_KEY missing/invalid. Set it and rerun.");
  process.exit(1);
}
const stripe = new Stripe(key, { apiVersion: "2022-11-15" });

async function ensureProduct(name, description) {
  const s = await stripe.products.search({ query: `name:'${name.replace(/'/g,"\\'")}'`, limit: 1 });
  return s.data[0] || stripe.products.create({ name, description, active: true });
}
async function ensurePrice(productId, usd) {
  const unit_amount = Math.round(usd * 100);
  const list = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const found = list.data.find(p => p.unit_amount === unit_amount && p.currency === "usd" && !p.recurring);
  return found || stripe.prices.create({ product: productId, unit_amount, currency: "usd" });
}

const sports = [
  { name: "Sports Add-On: AI Video Analysis", env: "NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO", amount: 29 },
  { name: "Sports Add-On: Mastery of Emotion (MOE)", env: "NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION", amount: 39 },
  { name: "Sports Add-On: Sports Nutrition Guide", env: "NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION", amount: 19 },
  { name: "Sports Add-On: Foundation Training Pack", env: "NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION", amount: 49 },
];

(async () => {
  console.log(`🔑 Using Stripe key: ${key.startsWith("sk_live_") ? "LIVE" : "TEST"}`);
  const out = [];
  for (const a of sports) {
    console.log(`\nProcessing ${a.name} ($${a.amount})`);
    const product = await ensureProduct(a.name, a.name);
    const price   = await ensurePrice(product.id, a.amount);
    console.log(`🆔 product=${product.id}  💰 price=${price.id}`);
    out.push({ env: a.env, id: price.id });
  }
  console.log("\n=== ENV → paste into Railway & .env.local ===");
  out.forEach(r => console.log(`${r.env}=${r.id}`));
  console.log("✅ Done.");
})().catch(e => { console.error("❌ Seeding failed:", e); process.exit(1); });
