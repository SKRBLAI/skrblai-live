import PlanCard from "@/components/v2/PlanCard";
import { resolvePriceIdFromSku } from "@/lib/stripe/priceResolver";

export const dynamic = "force-dynamic";

const PLANS = [
  { title: "Sports Starter", sku: "sports_plan_starter", description: "Get started with scan-first sports agents.", price: "$19/mo" },
  { title: "Sports Pro", sku: "sports_plan_pro", description: "Pro features for growing teams.", price: "$49/mo" },
  { title: "Sports Elite", sku: "sports_plan_elite", description: "Elite performance & analytics.", price: "$99/mo" },
  { title: "Business Starter", sku: "biz_plan_starter", description: "Start automating your operations.", price: "$29/mo" },
  { title: "Business Pro", sku: "biz_plan_pro", description: "Advanced automation & insights.", price: "$79/mo" },
  { title: "Business Elite", sku: "biz_plan_elite", description: "Everything at scale.", price: "$149/mo" },
];

export default function PricingPage() {
  const resolved = PLANS.map((p) => ({
    ...p,
    enabled: !!resolvePriceIdFromSku(p.sku).priceId,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold">Choose your plan</h1>
        <p className="mt-2 text-gray-600">Buttons enable only when matching Stripe Price IDs are present.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resolved.map((p) => (
            <PlanCard key={p.sku} title={p.title} description={p.description} price={p.price} sku={p.sku} enabled={p.enabled} />
          ))}
        </div>
      </div>
    </main>
  );
}
