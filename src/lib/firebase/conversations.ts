import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  model?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

// Crear una nueva conversación
export const createConversation = async (
  userId: string,
  title: string = "Nueva conversación"
): Promise<string> => {
  try {
    console.log("🔧 [DEBUG] Creando conversación para usuario:", userId);

    const conversationData = {
      title,
      userId,
      messages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      model: "gpt-3.5-turbo",
    };

    console.log("🔧 [DEBUG] Datos de conversación:", conversationData);

    const docRef = await addDoc(
      collection(db, "conversations"),
      conversationData
    );

    console.log(
      "✅ [DEBUG] Conversación creada exitosamente con ID:",
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    console.error("❌ [DEBUG] Error creating conversation:", error);
    throw error;
  }
};

// Obtener todas las conversaciones de un usuario
export const getUserConversations = async (
  userId: string,
  includeArchived: boolean = false
): Promise<ConversationSummary[]> => {
  try {
    let q;
    if (includeArchived) {
      // Obtener todas las conversaciones (incluyendo archivadas)
      q = query(
        collection(db, "conversations"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
      );
    } else {
      // Obtener solo conversaciones no archivadas
      q = query(
        collection(db, "conversations"),
        where("userId", "==", userId),
        where("isArchived", "==", false),
        orderBy("updatedAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const conversations: ConversationSummary[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        title: data.title,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        messageCount: data.messages?.length || 0,
        model: data.model,
        isPinned: data.isPinned || false,
        isArchived: data.isArchived || false,
      });
    });

    return conversations;
  } catch (error) {
    console.error("Error getting user conversations:", error);
    throw error;
  }
};

// Obtener conversaciones archivadas de un usuario
export const getArchivedConversations = async (
  userId: string
): Promise<ConversationSummary[]> => {
  try {
    const q = query(
      collection(db, "conversations"),
      where("userId", "==", userId),
      where("isArchived", "==", true),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const conversations: ConversationSummary[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        title: data.title,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        messageCount: data.messages?.length || 0,
        model: data.model,
        isPinned: data.isPinned || false,
        isArchived: data.isArchived || false,
      });
    });

    return conversations;
  } catch (error) {
    console.error("Error getting archived conversations:", error);
    throw error;
  }
};

// Obtener una conversación específica con todos sus mensajes
export const getConversation = async (
  conversationId: string
): Promise<Conversation | null> => {
  try {
    const docRef = doc(db, "conversations", conversationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        userId: data.userId,
        messages:
          data.messages?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate() || new Date(),
          })) || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        model: data.model,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting conversation:", error);
    throw error;
  }
};

// Agregar un mensaje a una conversación
export const addMessageToConversation = async (
  conversationId: string,
  message: Omit<Message, "id" | "timestamp">
): Promise<void> => {
  try {
    console.log("🔧 [DEBUG] Agregando mensaje a conversación:", conversationId);
    console.log("🔧 [DEBUG] Mensaje:", message);

    const docRef = doc(db, "conversations", conversationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("✅ [DEBUG] Documento de conversación encontrado");

      const data = docSnap.data();
      const messages = data.messages || [];

      const newMessage: Message = {
        id: Date.now().toString(),
        ...message,
        timestamp: new Date(),
      };

      console.log("🔧 [DEBUG] Nuevo mensaje a agregar:", newMessage);

      // Generar título automático si es el primer mensaje del usuario
      let title = data.title;
      if (
        message.role === "user" &&
        messages.filter((m: any) => m.role === "user").length === 0
      ) {
        title =
          message.content.slice(0, 50) +
          (message.content.length > 50 ? "..." : "");
        console.log("🔧 [DEBUG] Título actualizado:", title);
      }

      const updateData = {
        messages: [...messages, newMessage],
        title,
        updatedAt: serverTimestamp(),
      };

      console.log("🔧 [DEBUG] Datos a actualizar:", updateData);

      await updateDoc(docRef, updateData);
      console.log("✅ [DEBUG] Mensaje agregado exitosamente");
    } else {
      console.error(
        "❌ [DEBUG] Documento de conversación no encontrado:",
        conversationId
      );
      throw new Error("Conversación no encontrada");
    }
  } catch (error) {
    console.error("❌ [DEBUG] Error adding message to conversation:", error);
    throw error;
  }
};

// Actualizar el título de una conversación
export const updateConversationTitle = async (
  conversationId: string,
  title: string
): Promise<void> => {
  try {
    const docRef = doc(db, "conversations", conversationId);
    await updateDoc(docRef, {
      title,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating conversation title:", error);
    throw error;
  }
};

// Eliminar una conversación
export const deleteConversation = async (
  conversationId: string
): Promise<void> => {
  try {
    const docRef = doc(db, "conversations", conversationId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

// Actualizar el modelo de una conversación
export const updateConversationModel = async (
  conversationId: string,
  model: string
): Promise<void> => {
  try {
    const docRef = doc(db, "conversations", conversationId);
    await updateDoc(docRef, {
      model,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating conversation model:", error);
    throw error;
  }
};

export const updateConversationPin = async (
  conversationId: string,
  isPinned: boolean
): Promise<void> => {
  try {
    const docRef = doc(db, "conversations", conversationId);
    await updateDoc(docRef, {
      isPinned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating conversation pin:", error);
    throw error;
  }
};

export const updateConversationArchive = async (
  conversationId: string,
  isArchived: boolean
): Promise<void> => {
  try {
    const docRef = doc(db, "conversations", conversationId);
    await updateDoc(docRef, {
      isArchived,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating conversation archive:", error);
    throw error;
  }
};

export const updateMessageInConversation = async (
  conversationId: string,
  messageId: string,
  newContent: string
): Promise<void> => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      throw new Error("Conversación no encontrada");
    }
    
    const conversationData = conversationDoc.data();
    const messages = conversationData.messages || [];
    
    // Encontrar y actualizar el mensaje específico
    const updatedMessages = messages.map((msg: any) => 
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );
    
    // Actualizar la conversación
    await updateDoc(conversationRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating message in conversation:", error);
    throw error;
  }
};

export const deleteMessageFromConversation = async (
  conversationId: string,
  messageId: string
): Promise<void> => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      throw new Error("Conversación no encontrada");
    }
    
    const conversationData = conversationDoc.data();
    const messages = conversationData.messages || [];
    
    // Filtrar el mensaje a eliminar
    const updatedMessages = messages.filter((msg: any) => msg.id !== messageId);
    
    // Actualizar la conversación
    await updateDoc(conversationRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error deleting message from conversation:", error);
    throw error;
  }
};
