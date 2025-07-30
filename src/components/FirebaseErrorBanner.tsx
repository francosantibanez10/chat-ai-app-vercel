"use client";

import { useAuth } from '@/contexts/AuthContext';

export function FirebaseErrorBanner() {
  const { firebaseAvailable, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (firebaseAvailable) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Configuración de Firebase requerida
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              Firebase no está configurado correctamente. Para usar las funciones de autenticación, 
              asegúrate de que todas las variables de entorno de Firebase estén configuradas en tu archivo 
              <code className="bg-red-100 px-1 rounded">.env.local</code>.
            </p>
            <div className="mt-2">
              <p className="font-medium">Variables requeridas:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><code className="bg-red-100 px-1 rounded text-xs">NEXT_PUBLIC_FIREBASE_API_KEY</code></li>
                <li><code className="bg-red-100 px-1 rounded text-xs">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code></li>
                <li><code className="bg-red-100 px-1 rounded text-xs">NEXT_PUBLIC_FIREBASE_PROJECT_ID</code></li>
                <li><code className="bg-red-100 px-1 rounded text-xs">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</code></li>
                <li><code className="bg-red-100 px-1 rounded text-xs">NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</code></li>
                <li><code className="bg-red-100 px-1 rounded text-xs">NEXT_PUBLIC_FIREBASE_APP_ID</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 