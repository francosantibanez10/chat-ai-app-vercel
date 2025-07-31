"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Server,
  Wifi,
  Shield,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  X,
} from "lucide-react";
import { getErrorStats } from "@/lib/errorHandler";

interface ErrorStats {
  total: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  recentErrors: number;
}

interface ErrorDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErrorDashboard: React.FC<ErrorDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">(
    "24h"
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const errorStats = getErrorStats();
      setStats(errorStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <Shield className="w-4 h-4" />;
      case "network":
        return <Wifi className="w-4 h-4" />;
      case "system_error":
        return <Server className="w-4 h-4" />;
      case "ai_error":
        return <Activity className="w-4 h-4" />;
      case "validation":
        return <AlertTriangle className="w-4 h-4" />;
      case "rate_limit":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous)
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (current < previous)
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Dashboard de Errores
              </h2>
              <p className="text-gray-400 text-sm">
                Monitoreo y análisis de errores del sistema
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-400 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white"
            >
              <option value="1h">Última hora</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : stats ? (
          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total de Errores</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Errores Recientes</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.recentErrors}
                    </p>
                  </div>
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Tasa de Error</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.total > 0
                        ? ((stats.recentErrors / stats.total) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Estado</p>
                    <p className="text-2xl font-bold text-green-500">Estable</p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Gráficos de severidad y categoría */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Errores por Severidad */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Errores por Severidad
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.bySeverity).map(
                    ([severity, count], index) => (
                      <div
                        key={severity}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getSeverityColor(
                              severity
                            ).replace("text-", "bg-")}`}
                          />
                          <span className="text-gray-300 capitalize">
                            {severity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">
                            {count}
                          </span>
                          <span className="text-gray-400 text-sm">
                            ({((count / stats.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </motion.div>

              {/* Errores por Categoría */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Errores por Categoría
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.byCategory).map(
                    ([category, count], index) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="text-gray-400">
                            {getCategoryIcon(category)}
                          </div>
                          <span className="text-gray-300 capitalize">
                            {category.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">
                            {count}
                          </span>
                          <span className="text-gray-400 text-sm">
                            ({((count / stats.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            </div>

            {/* Alertas y recomendaciones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Alertas y Recomendaciones
              </h3>
              <div className="space-y-3">
                {stats.bySeverity.critical > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-red-400 font-medium">
                        Errores críticos detectados
                      </p>
                      <p className="text-red-300 text-sm">
                        Revisar inmediatamente los errores críticos
                      </p>
                    </div>
                  </div>
                )}

                {stats.byCategory.authentication > 5 && (
                  <div className="flex items-center space-x-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-orange-400 font-medium">
                        Muchos errores de autenticación
                      </p>
                      <p className="text-orange-300 text-sm">
                        Verificar configuración de Firebase Auth
                      </p>
                    </div>
                  </div>
                )}

                {stats.byCategory.network > 10 && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Wifi className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-blue-400 font-medium">
                        Problemas de conectividad
                      </p>
                      <p className="text-blue-300 text-sm">
                        Revisar conexión de red y timeouts
                      </p>
                    </div>
                  </div>
                )}

                {stats.total === 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-green-400 font-medium">
                        Sistema estable
                      </p>
                      <p className="text-green-300 text-sm">
                        No se han detectado errores en este período
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">
              No se pudieron cargar las estadísticas
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
