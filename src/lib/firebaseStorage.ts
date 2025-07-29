import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "./firebase";

export interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
  path: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  userId: string;
  chatId?: string;
  createdAt: Date;
  metadata?: {
    model?: string;
    size?: string;
    style?: string;
  };
}

export const uploadFile = async (
  file: File,
  userId: string,
  chatId?: string
): Promise<UploadedFile> => {
  try {
    // Crear una ruta única para el archivo
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = chatId
      ? `users/${userId}/chats/${chatId}/${fileName}`
      : `users/${userId}/uploads/${fileName}`;

    const storageRef = ref(storage, filePath);

    // Subir el archivo
    const snapshot = await uploadBytes(storageRef, file);

    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      name: file.name,
      type: file.type,
      size: file.size,
      path: filePath,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Error al subir el archivo");
  }
};

export const uploadMultipleFiles = async (
  files: File[],
  userId: string,
  chatId?: string
): Promise<UploadedFile[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadFile(file, userId, chatId)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    throw new Error("Error al subir los archivos");
  }
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Error al eliminar el archivo");
  }
};

export const deleteMultipleFiles = async (
  filePaths: string[]
): Promise<void> => {
  try {
    const deletePromises = filePaths.map((path) => deleteFile(path));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting multiple files:", error);
    throw new Error("Error al eliminar los archivos");
  }
};

/**
 * Guarda una imagen generada por la IA en la biblioteca del usuario
 */
export const saveGeneratedImage = async (
  imageUrl: string,
  prompt: string,
  userId: string,
  chatId?: string,
  metadata?: {
    model?: string;
    size?: string;
    style?: string;
  }
): Promise<GeneratedImage> => {
  try {
    // Descargar la imagen desde la URL
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Crear un archivo desde el blob
    const timestamp = Date.now();
    const fileName = `generated_${timestamp}.png`;
    const file = new File([blob], fileName, { type: "image/png" });

    // Subir a Firebase Storage
    const uploadedFile = await uploadFile(file, userId, chatId);

    // Crear el objeto de imagen generada
    const generatedImage: GeneratedImage = {
      id: uploadedFile.path,
      url: uploadedFile.url,
      prompt,
      userId,
      chatId,
      createdAt: new Date(),
      metadata,
    };

    // Guardar metadata en Firestore (opcional, para búsquedas)
    // Aquí podrías guardar en una colección 'generated_images' si quieres

    return generatedImage;
  } catch (error) {
    console.error("Error saving generated image:", error);
    throw new Error("Error al guardar la imagen generada");
  }
};

/**
 * Obtiene todas las imágenes generadas por la IA de un usuario
 */
export const getGeneratedImages = async (
  userId: string
): Promise<GeneratedImage[]> => {
  try {
    const imagesRef = ref(storage, `users/${userId}/generated_images`);
    const result = await listAll(imagesRef);

    const images: GeneratedImage[] = [];

    for (const itemRef of result.items) {
      try {
        const url = await getDownloadURL(itemRef);
        // Aquí podrías obtener metadata desde Firestore si la guardaste
        const image: GeneratedImage = {
          id: itemRef.fullPath,
          url,
          prompt: "Imagen generada", // Esto debería venir de metadata
          userId,
          createdAt: new Date(), // Esto debería venir de metadata
        };
        images.push(image);
      } catch (error) {
        console.error("Error getting image URL:", error);
      }
    }

    return images.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Error getting generated images:", error);
    throw new Error("Error al obtener las imágenes generadas");
  }
};

/**
 * Elimina una imagen generada de la biblioteca
 */
export const deleteGeneratedImage = async (imageId: string): Promise<void> => {
  try {
    await deleteFile(imageId);
  } catch (error) {
    console.error("Error deleting generated image:", error);
    throw new Error("Error al eliminar la imagen generada");
  }
};
