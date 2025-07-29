"use client";

import { motion } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";

export default function TrendingBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-gray-600"
    >
      <Sparkles className="w-4 h-4" />
      <span>IA 2025</span>
      <TrendingUp className="w-4 h-4" />
    </motion.div>
  );
} 