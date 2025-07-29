import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  category: "work" | "personal" | "learning" | "health" | "finance" | "other";
  dueDate?: Date;
  completedDate?: Date;
  estimatedTime?: number; // minutes
  actualTime?: number; // minutes
  tags: string[];
  subtasks: Subtask[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface TaskSuggestion {
  type: "reminder" | "follow_up" | "next_step" | "improvement";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  relatedTaskId?: string;
  suggestedDate?: Date;
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  mostProductiveDay: string;
  favoriteCategories: string[];
  productivityScore: number; // 0-100
}

export class TaskManager {
  private static instance: TaskManager;
  private tasks: Map<string, Task[]> = new Map();
  private suggestions: Map<string, TaskSuggestion[]> = new Map();

  private constructor() {}

  static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  /**
   * Crea una nueva tarea
   */
  async createTask(
    userId: string,
    title: string,
    description: string,
    category: Task["category"] = "other",
    priority: Task["priority"] = "medium",
    dueDate?: Date,
    estimatedTime?: number
  ): Promise<Task> {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      description,
      status: "pending",
      priority,
      category,
      dueDate,
      estimatedTime,
      tags: [],
      subtasks: [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!this.tasks.has(userId)) {
      this.tasks.set(userId, []);
    }
    this.tasks.get(userId)!.push(task);

    // Generar sugerencias relacionadas
    await this.generateTaskSuggestions(userId, task);

    return task;
  }

  /**
   * Extrae tareas de una conversación
   */
  async extractTasksFromConversation(
    userId: string,
    conversation: string
  ): Promise<Task[]> {
    const extractPrompt = `
Extrae tareas y acciones pendientes de la siguiente conversación:

Conversación: "${conversation}"

Identifica:
1. Tareas explícitas mencionadas
2. Acciones que el usuario debe realizar
3. Seguimientos necesarios
4. Recordatorios importantes

Para cada tarea, proporciona:
- Título claro y conciso
- Descripción detallada
- Categoría apropiada
- Prioridad estimada
- Fecha límite si se menciona

Responde con JSON array:
[
  {
    "title": "Título de la tarea",
    "description": "Descripción detallada",
    "category": "work|personal|learning|health|finance|other",
    "priority": "low|medium|high|urgent",
    "dueDate": "YYYY-MM-DD" (opcional),
    "estimatedTime": 30 (minutos, opcional)
  }
]`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: extractPrompt }],
        temperature: 0.1,
        maxTokens: 1000,
      });

      const textResult = await this.getTextSafely(result);
      let cleanJson = textResult.trim();

      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```/, "");
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```/, "");
      }

      const taskData = JSON.parse(cleanJson);
      const tasks: Task[] = [];

      for (const data of taskData) {
        const task = await this.createTask(
          userId,
          data.title,
          data.description,
          data.category,
          data.priority,
          data.dueDate ? new Date(data.dueDate) : undefined,
          data.estimatedTime
        );
        tasks.push(task);
      }

      return tasks;
    } catch (error) {
      console.error("Error extracting tasks:", error);
      return [];
    }
  }

  /**
   * Genera sugerencias de seguimiento
   */
  async generateTaskSuggestions(
    userId: string,
    currentTask?: Task
  ): Promise<TaskSuggestion[]> {
    const userTasks = this.tasks.get(userId) || [];
    const pendingTasks = userTasks.filter((t) => t.status === "pending");
    const overdueTasks = pendingTasks.filter(
      (t) => t.dueDate && t.dueDate < new Date()
    );

    const suggestionPrompt = `
Analiza las tareas del usuario y genera sugerencias útiles:

Tareas pendientes: ${pendingTasks.length}
Tareas vencidas: ${overdueTasks.length}
Tarea actual: ${currentTask ? currentTask.title : "Ninguna"}

Genera sugerencias de:
1. Recordatorios para tareas vencidas
2. Próximos pasos lógicos
3. Seguimientos necesarios
4. Mejoras de productividad

Responde con JSON array:
[
  {
    "type": "reminder|follow_up|next_step|improvement",
    "title": "Título de la sugerencia",
    "description": "Descripción detallada",
    "priority": "low|medium|high",
    "suggestedDate": "YYYY-MM-DD" (opcional)
  }
]`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: suggestionPrompt }],
        temperature: 0.3,
        maxTokens: 800,
      });

      const textResult = await this.getTextSafely(result);
      let cleanJson = textResult.trim();

      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```/, "");
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```/, "");
      }

      const suggestions: TaskSuggestion[] = JSON.parse(cleanJson);

      if (!this.suggestions.has(userId)) {
        this.suggestions.set(userId, []);
      }
      this.suggestions.get(userId)!.push(...suggestions);

      return suggestions;
    } catch (error) {
      console.error("Error generating suggestions:", error);
      return [];
    }
  }

  /**
   * Actualiza el estado de una tarea
   */
  updateTaskStatus(
    userId: string,
    taskId: string,
    status: Task["status"],
    actualTime?: number
  ): Task | null {
    const userTasks = this.tasks.get(userId);
    if (!userTasks) return null;

    const task = userTasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = status;
    task.updatedAt = new Date();

    if (status === "completed") {
      task.completedDate = new Date();
      task.actualTime = actualTime;
    }

    return task;
  }

  /**
   * Agrega una subtarea
   */
  addSubtask(userId: string, taskId: string, title: string): Subtask | null {
    const userTasks = this.tasks.get(userId);
    if (!userTasks) return null;

    const task = userTasks.find((t) => t.id === taskId);
    if (!task) return null;

    const subtask: Subtask = {
      id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      completed: false,
    };

    task.subtasks.push(subtask);
    task.updatedAt = new Date();

    return subtask;
  }

  /**
   * Marca una subtarea como completada
   */
  completeSubtask(userId: string, taskId: string, subtaskId: string): boolean {
    const userTasks = this.tasks.get(userId);
    if (!userTasks) return false;

    const task = userTasks.find((t) => t.id === taskId);
    if (!task) return false;

    const subtask = task.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return false;

    subtask.completed = true;
    subtask.completedAt = new Date();
    task.updatedAt = new Date();

    return true;
  }

  /**
   * Agrega una nota a una tarea
   */
  addNote(userId: string, taskId: string, note: string): boolean {
    const userTasks = this.tasks.get(userId);
    if (!userTasks) return false;

    const task = userTasks.find((t) => t.id === taskId);
    if (!task) return false;

    task.notes.push(note);
    task.updatedAt = new Date();

    return true;
  }

  /**
   * Obtiene tareas del usuario
   */
  getUserTasks(
    userId: string,
    filters?: {
      status?: Task["status"];
      category?: Task["category"];
      priority?: Task["priority"];
      dueDate?: Date;
    }
  ): Task[] {
    const userTasks = this.tasks.get(userId) || [];

    if (!filters) return userTasks;

    return userTasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.category && task.category !== filters.category) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.dueDate && task.dueDate && task.dueDate > filters.dueDate)
        return false;
      return true;
    });
  }

  /**
   * Obtiene sugerencias del usuario
   */
  getUserSuggestions(userId: string): TaskSuggestion[] {
    return this.suggestions.get(userId) || [];
  }

  /**
   * Genera análisis de productividad
   */
  getTaskAnalytics(userId: string): TaskAnalytics {
    const userTasks = this.tasks.get(userId) || [];
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const pendingTasks = userTasks.filter((t) => t.status === "pending").length;
    const overdueTasks = userTasks.filter(
      (t) => t.status === "pending" && t.dueDate && t.dueDate < new Date()
    ).length;

    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calcular tiempo promedio de completación
    const completedWithTime = userTasks.filter(
      (t) => t.status === "completed" && t.actualTime
    );
    const averageCompletionTime =
      completedWithTime.length > 0
        ? completedWithTime.reduce((sum, t) => sum + (t.actualTime || 0), 0) /
          completedWithTime.length
        : 0;

    // Día más productivo
    const completionDates = userTasks
      .filter((t) => t.completedDate)
      .map((t) => t.completedDate!.toDateString());

    const dayCount = completionDates.reduce((acc, day) => {
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostProductiveDay =
      Object.entries(dayCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    // Categorías favoritas
    const categoryCount = userTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Puntuación de productividad (0-100)
    const productivityScore = Math.min(
      100,
      Math.max(
        0,
        completionRate * 0.4 +
          ((totalTasks - overdueTasks) / totalTasks) * 100 * 0.3 +
          (averageCompletionTime > 0
            ? Math.min(100, 1000 / averageCompletionTime) * 0.3
            : 0)
      )
    );

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      averageCompletionTime,
      mostProductiveDay,
      favoriteCategories,
      productivityScore,
    };
  }

  /**
   * Genera un resumen de tareas pendientes
   */
  async generateTaskSummary(userId: string): Promise<string> {
    const analytics = this.getTaskAnalytics(userId);
    const pendingTasks = this.getUserTasks(userId, { status: "pending" });
    const overdueTasks = pendingTasks.filter(
      (t) => t.dueDate && t.dueDate < new Date()
    );

    const summaryPrompt = `
Genera un resumen de las tareas del usuario:

Estadísticas:
- Total de tareas: ${analytics.totalTasks}
- Completadas: ${analytics.completedTasks}
- Pendientes: ${analytics.pendingTasks}
- Vencidas: ${analytics.overdueTasks}
- Tasa de completación: ${analytics.completionRate.toFixed(1)}%
- Puntuación de productividad: ${analytics.productivityScore.toFixed(1)}/100

Tareas vencidas (${overdueTasks.length}):
${overdueTasks
  .map((t) => `- ${t.title} (venció ${t.dueDate?.toLocaleDateString()})`)
  .join("\n")}

Tareas de alta prioridad pendientes:
${pendingTasks
  .filter((t) => t.priority === "high" || t.priority === "urgent")
  .map((t) => `- ${t.title}`)
  .join("\n")}

Genera un resumen motivacional y sugiere próximos pasos.`;

    try {
      const result = await streamText({
        model: openai("gpt-4o"),
        messages: [{ role: "user", content: summaryPrompt }],
        temperature: 0.7,
        maxTokens: 500,
      });

      return await this.getTextSafely(result);
    } catch (error) {
      console.error("Error generating task summary:", error);
      return "No se pudo generar el resumen de tareas.";
    }
  }

  private async getTextSafely(result: any): Promise<string> {
    try {
      return await result.text;
    } catch (error) {
      console.error("Error getting text from result:", error);
      return "Error processing result";
    }
  }

  /**
   * Limpia datos antiguos
   */
  cleanupOldData(maxAgeDays: number = 90): void {
    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);

    for (const [userId, tasks] of this.tasks.entries()) {
      this.tasks.set(
        userId,
        tasks.filter((t) => t.updatedAt > cutoff)
      );
    }

    for (const [userId, suggestions] of this.suggestions.entries()) {
      this.suggestions.set(
        userId,
        suggestions.filter((s) => !s.suggestedDate || s.suggestedDate > cutoff)
      );
    }
  }
}

export const taskManager = TaskManager.getInstance();
