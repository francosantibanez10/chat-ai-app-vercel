"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  PhoneAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signInAnonymously,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<{ verificationId: string }>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  firebaseAvailable: boolean;
  recaptchaVerifier: RecaptchaVerifier | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Verificar si Firebase auth está disponible
    if (!auth) {
      console.warn(
        "⚠️ Firebase Auth not available - authentication features will be disabled"
      );
      setFirebaseAvailable(false);
      setLoading(false);
      return;
    }

    setFirebaseAvailable(true);

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            // Si no hay usuario, intentar autenticación anónima
            try {
              console.log("🔄 Iniciando autenticación anónima...");
              await signInAnonymously(auth);
            } catch (error) {
              console.error("❌ Error en autenticación anónima:", error);
            }
          } else {
            console.log("✅ Usuario autenticado:", user.uid);
            setUser(user);
            setLoading(false);
          }
        },
        (error) => {
          console.error("❌ Firebase Auth error:", error);
          setFirebaseAvailable(false);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("❌ Firebase Auth initialization error:", error);
      setFirebaseAvailable(false);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth || !firebaseAvailable) {
      throw new Error(
        "Firebase Auth is not available. Please check your configuration."
      );
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!auth || !firebaseAvailable) {
      throw new Error(
        "Firebase Auth is not available. Please check your configuration."
      );
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    if (!auth || !firebaseAvailable) {
      throw new Error(
        "Firebase Auth is not available. Please check your configuration."
      );
    }

    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth || !firebaseAvailable) {
      throw new Error(
        "Firebase Auth is not available. Please check your configuration."
      );
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInWithGitHub = async () => {
    if (!auth || !firebaseAvailable) {
      throw new Error(
        "Firebase Auth is not available. Please check your configuration."
      );
    }

    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    if (!auth || !firebaseAvailable) {
      throw new Error(
        "Firebase Auth is not available. Please check your configuration."
      );
    }

    try {
      // Crear reCAPTCHA verifier si no existe
      if (!recaptchaVerifier) {
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved");
          },
        });
        setRecaptchaVerifier(verifier);
      }

      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier!
      );

      return { verificationId };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const verifyPhoneCode = async (verificationId: string, code: string) => {
    if (!auth || !firebaseAvailable) {
      throw new Error(
        "Firebase Auth is not available. Please check your configuration."
      );
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInAnonymouslyAuth = async () => {
    if (!auth || !firebaseAvailable) {
      throw new Error(
        "Firebase Auth is not available. Please check your configuration."
      );
    }

    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    signInWithGoogle,
    signInWithGitHub,
    signInWithPhone,
    verifyPhoneCode,
    signInAnonymously,
    firebaseAvailable,
    recaptchaVerifier,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
