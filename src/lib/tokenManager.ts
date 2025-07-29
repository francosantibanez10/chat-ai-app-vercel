// Precios por 1K tokens (aproximados, actualizar según OpenAI)
const TOKEN_PRICES = {
  'gpt-3.5-turbo': {
    input: 0.0005,  // $0.0005 por 1K tokens de entrada
    output: 0.0015  // $0.0015 por 1K tokens de salida
  },
  'gpt-4o': {
    input: 0.005,   // $0.005 por 1K tokens de entrada
    output: 0.015   // $0.015 por 1K tokens de salida
  },
  'gpt-4o-mini': {
    input: 0.00015, // $0.00015 por 1K tokens de entrada
    output: 0.0006  // $0.0006 por 1K tokens de salida
  }
};

export interface TokenUsage {
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: Date;
  conversationId?: string;
  messageId?: string;
}

export interface UserTokenStats {
  userId: string;
  totalTokens: number;
  totalCost: number;
  dailyUsage: Record<string, number>; // fecha -> tokens
  monthlyUsage: Record<string, number>; // YYYY-MM -> tokens
  modelBreakdown: Record<string, { tokens: number; cost: number }>;
  averageTokensPerMessage: number;
  lastActivity: Date;
}

export interface CostLimit {
  userId: string;
  dailyLimit: number; // en USD
  monthlyLimit: number; // en USD
  currentDailyCost: number;
  currentMonthlyCost: number;
  plan: string;
}

export class TokenManager {
  private static instance: TokenManager;
  private tokenUsage: Map<string, TokenUsage[]> = new Map();
  private userStats: Map<string, UserTokenStats> = new Map();
  private costLimits: Map<string, CostLimit> = new Map();
  
  private constructor() {}
  
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Estima el número de tokens en un texto
   */
  estimateTokens(text: string): number {
    // Estimación aproximada: 1 token ≈ 4 caracteres para inglés, 3 para español
    const isSpanish = /[áéíóúñü]/i.test(text);
    const charsPerToken = isSpanish ? 3 : 4;
    return Math.ceil(text.length / charsPerToken);
  }

  /**
   * Calcula el costo de tokens
   */
  calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const prices = TOKEN_PRICES[model as keyof typeof TOKEN_PRICES];
    if (!prices) {
      console.warn(`Unknown model: ${model}, using gpt-3.5-turbo pricing`);
      return this.calculateCost('gpt-3.5-turbo', inputTokens, outputTokens);
    }

    const inputCost = (inputTokens / 1000) * prices.input;
    const outputCost = (outputTokens / 1000) * prices.output;
    
