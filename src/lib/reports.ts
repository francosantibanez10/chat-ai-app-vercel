import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface ReportData {
  conversationId: string;
  userId?: string;
  reason: string;
  details?: string;
  category?: "inappropriate" | "spam" | "error" | "other";
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  timestamp: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  resolution?: string;
}

export const submitReport = async (reportData: Omit<ReportData, "timestamp" | "status">): Promise<void> => {
  try {
    await addDoc(collection(db, "reports"), {
      ...reportData,
      status: "pending",
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    
    console.log("Reporte enviado exitosamente:", reportData);
  } catch (error) {
    console.error("Error enviando reporte:", error);
    throw error;
  }
};

export const getUserReports = async (userId: string): Promise<ReportData[]> => {
  try {
    const q = query(
      collection(db, "reports"),
      where("userId", "==", userId),
      where("status", "in", ["pending", "reviewed"])
    );
    
    const querySnapshot = await getDocs(q);
    const reports: ReportData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        conversationId: data.conversationId,
        userId: data.userId,
        reason: data.reason,
        details: data.details,
        category: data.category,
        status: data.status,
        timestamp: data.timestamp?.toDate() || new Date(),
        reviewedBy: data.reviewedBy,
        reviewedAt: data.reviewedAt?.toDate(),
        resolution: data.resolution,
      });
    });
    
    return reports;
  } catch (error) {
    console.error("Error obteniendo reportes del usuario:", error);
    throw error;
  }
};

export const getReportStats = async (): Promise<{
  total: number;
  pending: number;
  resolved: number;
  dismissed: number;
}> => {
  try {
    // Aquí se podría implementar la obtención de estadísticas de reportes
    // Por ahora solo retornamos un placeholder
    return {
      total: 0,
      pending: 0,
      resolved: 0,
      dismissed: 0,
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas de reportes:", error);
    throw error;
  }
}; 