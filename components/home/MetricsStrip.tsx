"use client";

import { motion } from "framer-motion";

export default function MetricsStrip() {
  const metrics = [
    { label: "Businesses Automated", value: "2,500+" },
    { label: "Hours Saved Daily", value: "10,000+" },
    { label: "Athletes Coached", value: "5,000+" },
    { label: "Success Rate", value: "94%" },
  ];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                {metric.value}
              </div>
              <div className="text-sm text-white/70">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
