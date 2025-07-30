import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface FeedbackData {
  messageId: string;
  conversationId?: string;
  userId?: string;
  type: "positive" | "negative";
  content: string;
  model?: string;
  timestamp: Date;
  metadata?: {
    responseTime?: number;
    tokensUsed?: number;
    contextLength?: number;
  };
}

export const submitFeedback = async (feedbackData: FeedbackData): Promise<void> => {
  try {
    await addDoc(collection(db, "feedback"), {
      ...feedbackData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    
    console.log("Feedback enviado exitosamente:", feedbackData);
  } catch (error) {
    console.error("Error enviando feedback:", error);
    throw error;
  }
};

export const getFeedbackStats = async (userId?: string) => {
  try {
    // Aquí se podría implementar la obtención de estadísticas de feedback
    // Por ahora solo retornamos un placeholder
    return {
      totalFeedback: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
      averageRating: 0,
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas de feedback:", error);
    throw error;
  }
}; 