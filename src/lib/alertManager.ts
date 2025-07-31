interface AlertConfig {
  enabled: boolean;
  criticalThreshold: number;
  highThreshold: number;
  timeWindow: number; // en minutos
  notificationChannels: ('email' | 'slack' | 'webhook')[];
  recipients: string[];
}

interface Alert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
  errorCount: number;
  category: string;
  resolved: boolean;
  resolvedAt?: Date;
}

class AlertManager {
  private config: AlertConfig;
  private alerts: Alert[] = [];
  private lastCheck: Date = new Date();

  constructor(config?: Partial<AlertConfig>) {
    this.config = {
      enabled: true,
      criticalThreshold: 5,
      highThreshold: 10,
      timeWindow: 15, // 15 minutos
      notificationChannels: ['webhook'],
      recipients: [],
      ...config
    };
  }

  // Verificar si se debe generar una alerta
  checkForAlerts(errorStats: any): Alert[] {
    if (!this.config.enabled) return [];

    const newAlerts: Alert[] = [];
    const now = new Date();
    const timeWindowStart = new Date(now.getTime() - this.config.timeWindow * 60 * 1000);

    // Filtrar errores del período de tiempo
    const recentErrors = this.getRecentErrors(timeWindowStart);

    // Verificar errores críticos
    const criticalErrors = recentErrors.filter(e => e.severity === 'critical');
    if (criticalErrors.length >= this.config.criticalThreshold) {
      const alert = this.createAlert('critical', criticalErrors);
      if (alert) {
        newAlerts.push(alert);
        this.sendAlert(alert);
      }
    }

    // Verificar errores de alta severidad
    const highErrors = recentErrors.filter(e => e.severity === 'high');
    if (highErrors.length >= this.config.highThreshold) {
      const alert = this.createAlert('high', highErrors);
      if (alert) {
        newAlerts.push(alert);
        this.sendAlert(alert);
      }
    }

    // Verificar patrones de errores por categoría
    const categoryAlerts = this.checkCategoryPatterns(recentErrors);
    newAlerts.push(...categoryAlerts);

    this.alerts.push(...newAlerts);
    this.lastCheck = now;

    return newAlerts;
  }

  // Crear alerta
  private createAlert(type: Alert['type'], errors: any[]): Alert | null {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Verificar si ya existe una alerta similar sin resolver
    const existingAlert = this.alerts.find(
      a => a.type === type && !a.resolved && 
      a.timestamp > new Date(Date.now() - this.config.timeWindow * 60 * 1000)
    );

    if (existingAlert) {
      return null; // No crear alerta duplicada
    }

    const category = this.getMostCommonCategory(errors);
    const message = this.generateAlertMessage(type, errors.length, category);

    return {
      id: alertId,
      type,
      message,
      timestamp: new Date(),
      errorCount: errors.length,
      category,
      resolved: false
    };
  }

