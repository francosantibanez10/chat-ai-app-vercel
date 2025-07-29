"use client";

import { motion } from "framer-motion";
import { Crown, Code, Zap, Shield, Database, Globe, Clock, Users } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const apiFeatures = [
  {
    icon: Code,
    title: "RESTful API",
    description: "API REST completa con endpoints bien documentados y ejemplos de código.",
    code: `curl -X POST https://api.rubi.ai/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, world!"}'`
  },
  {
    icon: Zap,
    title: "WebSocket Support",
    description: "Conexiones en tiempo real para streaming de respuestas.",
    code: `const ws = new WebSocket('wss://api.rubi.ai/v1/stream');
ws.onmessage = (event) => {
  console.log('Response:', event.data);
};`
  },
  {
    icon: Shield,
    title: "Autenticación Segura",
    description: "API keys con permisos granulares y rate limiting.",
    code: `Authorization: Bearer sk-1234567890abcdef
X-Rate-Limit-Limit: 1000
X-Rate-Limit-Remaining: 999`
  },
  {
    icon: Database,
    title: "Múltiples Modelos",
    description: "Acceso a GPT-4o, GPT-4 Turbo y modelos especializados.",
    code: `{
  "model": "gpt-4o",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "temperature": 0.7
}`
  }
];

const endpoints = [
  {
    method: "POST",
    path: "/v1/chat",
    description: "Enviar mensaje y recibir respuesta",
    params: ["message", "model", "temperature"]
  },
  {
    method: "POST",
    path: "/v1/chat/stream",
    description: "Streaming de respuestas en tiempo real",
    params: ["message", "model", "stream"]
  },
  {
    method: "POST",
    path: "/v1/files/upload",
    description: "Subir archivos para análisis",
    params: ["file", "type", "metadata"]
  },
  {
    method: "POST",
    path: "/v1/vision",
    description: "Análisis de imágenes con IA",
    params: ["image", "prompt", "model"]
  },
  {
    method: "GET",
    path: "/v1/models",
    description: "Listar modelos disponibles",
    params: []
  },
  {
    method: "GET",
    path: "/v1/usage",
    description: "Obtener estadísticas de uso",
    params: ["start_date", "end_date"]
  }
];

const sdks = [
  {
    name: "JavaScript/TypeScript",
    code: `npm install @rubi-ai/sdk

import { RubiAI } from '@rubi-ai/sdk';

const rubi = new RubiAI('your-api-key');

const response = await rubi.chat({
  message: 'Hello, world!',
  model: 'gpt-4o'
});`
  },
  {
    name: "Python",
    code: `pip install rubi-ai

import rubi_ai

client = rubi_ai.Client('your-api-key')

response = client.chat(
    message="Hello, world!",
    model="gpt-4o"
)`
  },
  {
    name: "cURL",
    code: `curl -X POST https://api.rubi.ai/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, world!",
    "model": "gpt-4o"
  }'`
  }
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      <div className="relative z-10">
        {/* Header */}
        <header className="py-8 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-gray-300" />
                <span className="text-2xl font-bold text-white">Rubi</span>
              </div>
              <a
                href="/"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                ← Volver al inicio
              </a>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              API Documentation
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Integra Rubi en tus aplicaciones con nuestra API RESTful completa y bien documentada.
            </motion.p>
          </div>
        </section>

        {/* API Features */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Características de la API</h2>
              <p className="text-xl text-gray-400">Todo lo que necesitas para integrar Rubi en tu aplicación</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {apiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-600">
                    <feature.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 mb-6">{feature.description}</p>
                  <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
                    <code>{feature.code}</code>
                  </pre>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Endpoints Principales</h2>
              <p className="text-xl text-gray-400">Explora todos los endpoints disponibles</p>
            </motion.div>

            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <motion.div
                  key={endpoint.path}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-effect rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        endpoint.method === 'GET' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-white font-mono">{endpoint.path}</code>
                    </div>
                  </div>
                  <p className="text-gray-400 mb-3">{endpoint.description}</p>
                  {endpoint.params.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {endpoint.params.map((param) => (
                        <span key={param} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                          {param}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SDKs */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">SDKs Oficiales</h2>
              <p className="text-xl text-gray-400">Integra Rubi fácilmente con nuestros SDKs oficiales</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {sdks.map((sdk, index) => (
                <motion.div
                  key={sdk.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="glass-effect rounded-2xl p-8 border border-gray-700/50"
                >
                  <h3 className="text-xl font-bold text-white mb-6">{sdk.name}</h3>
                  <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
                    <code>{sdk.code}</code>
                  </pre>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">¿Listo para integrar?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Obtén tu API key y comienza a integrar Rubi en tu aplicación
              </p>
              <motion.a
                href="/register"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-700"
              >
                Obtener API Key
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 