"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  GeneratedImage,
  saveGeneratedImage,
  getGeneratedImages,
  deleteGeneratedImage,
} from "@/lib/firebaseStorage";

interface ImageLibraryContextType {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  saveImage: (
    imageUrl: string,
    prompt: string,
    chatId?: string,
    metadata?: any
  ) => Promise<void>;
  deleteImage: (imageId: string) => Promise<void>;
  refreshImages: () => Promise<void>;
}

const ImageLibraryContext = createContext<ImageLibraryContextType | undefined>(
  undefined
);

export function ImageLibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImages = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const userImages = await getGeneratedImages(user.uid);
      setImages(userImages);
    } catch (err) {
      console.error("Error loading images:", err);
      setError("Error al cargar las imágenes");
    } finally {
      setIsLoading(false);
    }
  };

  const saveImage = async (
    imageUrl: string,
    prompt: string,
    chatId?: string,
    metadata?: any
  ) => {
    if (!user?.uid) {
      setError("Usuario no autenticado");
      return;
    }

    try {
      setError(null);
      const savedImage = await saveGeneratedImage(
        imageUrl,
        prompt,
        user.uid,
        chatId,
        metadata
      );
      setImages((prev) => [savedImage, ...prev]);
    } catch (err) {
      console.error("Error saving image:", err);
      setError("Error al guardar la imagen");
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      setError(null);
      await deleteGeneratedImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Error al eliminar la imagen");
    }
  };

  const refreshImages = async () => {
    await loadImages();
  };

  useEffect(() => {
    if (user?.uid) {
      loadImages();
    } else {
      setImages([]);
    }
  }, [user?.uid]);

  const value: ImageLibraryContextType = {
    images,
    isLoading,
    error,
    saveImage,
    deleteImage,
    refreshImages,
  };

  return (
    <ImageLibraryContext.Provider value={value}>
      {children}
    </ImageLibraryContext.Provider>
  );
}

export function useImageLibrary() {
  const context = useContext(ImageLibraryContext);
  if (context === undefined) {
    throw new Error(
      "useImageLibrary must be used within an ImageLibraryProvider"
    );
  }
  return context;
}
