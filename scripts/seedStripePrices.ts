import * as fs from "fs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

async function upsertOneTime(lookup_key: string, name: string, usd: number) {
  console.log(`🔍 Checking for existing price with lookup_key: ${lookup_key}`);
  const existing = await stripe.prices.list({ lookup_keys: [lookup_key], active: true, limit: 1 });
  
  if (existing.data[0]) {
    console.log(`✅ Found existing price: ${existing.data[0].id} for ${lookup_key}`);
    return existing.data[0];
  }
  
  console.log(`🆕 Creating new product and price for: ${name}`);
  const product = await stripe.products.create({ 
    name, 
    active: true,
    metadata: {
      category: "skillsmith",
      type: "one_time"
    }
  });
  
  const price = await stripe.prices.create({
    currency: "usd",
    unit_amount: Math.round(usd * 100),
    product: product.id,
    lookup_key,
    metadata: {
      category: "skillsmith",
      type: "one_time",
      usd_amount: usd.toString()
    }
  });
  
  console.log(`✨ Created price: ${price.id} for ${lookup_key}`);
  return price;
}

async function upsertYearly(lookup_key: string, name: string, usd: number) {
  console.log(`🔍 Checking for existing yearly price with lookup_key: ${lookup_key}`);
  const existing = await stripe.prices.list({ lookup_keys: [lookup_key], active: true, limit: 1 });
  
  if (existing.data[0]) {
    console.log(`✅ Found existing yearly price: ${existing.data[0].id} for ${lookup_key}`);
    return existing.data[0];
  }
  
  console.log(`🆕 Creating new yearly product and price for: ${name}`);
  const product = await stripe.products.create({ 
    name, 
    active: true,
    metadata: {
      category: "skillsmith",
      type: "yearly_subscription"
    }
  });
  
  const price = await stripe.prices.create({
    currency: "usd",
    unit_amount: Math.round(usd * 100),
    product: product.id,
    recurring: { interval: "year" },
    lookup_key,
    metadata: {
      category: "skillsmith",
      type: "yearly_subscription",
      usd_amount: usd.toString()
    }
  });
  
  console.log(`✨ Created yearly price: ${price.id} for ${lookup_key}`);
  return price;
}

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("❌ Missing STRIPE_SECRET_KEY environment variable");
  }
  
  console.log("🚀 Starting SkillSmith Stripe price seeding...");
  console.log(`🔑 Using Stripe secret key: ${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...`);

  try {
    // Core bundles
    console.log("\n📦 Creating core SkillSmith bundles...");
    const rookie  = await upsertOneTime("skillsmith_rookie_3scans_1qw", "SkillSmith – Rookie (3 scans + 1 Quick Win)", 5);
    const pro     = await upsertOneTime("skillsmith_pro_10scans_2qw",   "SkillSmith – Pro (10 scans + 2 Quick Wins)", 25);
    const allstar = await upsertOneTime("skillsmith_allstar_bundle",    "SkillSmith – All-Star (15 scans + product + ebook)", 67);
    const yearly  = await upsertYearly("skillsmith_yearly_149",         "SkillSmith – Yearly Plan", 149);

    // Specialty products
    console.log("\n🎯 Creating specialty products...");
    const p19 = await upsertOneTime("skillsmith_progress_tracker_premium_19",   "Progress Tracker Premium (incl. 5 scans + 1 Quick Win)", 19);
    const p29 = await upsertOneTime("skillsmith_form_analysis_pro_29",          "Form Analysis Pro (incl. 5 scans + 1 Quick Win)", 29);
    const p39 = await upsertOneTime("skillsmith_custom_training_plan_39",       "Custom Training Plan (incl. 5 scans + 1 Quick Win)", 39);
    const p49 = await upsertOneTime("skillsmith_performance_insights_elite_49", "Performance Insights Elite (incl. 5 scans + 1 Quick Win)", 49);

    const priceMap = {
      rookie:  { lookup_key: "skillsmith_rookie_3scans_1qw",             price_id: rookie.id, amount: 5 },
      pro:     { lookup_key: "skillsmith_pro_10scans_2qw",               price_id: pro.id, amount: 25 },
      allstar: { lookup_key: "skillsmith_allstar_bundle",                price_id: allstar.id, amount: 67 },
      yearly:  { lookup_key: "skillsmith_yearly_149",                    price_id: yearly.id, amount: 149 },
      p19:     { lookup_key: "skillsmith_progress_tracker_premium_19",   price_id: p19.id, amount: 19 },
      p29:     { lookup_key: "skillsmith_form_analysis_pro_29",          price_id: p29.id, amount: 29 },
      p39:     { lookup_key: "skillsmith_custom_training_plan_39",       price_id: p39.id, amount: 39 },
      p49:     { lookup_key: "skillsmith_performance_insights_elite_49", price_id: p49.id, amount: 49 },
    };

    console.log("\n📝 Writing price map to lib/config/skillsmithPriceMap.json...");
    fs.mkdirSync("lib/config", { recursive: true });
    fs.writeFileSync("lib/config/skillsmithPriceMap.json", JSON.stringify(priceMap, null, 2));
    
    console.log("✅ Successfully wrote lib/config/skillsmithPriceMap.json");
    console.log("\n🎉 SkillSmith price seeding completed successfully!");
    console.log("\nPrice Map Summary:");
    Object.entries(priceMap).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.price_id} ($${value.amount})`);
    });

  } catch (error) {
    console.error("❌ Error during price seeding:", error);
    throw error;
  }
}

main().catch(err => { 
  console.error("💥 Fatal error:", err); 
  process.exit(1); 
});
