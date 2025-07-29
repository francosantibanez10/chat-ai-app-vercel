"use client";

import { useState, useEffect } from "react";
import { 
  Brain, 
  Database, 
  User, 
  Settings, 
  Wrench, 
  TrendingUp, 
  Activity,
  Zap,
  Target,
  BarChart3
} from "lucide-react";
import AdvancedAICapabilities from "./AdvancedAICapabilities";

interface DashboardStats {
  responseOptimizer: {
    totalOptimizations: number;
    averageQuality: number;
    optimizationRate: number;
  };
  semanticMemory: {
    totalMemories: number;
    averageRelevance: number;
    memoryHitRate: number;
  };
  personalization: {
    totalProfiles: number;
    averageInteractions: number;
    personalizationRate: number;
  };
  contextOptimizer: {
    totalConversations: number;
    averageTokensSaved: number;
    optimizationEfficiency: number;
  };
  toolsOrchestrator: {
    totalTools: number;
    totalToolCalls: number;
    successRate: number;
  };
}

export default function AdvancedAIDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    responseOptimizer: {
      totalOptimizations: 0,
      averageQuality: 0,
      optimizationRate: 0,
    },
    semanticMemory: { totalMemories: 0, averageRelevance: 0, memoryHitRate: 0 },
    personalization: {
      totalProfiles: 0,
      averageInteractions: 0,
      personalizationRate: 0,
    },
    contextOptimizer: {
      totalConversations: 0,
      averageTokensSaved: 0,
      optimizationEfficiency: 0,
    },
    toolsOrchestrator: { totalTools: 0, totalToolCalls: 0, successRate: 0 },
  });

  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    // Simular datos de estadísticas (en producción, estos vendrían de APIs reales)
    const mockStats: DashboardStats = {
      responseOptimizer: {
        totalOptimizations: 1247,
        averageQuality: 0.87,
        optimizationRate: 0.23,
      },
      semanticMemory: {
        totalMemories: 8923,
        averageRelevance: 0.76,
        memoryHitRate: 0.34,
      },
      personalization: {
        totalProfiles: 156,
        averageInteractions: 23.4,
        personalizationRate: 0.91,
      },
      contextOptimizer: {
        totalConversations: 445,
        averageTokensSaved: 1250,
        optimizationEfficiency: 0.78,
      },
      toolsOrchestrator: {
        totalTools: 4,
        totalToolCalls: 567,
        successRate: 0.94,
      },
    };

    setStats(mockStats);
  }, []);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
    trend = null,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color?: string;
    trend?: { value: number; isPositive: boolean } | null;
  }) => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg bg-${color}-500/20 border border-${color}-500/30`}
        >
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 text-sm ${
              trend.isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
    </div>
  );

  const ProgressBar = ({
    value,
    max = 1,
    label,
    color = "blue",
  }: {
    value: number;
    max?: number;
    label: string;
    color?: string;
  }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">
          {Math.round((value / max) * 100)}%
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", name: "Vista General", icon: BarChart3 },
    { id: "optimization", name: "Optimización", icon: Zap },
    { id: "memory", name: "Memoria", icon: Database },
    { id: "personalization", name: "Personalización", icon: User },
    { id: "tools", name: "Herramientas", icon: Wrench },
    { id: "capabilities", name: "Capacidades", icon: Brain },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard de IA Avanzada
        </h1>
        <p className="text-gray-400">
          Métricas y estadísticas de los sistemas de IA de nivel ChatGPT Plus
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Optimizaciones de Respuesta"
              value={stats.responseOptimizer.totalOptimizations}
              subtitle="Respuestas mejoradas automáticamente"
              icon={Brain}
              color="purple"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Memorias Semánticas"
              value={stats.semanticMemory.totalMemories}
              subtitle="Recuerdos almacenados"
              icon={Database}
              color="blue"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Perfiles Personalizados"
              value={stats.personalization.totalProfiles}
              subtitle="Usuarios con personalización"
              icon={User}
              color="green"
              trend={{ value: 15, isPositive: true }}
            />
            <StatCard
              title="Conversaciones Optimizadas"
              value={stats.contextOptimizer.totalConversations}
              subtitle="Contexto optimizado"
              icon={Settings}
              color="orange"
              trend={{ value: 5, isPositive: true }}
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                Métricas de Rendimiento
              </h3>
              <ProgressBar
                value={stats.responseOptimizer.averageQuality}
                label="Calidad Promedio de Respuestas"
                color="blue"
              />
              <ProgressBar
                value={stats.semanticMemory.memoryHitRate}
                label="Tasa de Acierto de Memoria"
                color="green"
              />
              <ProgressBar
                value={stats.personalization.personalizationRate}
                label="Tasa de Personalización"
                color="purple"
              />
              <ProgressBar
                value={stats.toolsOrchestrator.successRate}
                label="Tasa de Éxito de Herramientas"
                color="orange"
              />
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Eficiencia del Sistema
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tokens Ahorrados</span>
                  <span className="text-white font-semibold">
                    {stats.contextOptimizer.averageTokensSaved.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Optimizaciones/Día</span>
                  <span className="text-white font-semibold">
                    {Math.round(
                      stats.responseOptimizer.totalOptimizations / 30
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Llamadas a Herramientas</span>
                  <span className="text-white font-semibold">
                    {stats.toolsOrchestrator.totalToolCalls}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Interacciones Promedio</span>
                  <span className="text-white font-semibold">
                    {stats.personalization.averageInteractions.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Tab */}
      {activeTab === "optimization" && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Sistema de Re-ranking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {stats.responseOptimizer.totalOptimizations}
                </div>
                <div className="text-gray-400 text-sm">
                  Total Optimizaciones
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {(stats.responseOptimizer.averageQuality * 100).toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">Calidad Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {(stats.responseOptimizer.optimizationRate * 100).toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">
                  Tasa de Optimización
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memory Tab */}
      {activeTab === "memory" && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Memoria Semántica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {stats.semanticMemory.totalMemories}
                </div>
                <div className="text-gray-400 text-sm">Total Memorias</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {(stats.semanticMemory.averageRelevance * 100).toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">Relevancia Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {(stats.semanticMemory.memoryHitRate * 100).toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">Tasa de Acierto</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalization Tab */}
      {activeTab === "personalization" && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Personalización de Usuarios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {stats.personalization.totalProfiles}
                </div>
                <div className="text-gray-400 text-sm">Perfiles Activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {stats.personalization.averageInteractions.toFixed(1)}
                </div>
                <div className="text-gray-400 text-sm">
                  Interacciones Promedio
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {(stats.personalization.personalizationRate * 100).toFixed(1)}
                  %
                </div>
                <div className="text-gray-400 text-sm">
                  Tasa de Personalización
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === "tools" && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Orquestador de Herramientas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">
                  {stats.toolsOrchestrator.totalTools}
                </div>
                <div className="text-gray-400 text-sm">
                  Herramientas Disponibles
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {stats.toolsOrchestrator.totalToolCalls}
                </div>
                <div className="text-gray-400 text-sm">Total Llamadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {(stats.toolsOrchestrator.successRate * 100).toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">Tasa de Éxito</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capacidades Tab */}
      {activeTab === "capabilities" && <AdvancedAICapabilities />}
    </div>
  );
}
