"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FloatingCTA() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="fixed bottom-6 left-6 z-50 md:hidden"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/register")}
        className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-full font-semibold shadow-2xl flex items-center space-x-2 text-sm border border-gray-700"
      >
        <span>Comenzar gratis</span>
        <ArrowUp className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
