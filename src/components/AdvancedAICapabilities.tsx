import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Code, 
  Globe, 
  Zap, 
  Shield, 
  Languages, 
  Plug, 
  Lightbulb,
  TrendingUp,
  Settings
} from 'lucide-react';

interface Capability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'learning';
  usage: number;
  successRate: number;
  lastUsed?: Date;
}

interface AdvancedAICapabilitiesProps {
  className?: string;
}

export default function AdvancedAICapabilities({ className = "" }: AdvancedAICapabilitiesProps) {
  const [capabilities, setCapabilities] = useState<Capability[]>([
    {
      id: 'adaptive-learning',
      name: 'Aprendizaje Adaptativo',
      description: 'La IA aprende y mejora automáticamente basándose en feedback y patrones de uso',
      icon: <Brain className="w-6 h-6" />,
      status: 'active',
      usage: 0,
      successRate: 0.85
    },
    {
      id: 'code-execution',
      name: 'Ejecución de Código',
      description: 'Ejecuta código Python, JavaScript, SQL y Bash en sandbox seguro',
      icon: <Code className="w-6 h-6" />,
      status: 'active',
      usage: 0,
      successRate: 0.92
    },
    {
      id: 'multilingual',
      name: 'Multilingüe',
      description: 'Detección automática de idioma y adaptación de tono',
      icon: <Languages className="w-6 h-6" />,
      status: 'active',
      usage: 0,
      successRate: 0.88
    },
    {
      id: 'plugins',
      name: 'Sistema de Plugins',
      description: 'Integración con APIs externas y herramientas especializadas',
      icon: <Plug className="w-6 h-6" />,
      status: 'active',
      usage: 0,
      successRate: 0.78
    },
    {
      id: 'semantic-memory',
      name: 'Memoria Semántica',
      description: 'Memoria a largo plazo con búsqueda semántica inteligente',
      icon: <Lightbulb className="w-6 h-6" />,
      status: 'active',
      usage: 0,
      successRate: 0.91
    },
    {
      id: 'security',
      name: 'Seguridad Avanzada',
      description: 'Detección de abuso, spam y protección de datos',
      icon: <Shield className="w-6 h-6" />,
      status: 'active',
      usage: 0,
      successRate: 0.95
    }
  ]);

  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);

  useEffect(() => {
    // Simular datos en tiempo real
    const interval = setInterval(() => {
      setCapabilities(prev => prev.map(cap => ({
        ...cap,
        usage: cap.usage + Math.floor(Math.random() * 3),
        successRate: Math.max(0.7, Math.min(0.98, cap.successRate + (Math.random() - 0.5) * 0.02))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-red-400';
      case 'learning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'learning': return 'Aprendiendo';
      default: return 'Desconocido';
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          Capacidades Avanzadas de IA
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Settings className="w-4 h-4" />
          <span>Configuración Automática</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {capabilities.map((capability) => (
          <div
            key={capability.id}
            className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-750 border ${
              selectedCapability === capability.id 
                ? 'border-blue-500 bg-gray-750' 
                : 'border-gray-700'
            }`}
            onClick={() => setSelectedCapability(
              selectedCapability === capability.id ? null : capability.id
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-blue-400">
                  {capability.icon}
                </div>
                <div>
                  <h4 className="font-medium text-white">{capability.name}</h4>
                  <p className="text-sm text-gray-400">{capability.description}</p>
                </div>
              </div>
              <div className={`text-xs font-medium ${getStatusColor(capability.status)}`}>
                {getStatusText(capability.status)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Uso:</span>
                <span className="text-white">{capability.usage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Éxito:</span>
                <span className="text-green-400">
                  {(capability.successRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {selectedCapability === capability.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Último uso:</span>
                    <span className="text-white">
                      {capability.lastUsed 
                        ? new Date(capability.lastUsed).toLocaleDateString()
                        : 'Nunca'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <span className={`${getStatusColor(capability.status)}`}>
                      {getStatusText(capability.status)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Rendimiento General
          </h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {capabilities.length}
            </div>
            <div className="text-sm text-gray-400">Capacidades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {capabilities.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-400">Activas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {capabilities.reduce((sum, c) => sum + c.usage, 0)}
            </div>
            <div className="text-sm text-gray-400">Usos Totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {(capabilities.reduce((sum, c) => sum + c.successRate, 0) / capabilities.length * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Éxito Promedio</div>
          </div>
        </div>
      </div>
    </div>
  );
} 