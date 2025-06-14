"use client";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export type BannerVariant = "success" | "error" | "info";

interface ActionBannerProps {
  message: string;
  variant?: BannerVariant;
}

export default function ActionBanner({ message, variant = "info" }: ActionBannerProps) {
  const bgClass = {
    success: "bg-emerald-600",
    error: "bg-rose-600",
    info: "bg-sky-600",
  }[variant];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className={`fixed top-0 inset-x-0 z-50 ${bgClass} text-white py-3 shadow-lg`}
          role="status"
          aria-live="polite"
        >
          <p className="text-center font-semibold text-sm sm:text-base px-4">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
