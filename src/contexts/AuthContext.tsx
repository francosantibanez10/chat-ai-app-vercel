"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  Auth,
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
import { retryFirebase } from "@/lib/retryManager";
import { executeWithFirebaseFallback } from "@/lib/fallbackManager";
import { createError } from "@/lib/errorHandler";

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
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Función helper para traducir errores de Firebase a mensajes amigables
  const getUserFriendlyAuthError = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      "auth/user-not-found": "No existe una cuenta con este email",
      "auth/wrong-password": "Contraseña incorrecta",
      "auth/invalid-email": "Email inválido",
      "auth/user-disabled": "Esta cuenta ha sido deshabilitada",
      "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
      "auth/network-request-failed": "Error de conexión. Verifica tu internet",
      "auth/operation-not-allowed": "Esta operación no está permitida",
      "auth/weak-password": "La contraseña es muy débil",
      "auth/email-already-in-use": "Este email ya está registrado",
      "auth/invalid-credential": "Credenciales inválidas",
      "auth/account-exists-with-different-credential":
        "Ya existe una cuenta con este email",
      "auth/requires-recent-login": "Necesitas iniciar sesión nuevamente",
      "auth/provider-already-linked": "Esta cuenta ya está vinculada",
      "auth/no-such-provider": "Proveedor de autenticación no encontrado",
      "auth/invalid-verification-code": "Código de verificación inválido",
      "auth/invalid-verification-id": "ID de verificación inválido",
      "auth/missing-verification-code": "Código de verificación requerido",
      "auth/missing-verification-id": "ID de verificación requerido",
      "auth/quota-exceeded": "Se ha excedido la cuota de solicitudes",
      "auth/unverified-email": "Email no verificado",
      "auth/app-not-authorized": "Aplicación no autorizada",
      "auth/captcha-check-failed": "Verificación de captcha fallida",
      "auth/invalid-phone-number": "Número de teléfono inválido",
      "auth/missing-phone-number": "Número de teléfono requerido",
      "auth/invalid-recaptcha-token": "Token de reCAPTCHA inválido",
      "auth/missing-recaptcha-token": "Token de reCAPTCHA requerido",
      "auth/invalid-app-credential": "Credencial de aplicación inválida",
      "auth/missing-app-credential": "Credencial de aplicación requerida",
      "auth/session-expired": "Sesión expirada",
      "auth/credential-already-in-use": "Credencial ya en uso",
      "auth/tenant-id-mismatch": "ID de inquilino no coincide",
      "auth/unsupported-tenant-operation":
        "Operación de inquilino no soportada",
      "auth/invalid-tenant-id": "ID de inquilino inválido",
      "auth/admin-restricted-operation":
        "Operación restringida por administrador",
      "auth/argument-error": "Error en los argumentos proporcionados",
      "auth/invalid-api-key": "Clave de API inválida",
      "auth/invalid-user-token": "Token de usuario inválido",
      "auth/invalid-tenant-type": "Tipo de inquilino inválido",
      "auth/unauthorized-domain": "Dominio no autorizado",
      "auth/function-disabled": "Función deshabilitada",
      "auth/invalid-dynamic-link-domain": "Dominio de enlace dinámico inválido",
      "auth/duplicate-credential": "Credencial duplicada",
      "auth/maximum-second-factor-count-exceeded":
        "Se excedió el máximo de factores de segundo factor",
      "auth/second-factor-already-in-use": "Factor de segundo factor ya en uso",
      "auth/maximum-user-count-exceeded": "Se excedió el máximo de usuarios",
      "auth/operation-not-supported-in-this-environment":
        "Operación no soportada en este entorno",
      "auth/unsupported-first-factor": "Primer factor no soportado",
      "auth/user-mismatch": "Usuario no coincide",
      "auth/requires-multi-factor":
        "Se requiere autenticación de múltiples factores",
      "auth/blocking-function-error": "Error en función de bloqueo",
      "auth/recaptcha-not-enabled": "reCAPTCHA no habilitado",
      "auth/missing-recaptcha-version": "Versión de reCAPTCHA requerida",
      "auth/invalid-recaptcha-version": "Versión de reCAPTCHA inválida",
      "auth/invalid-recaptcha-action": "Acción de reCAPTCHA inválida",
      "auth/missing-client-type": "Tipo de cliente requerido",
      "auth/resource-exhausted": "Recurso agotado",
      "auth/deadline-exceeded": "Tiempo límite excedido",
      "auth/internal-error": "Error interno del servidor",
      "auth/unavailable": "Servicio no disponible",
      "auth/data-loss": "Pérdida de datos",
      "auth/failed-precondition": "Condición previa fallida",
      "auth/aborted": "Operación abortada",
      "auth/out-of-range": "Valor fuera de rango",
      "auth/unimplemented": "Operación no implementada",
      "auth/not-found": "Recurso no encontrado",
      "auth/already-exists": "Recurso ya existe",
      "auth/permission-denied": "Permiso denegado",
      "auth/unauthenticated": "No autenticado",
      "auth/cancelled": "Operación cancelada",
      "auth/unknown": "Error desconocido",
    };

    return errorMessages[errorCode] || "Ocurrió un error inesperado";
  };

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
            // No hay usuario autenticado - no hacer autenticación anónima automática
            console.log("🔓 No hay usuario autenticado");
            setUser(null);
            setIsAnonymous(false);
            setLoading(false);
          } else {
            console.log(
              "✅ Usuario autenticado:",
              user.uid,
              user.isAnonymous ? "(anónimo)" : ""
            );
            setUser(user);
            setIsAnonymous(user.isAnonymous);
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

    const result = await retryFirebase(async () => {
      try {
        return await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        // Crear error estructurado
        createError(
          error,
          { userId: user?.uid, endpoint: "signIn" },
          "high",
          "authentication"
        );
        throw new Error(getUserFriendlyAuthError(error.code));
      }
    }, "User Sign In");

    if (!result.success) {
      throw result.error || new Error("Error al iniciar sesión");
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!auth || !firebaseAvailable) {
      throw new Error(
        "Firebase Auth is not available. Please check your configuration."
      );
    }

    const result = await retryFirebase(async () => {
      try {
        return await createUserWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        // Crear error estructurado
        createError(
          error,
          { userId: user?.uid, endpoint: "signUp" },
          "high",
          "authentication"
        );
        throw new Error(getUserFriendlyAuthError(error.code));
      }
    }, "User Sign Up");

    if (!result.success) {
      throw result.error || new Error("Error al crear cuenta");
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
      setIsAnonymous(false);
      console.log("🔓 Sesión cerrada exitosamente");
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
      const result = await signInAnonymously(auth);
      setIsAnonymous(true);
      console.log("✅ Autenticación anónima exitosa:", result.user.uid);
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
    signInAnonymously: signInAnonymouslyAuth,
    firebaseAvailable,
    recaptchaVerifier,
    isAnonymous,
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
