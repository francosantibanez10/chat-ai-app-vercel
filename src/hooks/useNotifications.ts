import { useSettings } from "@/contexts/SettingsContext";
import { useEffect, useState } from "react";

export function useNotifications() {
  const { settings } = useSettings();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar si las notificaciones están soportadas
    setIsSupported("Notification" in window);
    
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Las notificaciones no están soportadas en este navegador");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error al solicitar permisos de notificación:", error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!settings.notifications || !isSupported || permission !== "granted") {
      return;
    }

    try {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    } catch (error) {
      console.error("Error al enviar notificación:", error);
    }
  };

  const sendChatNotification = (message: string, sender: string = "Rubi") => {
    sendNotification(`${sender}: ${message}`, {
      body: message,
      tag: "chat-message",
      requireInteraction: false,
    });
  };

  const sendSystemNotification = (title: string, message: string) => {
    sendNotification(title, {
      body: message,
      tag: "system",
      requireInteraction: false,
    });
  };

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendChatNotification,
    sendSystemNotification,
  };
} 