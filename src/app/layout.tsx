import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ConversationsProvider } from "@/contexts/ConversationsContext";
import { PlanProvider } from "@/contexts/PlanContext";
import { ImageLibraryProvider } from "@/contexts/ImageLibraryContext";
import { Toaster } from "react-hot-toast";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import { FirebaseErrorBanner } from "@/components/FirebaseErrorBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Rubi - IA que entiende | Conversa, Analiza y Crea",
  description:
    "La inteligencia artificial más avanzada para conversar, analizar documentos y crear contenido original. Únete a miles de profesionales que ya confían en Rubi.",
  keywords:
    "IA, inteligencia artificial, chat, análisis, creación, productividad",
  authors: [{ name: "Rubi Team" }],
  openGraph: {
    title: "Rubi - IA que entiende",
    description:
      "Conversa, analiza y crea con la inteligencia artificial más avanzada",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rubi - IA que entiende",
    description:
      "Conversa, analiza y crea con la inteligencia artificial más avanzada",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} bg-gray-900 text-white antialiased`}
      >
        <PerformanceMonitor componentName="RootLayout">
          <AuthProvider>
            <SettingsProvider>
              <ConversationsProvider>
                <PlanProvider>
                  <ImageLibraryProvider>
                    <FirebaseErrorBanner />
                    {children}
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: "#1f2937",
                          color: "#fff",
                          border: "1px solid #374151",
                        },
                      }}
                    />
                  </ImageLibraryProvider>
                </PlanProvider>
              </ConversationsProvider>
            </SettingsProvider>
          </AuthProvider>
        </PerformanceMonitor>
      </body>
    </html>
  );
}
