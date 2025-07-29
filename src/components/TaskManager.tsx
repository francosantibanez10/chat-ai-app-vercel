"use client";

import { useState } from "react";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Calendar, 
  Flag, 
  Plus, 
  Edit3, 
  Trash2,
  TrendingUp,
  Target,
  FileText,
  Briefcase,
  Heart,
  DollarSign,
  Settings
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  category: "work" | "personal" | "learning" | "health" | "finance" | "other";
  dueDate?: Date;
  estimatedTime?: number;
  tags: string[];
}

interface TaskManagerProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskAdd?: (task: Omit<Task, "id">) => void;
}

export default function TaskManager({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
}: TaskManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "high":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work":
        return <Briefcase className="w-4 h-4" />;
      case "personal":
        return <Heart className="w-4 h-4" />;
      case "learning":
        return <Target className="w-4 h-4" />;
      case "health":
        return <TrendingUp className="w-4 h-4" />;
      case "finance":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "cancelled":
        return <Circle className="w-4 h-4 text-gray-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedCategory !== "all" && task.category !== selectedCategory) return false;
    if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
    if (!showCompleted && task.status === "completed") return false;
    return true;
  });

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");
  const overdueTasks = tasks.filter(t => 
    t.status === "pending" && t.dueDate && t.dueDate < new Date()
  );

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Gestor de Tareas</h3>
            <p className="text-sm text-gray-400">
              {tasks.length} tareas • {pendingTasks.length} pendientes • {completedTasks.length} completadas
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            {showCompleted ? "Ocultar" : "Mostrar"} completadas
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Circle className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Pendientes</span>
          </div>
          <p className="text-xl font-semibold text-white">{pendingTasks.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Completadas</span>
          </div>
          <p className="text-xl font-semibold text-white">{completedTasks.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-400">Vencidas</span>
          </div>
          <p className="text-xl font-semibold text-white">{overdueTasks.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Progreso</span>
          </div>
          <p className="text-xl font-semibold text-white">
            {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
        >
          <option value="all">Todas las categorías</option>
          <option value="work">Trabajo</option>
          <option value="personal">Personal</option>
          <option value="learning">Aprendizaje</option>
          <option value="health">Salud</option>
          <option value="finance">Finanzas</option>
          <option value="other">Otros</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
        >
          <option value="all">Todas las prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay tareas que coincidan con los filtros</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-gray-900/30 border rounded-lg p-4 transition-all ${
                task.status === "completed" 
                  ? "border-green-600/30 bg-green-900/10" 
                  : task.dueDate && task.dueDate < new Date()
                  ? "border-red-600/30 bg-red-900/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => onTaskUpdate?.(task.id, { 
                      status: task.status === "completed" ? "pending" : "completed" 
                    })}
                    className="mt-1"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium line-clamp-1">
                        {task.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && task.dueDate < new Date() && task.status !== "completed" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-400/10 text-red-400 border border-red-400/20">
                          Vencida
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(task.category)}
                        <span className="capitalize">{task.category}</span>
                      </div>
                      
                      {task.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{task.dueDate.toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {task.estimatedTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedTime} min</span>
                        </div>
                      )}
                    </div>
                    
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-3">
                  <button
                    onClick={() => onTaskUpdate?.(task.id, { status: "in_progress" })}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Marcar en progreso"
                  >
                    <Clock className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => onTaskDelete?.(task.id)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Button */}
      {onTaskAdd && (
        <div className="text-center">
          <button
            onClick={() => onTaskAdd({
              title: "Nueva tarea",
              description: "Descripción de la tarea",
              status: "pending",
              priority: "medium",
              category: "other",
              tags: []
            })}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar tarea</span>
          </button>
        </div>
      )}
    </div>
  );
}