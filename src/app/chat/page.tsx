"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Chat from "@/components/Chat";
import ProtectedRoute from "@/components/ProtectedRoute";
import PricingPlans from "@/components/PricingPlans";
import CheckoutModal from "@/components/CheckoutModal";
import { useConversations } from "@/contexts/ConversationsContext";
import { ConversationSummary } from "@/lib/firebase/conversations";
import { AnonymousTrialBanner } from "@/components/AnonymousTrialBanner";
import { ErrorDashboardButton } from "@/components/ErrorDashboardButton";

export default function ChatPage() {
  const { currentConversation } = useConversations();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ CERRAR SIDEBAR AL SELECCIONAR CHAT EN MÓVILES
  const handleChatSelect = (chatId: string) => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const [showPlans, setShowPlans] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    planId: string;
    planName: string;
    price: number;
    interval: "month" | "year";
  }>({
    isOpen: false,
    planId: "",
    planName: "",
    price: 0,
    interval: "month",
  });

  const toggleSidebar = () => {
    console.log(
      "Toggle sidebar - current collapsed:",
      sidebarCollapsed,
      "new collapsed:",
      !sidebarCollapsed
    );
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleOpenPlans = () => {
    setShowPlans(true);
    setSidebarOpen(false);
  };

  const handlePlanSelect = (
    planId: string,
    planName: string,
    price: number,
    interval: "month" | "year"
  ) => {
    setCheckoutModal({
      isOpen: true,
      planId,
      planName,
      price,
      interval,
    });
    setShowPlans(false);
  };

  return (
    <ProtectedRoute>
      <AnonymousTrialBanner />
      <div className="flex h-screen bg-gray-900">
        {/* Sidebar - Overlay en mobile, colapsable en desktop */}
        <div className={`${sidebarOpen || !isMobile ? "block" : "hidden"}`}>
          <Sidebar
            key="sidebar"
            selectedChatId={currentConversation?.id}
            onClose={() => setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            onOpenPlans={handleOpenPlans}
            onChatSelect={handleChatSelect}
          />
        </div>

        {/* Chat Area (Header incluido aquí) */}
        <div
          className={`flex-1 flex flex-col h-screen transition-all duration-300 ${
            sidebarCollapsed ? "md:ml-16" : "md:ml-[280px]"
          }`}
        >
          <Chat
            onMenuClick={() => setSidebarOpen(true)}
            conversationId={currentConversation?.id}
          />
        </div>

        {/* Modales */}
        {showPlans && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Planes de Suscripción
                </h2>
                <button
                  onClick={() => setShowPlans(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <PricingPlans />
            </div>
          </div>
        )}

        {checkoutModal.isOpen && (
          <CheckoutModal
            isOpen={checkoutModal.isOpen}
            onClose={() =>
              setCheckoutModal({ ...checkoutModal, isOpen: false })
            }
            planId={checkoutModal.planId}
            planName={checkoutModal.planName}
            price={checkoutModal.price}
            interval={checkoutModal.interval}
          />
        )}
        />

        {/* Botón del Dashboard de Errores */}
        <ErrorDashboardButton />
      </div>
    </ProtectedRoute>
  );
}
