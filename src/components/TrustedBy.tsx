"use client";

import { motion } from "framer-motion";
import { Building2, Globe, Package, Play, Music, Car } from "lucide-react";

const companies = [
  { name: "Microsoft", icon: Building2 },
  { name: "Google", icon: Globe },
  { name: "Amazon", icon: Package },
  { name: "Netflix", icon: Play },
  { name: "Spotify", icon: Music },
  { name: "Uber", icon: Car },
];

export default function TrustedBy() {
  return (
    <section className="py-16 px-4 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
            Confían en nosotros
          </p>
          <h3 className="text-2xl font-bold text-white">
            Empresas líderes del mundo
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex justify-center"
            >
              <company.icon className="w-12 h-12 text-gray-400 hover:text-white transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