    return inputCost + outputCost;
  }

  /**
   * Registra el uso de tokens
   */
  recordTokenUsage(
    userId: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    conversationId?: string,
    messageId?: string
  ): TokenUsage {
    const totalTokens = inputTokens + outputTokens;
    const cost = this.calculateCost(model, inputTokens, outputTokens);
    
    const usage: TokenUsage = {
      userId,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      cost,
      timestamp: new Date(),
      conversationId,
      messageId
    };

    // Guardar uso
    if (!this.tokenUsage.has(userId)) {
      this.tokenUsage.set(userId, []);
    }
    this.tokenUsage.get(userId)!.push(usage);

    // Actualizar estadísticas del usuario
    this.updateUserStats(userId, usage);

    return usage;
  }

  /**
   * Actualiza las estadísticas del usuario
   */
  private updateUserStats(userId: string, usage: TokenUsage): void {
    const stats = this.userStats.get(userId) || {
      userId,
      totalTokens: 0,
      totalCost: 0,
      dailyUsage: {},
      monthlyUsage: {},
      modelBreakdown: {},
      averageTokensPerMessage: 0,
      lastActivity: new Date()
    };

    // Actualizar totales
    stats.totalTokens += usage.totalTokens;
    stats.totalCost += usage.cost;
    stats.lastActivity = usage.timestamp;

    // Actualizar uso diario
    const dateKey = usage.timestamp.toISOString().split('T')[0];
    stats.dailyUsage[dateKey] = (stats.dailyUsage[dateKey] || 0) + usage.totalTokens;

    // Actualizar uso mensual
    const monthKey = usage.timestamp.toISOString().slice(0, 7); // YYYY-MM
    stats.monthlyUsage[monthKey] = (stats.monthlyUsage[monthKey] || 0) + usage.totalTokens;

    // Actualizar desglose por modelo
    if (!stats.modelBreakdown[usage.model]) {
      stats.modelBreakdown[usage.model] = { tokens: 0, cost: 0 };
    }
    stats.modelBreakdown[usage.model].tokens += usage.totalTokens;
    stats.modelBreakdown[usage.model].cost += usage.cost;

    // Calcular promedio de tokens por mensaje
    const userUsage = this.tokenUsage.get(userId) || [];
    stats.averageTokensPerMessage = stats.totalTokens / userUsage.length;

    this.userStats.set(userId, stats);
  }

  /**
   * Verifica límites de costo
   */
  checkCostLimits(userId: string, estimatedCost: number): {
    allowed: boolean;
    reason?: string;
    currentDaily: number;
    currentMonthly: number;
    dailyLimit: number;
    monthlyLimit: number;
  } {
    const limit = this.getCostLimit(userId);
    
    // Verificar límite diario
    if (limit.currentDailyCost + estimatedCost > limit.dailyLimit) {
      return {
        allowed: false,
        reason: 'Daily cost limit exceeded',
        currentDaily: limit.currentDailyCost,
        currentMonthly: limit.currentMonthlyCost,
        dailyLimit: limit.dailyLimit,
        monthlyLimit: limit.monthlyLimit
      };
    }

    // Verificar límite mensual
    if (limit.currentMonthlyCost + estimatedCost > limit.monthlyLimit) {
      return {
        allowed: false,
        reason: 'Monthly cost limit exceeded',
        currentDaily: limit.currentDailyCost,
        currentMonthly: limit.currentMonthlyCost,
        dailyLimit: limit.dailyLimit,
        monthlyLimit: limit.monthlyLimit
      };
    }

    return {
      allowed: true,
      currentDaily: limit.currentDailyCost,
      currentMonthly: limit.currentMonthlyCost,
      dailyLimit: limit.dailyLimit,
      monthlyLimit: limit.monthlyLimit
    };
  }

  /**
   * Obtiene el límite de costo para un usuario
   */
  getCostLimit(userId: string): CostLimit {
    if (!this.costLimits.has(userId)) {
      // Crear límite por defecto basado en plan
      const defaultLimit: CostLimit = {
        userId,
        dailyLimit: 1.0, // $1 por día
        monthlyLimit: 10.0, // $10 por mes
        currentDailyCost: 0,
        currentMonthlyCost: 0,
        plan: 'free'
      };
      this.costLimits.set(userId, defaultLimit);
    }

    return this.costLimits.get(userId)!;
  }

  /**
   * Actualiza límites de costo
   */
  updateCostLimits(
    userId: string,
    dailyLimit: number,
    monthlyLimit: number,
    plan: string
  ): void {
    const limit = this.getCostLimit(userId);
    limit.dailyLimit = dailyLimit;
    limit.monthlyLimit = monthlyLimit;
    limit.plan = plan;
    this.costLimits.set(userId, limit);
  }

  /**
   * Obtiene estadísticas de tokens del usuario
   */
  getUserStats(userId: string): UserTokenStats | null {
    return this.userStats.get(userId) || null;
  }

  /**
   * Obtiene uso reciente de tokens
   */
  getRecentUsage(userId: string, limit: number = 50): TokenUsage[] {
    const userUsage = this.tokenUsage.get(userId) || [];
    return userUsage
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Obtiene estadísticas globales
   */
  getGlobalStats(): {
    totalUsers: number;
    totalTokens: number;
    totalCost: number;
    averageTokensPerUser: number;
    modelUsage: Record<string, { tokens: number; cost: number }>;
  } {
    const users = Array.from(this.userStats.values());
    const totalUsers = users.length;
    const totalTokens = users.reduce((sum, u) => sum + u.totalTokens, 0);
    const totalCost = users.reduce((sum, u) => sum + u.totalCost, 0);
    const averageTokensPerUser = totalUsers > 0 ? totalTokens / totalUsers : 0;

    // Consolidar uso por modelo
    const modelUsage: Record<string, { tokens: number; cost: number }> = {};
    users.forEach(user => {
      Object.entries(user.modelBreakdown).forEach(([model, stats]) => {
        if (!modelUsage[model]) {
          modelUsage[model] = { tokens: 0, cost: 0 };
        }
        modelUsage[model].tokens += stats.tokens;
        modelUsage[model].cost += stats.cost;
      });
    });

    return {
      totalUsers,
      totalTokens,
      totalCost,
      averageTokensPerUser,
      modelUsage
    };
  }

  /**
   * Resetea contadores diarios
   */
  resetDailyCounters(): void {
    const today = new Date().toISOString().split('T')[0];
    
    for (const [userId, limit] of this.costLimits.entries()) {
      // Solo resetear si no es hoy
      const lastReset = limit.currentDailyCost === 0 ? today : today;
      if (lastReset !== today) {
        limit.currentDailyCost = 0;
        this.costLimits.set(userId, limit);
      }
    }
  }

  /**
   * Resetea contadores mensuales
   */
  resetMonthlyCounters(): void {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    for (const [userId, limit] of this.costLimits.entries()) {
      // Solo resetear si no es este mes
      const lastReset = limit.currentMonthlyCost === 0 ? currentMonth : currentMonth;
      if (lastReset !== currentMonth) {
        limit.currentMonthlyCost = 0;
        this.costLimits.set(userId, limit);
      }
    }
  }

  /**
   * Limpia datos antiguos
   */
  cleanupOldData(maxAgeDays: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    for (const [userId, usage] of this.tokenUsage.entries()) {
      const filteredUsage = usage.filter(u => u.timestamp > cutoffDate);
      this.tokenUsage.set(userId, filteredUsage);
    }
  }

  /**
   * Genera reporte de uso
   */
  generateUsageReport(userId: string, days: number = 30): {
    period: string;
    totalTokens: number;
    totalCost: number;
    averageTokensPerDay: number;
    averageCostPerDay: number;
    modelBreakdown: Record<string, { tokens: number; cost: number; percentage: number }>;
    dailyBreakdown: Array<{ date: string; tokens: number; cost: number }>;
  } {
    const userUsage = this.tokenUsage.get(userId) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const periodUsage = userUsage.filter(u => u.timestamp > cutoffDate);
    const totalTokens = periodUsage.reduce((sum, u) => sum + u.totalTokens, 0);
    const totalCost = periodUsage.reduce((sum, u) => sum + u.cost, 0);

    // Desglose por modelo
    const modelBreakdown: Record<string, { tokens: number; cost: number; percentage: number }> = {};
    periodUsage.forEach(usage => {
      if (!modelBreakdown[usage.model]) {
        modelBreakdown[usage.model] = { tokens: 0, cost: 0, percentage: 0 };
      }
      modelBreakdown[usage.model].tokens += usage.totalTokens;
      modelBreakdown[usage.model].cost += usage.cost;
    });

    // Calcular porcentajes
    Object.values(modelBreakdown).forEach(model => {
      model.percentage = totalTokens > 0 ? (model.tokens / totalTokens) * 100 : 0;
    });

    // Desglose diario
    const dailyBreakdown: Record<string, { tokens: number; cost: number }> = {};
    periodUsage.forEach(usage => {
      const dateKey = usage.timestamp.toISOString().split('T')[0];
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = { tokens: 0, cost: 0 };
      }
      dailyBreakdown[dateKey].tokens += usage.totalTokens;
      dailyBreakdown[dateKey].cost += usage.cost;
    });

    const dailyBreakdownArray = Object.entries(dailyBreakdown)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      period: `${days} days`,
      totalTokens,
      totalCost,
      averageTokensPerDay: totalTokens / days,
      averageCostPerDay: totalCost / days,
      modelBreakdown,
      dailyBreakdown: dailyBreakdownArray
    };
  }
}

export const tokenManager = TokenManager.getInstance(); 