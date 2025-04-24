'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useRouter } from "next/navigation";

const pricingTiers = [
  {
    name: "Free",
    price: "$0/mo",
    features: [
      "Access to standard agents",
      "Basic workflow logs",
      "Community support"
    ],
    cta: "Current Plan",
    highlight: false
  },
  {
    name: "Premium",
    price: "$29/mo",
    features: [
      "Unlock all premium agents",
      "Advanced workflow automation",
      "Priority support",
      "Early access to new features"
    ],
    cta: "Upgrade Now",
    highlight: true
  }
];

const testimonials = [
  {
    name: "Sarah J.",
    quote: "SKRBL Premium paid for itself in days! The advanced agents are a game-changer.",
  },
  {
    name: "Mike C.",
    quote: "The workflow automation and support are next level. Worth every penny!",
  }
];

export default function UpgradePage() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Simulate Stripe checkout and Firestore role update
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    // Simulate Stripe checkout...
    setTimeout(async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { stripeRole: "premium" });
      }
      setSuccess(true);
      setIsUpgrading(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] py-16 px-4 flex flex-col items-center">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl w-full glass-card p-10 rounded-2xl shadow-2xl mb-10">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">Upgrade to SKRBL Premium</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {pricingTiers.map((tier, idx) => (
            <motion.div key={tier.name} className={`rounded-xl p-8 border-2 ${tier.highlight ? 'border-teal-500 shadow-glow bg-white/10' : 'border-white/10 bg-white/5'} flex flex-col items-center`} initial={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">{tier.name}</h2>
              <div className="text-3xl font-bold mb-4 text-teal-300">{tier.price}</div>
              <ul className="mb-6 text-gray-200">
                {tier.features.map(f => <li key={f} className="mb-1">• {f}</li>)}
              </ul>
              {tier.highlight ? (
                <button
                  className="mt-auto px-6 py-3 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? "Processing..." : tier.cta}
                </button>
              ) : (
                <span className="mt-auto px-6 py-3 rounded-lg border border-white/20 text-gray-400">{tier.cta}</span>
              )}
            </motion.div>
          ))}
        </div>
        {/* Feature Comparison Table */}
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-3 text-teal-300">Compare Plans</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border border-white/10 rounded-xl">
              <thead>
                <tr className="bg-white/10">
                  <th className="py-2 px-4">Feature</th>
                  <th className="py-2 px-4">Free</th>
                  <th className="py-2 px-4">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4">Standard Agents</td>
                  <td className="text-center">✔️</td>
                  <td className="text-center">✔️</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Premium Agents</td>
                  <td className="text-center text-gray-400">—</td>
                  <td className="text-center">✔️</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Workflow Automation</td>
                  <td className="text-center text-gray-400">Limited</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Priority Support</td>
                  <td className="text-center text-gray-400">—</td>
                  <td className="text-center">✔️</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Early Access</td>
                  <td className="text-center text-gray-400">—</td>
                  <td className="text-center">✔️</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Testimonials */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3 text-teal-300">What Our Users Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white/10 border border-white/10 rounded-xl p-6 text-gray-200">
                <div className="mb-2 font-bold">{t.name}</div>
                <div className="italic">“{t.quote}”</div>
              </div>
            ))}
          </div>
        </div>
        {/* Success toast */}
        {success && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-8 right-8 bg-teal-500 text-white px-6 py-4 rounded-xl shadow-xl z-50">
            🎉 Upgrade successful! Welcome to SKRBL Premium.
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