  // Verificar patrones por categoría
  private checkCategoryPatterns(errors: any[]): Alert[] {
    const alerts: Alert[] = [];
    const categoryCounts: Record<string, number> = {};

    // Contar errores por categoría
    errors.forEach(error => {
      categoryCounts[error.category] = (categoryCounts[error.category] || 0) + 1;
    });

    // Verificar umbrales por categoría
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count >= 5) { // Umbral para alertas de categoría
        const categoryErrors = errors.filter(e => e.category === category);
        const alert = this.createCategoryAlert(category, categoryErrors);
        if (alert) {
          alerts.push(alert);
          this.sendAlert(alert);
        }
      }
    });

    return alerts;
  }

  // Crear alerta de categoría
  private createCategoryAlert(category: string, errors: any[]): Alert | null {
    const alertId = `category_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const existingAlert = this.alerts.find(
      a => a.category === category && !a.resolved && 
      a.timestamp > new Date(Date.now() - this.config.timeWindow * 60 * 1000)
    );

    if (existingAlert) {
      return null;
    }

    const severity = this.determineSeverity(errors);
    const message = this.generateCategoryAlertMessage(category, errors.length);

    return {
      id: alertId,
      type: severity,
      message,
      timestamp: new Date(),
      errorCount: errors.length,
      category,
      resolved: false
    };
  }

  // Determinar severidad basada en errores
  private determineSeverity(errors: any[]): Alert['type'] {
    const criticalCount = errors.filter(e => e.severity === 'critical').length;
    const highCount = errors.filter(e => e.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 0) return 'high';
    return 'medium';
  }

  // Obtener categoría más común
  private getMostCommonCategory(errors: any[]): string {
    const categoryCounts: Record<string, number> = {};
    errors.forEach(error => {
      categoryCounts[error.category] = (categoryCounts[error.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
  }

  // Generar mensaje de alerta
  private generateAlertMessage(type: Alert['type'], count: number, category: string): string {
    const timeWindow = this.config.timeWindow;
    
    switch (type) {
      case 'critical':
        return `🚨 ALERTA CRÍTICA: ${count} errores críticos detectados en los últimos ${timeWindow} minutos. Categoría principal: ${category}`;
      case 'high':
        return `⚠️ ALERTA ALTA: ${count} errores de alta severidad detectados en los últimos ${timeWindow} minutos. Categoría principal: ${category}`;
      default:
        return `📊 ALERTA: ${count} errores detectados en los últimos ${timeWindow} minutos. Categoría principal: ${category}`;
    }
  }

  // Generar mensaje de alerta de categoría
  private generateCategoryAlertMessage(category: string, count: number): string {
    const timeWindow = this.config.timeWindow;
    return `🔍 ALERTA DE CATEGORÍA: ${count} errores de ${category} detectados en los últimos ${timeWindow} minutos`;
  }

  // Obtener errores recientes (simulado - en producción vendría del errorHandler)
  private getRecentErrors(since: Date): any[] {
    // Esta función simula obtener errores recientes
    // En producción, se conectaría con el errorHandler
    return [];
  }

  // Enviar alerta
  private async sendAlert(alert: Alert): Promise<void> {
    console.log(`🚨 [ALERT] ${alert.message}`);

    // Enviar por webhook si está configurado
    if (this.config.notificationChannels.includes('webhook')) {
      await this.sendWebhookAlert(alert);
    }

    // Enviar por email si está configurado
    if (this.config.notificationChannels.includes('email')) {
      await this.sendEmailAlert(alert);
    }

    // Enviar por Slack si está configurado
    if (this.config.notificationChannels.includes('slack')) {
      await this.sendSlackAlert(alert);
    }
  }

  // Enviar alerta por webhook
  private async sendWebhookAlert(alert: Alert): Promise<void> {
    try {
      const webhookUrl = process.env.ALERT_WEBHOOK_URL;
      if (!webhookUrl) return;

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert: {
            id: alert.id,
            type: alert.type,
            message: alert.message,
            timestamp: alert.timestamp.toISOString(),
            errorCount: alert.errorCount,
            category: alert.category
          }
        })
      });
    } catch (error) {
      console.error('Error sending webhook alert:', error);
    }
  }

  // Enviar alerta por email
  private async sendEmailAlert(alert: Alert): Promise<void> {
    // Implementar envío de email
    console.log(`📧 Email alert would be sent: ${alert.message}`);
  }

  // Enviar alerta por Slack
  private async sendSlackAlert(alert: Alert): Promise<void> {
    // Implementar envío a Slack
    console.log(`💬 Slack alert would be sent: ${alert.message}`);
  }

  // Marcar alerta como resuelta
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
    }
  }

  // Obtener alertas activas
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  // Obtener todas las alertas
  getAllAlerts(): Alert[] {
    return this.alerts;
  }

  // Limpiar alertas antiguas
  cleanupOldAlerts(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  // Configurar alertas
  configure(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Habilitar/deshabilitar alertas
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
}

// Instancia singleton
export const alertManager = new AlertManager();

// Funciones de conveniencia
export const checkForAlerts = (errorStats: any) => alertManager.checkForAlerts(errorStats);
export const resolveAlert = (alertId: string) => alertManager.resolveAlert(alertId);
export const getActiveAlerts = () => alertManager.getActiveAlerts();
export const configureAlerts = (config: Partial<AlertConfig>) => alertManager.configure(config);

export default alertManager; 