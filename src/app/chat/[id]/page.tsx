"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Chat from "@/components/Chat";
import ProtectedRoute from "@/components/ProtectedRoute";
import PricingPlans from "@/components/PricingPlans";
import CheckoutModal from "@/components/CheckoutModal";
import { useConversations } from "@/contexts/ConversationsContext";

export default function ChatWithIdPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentConversation } = useConversations();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ✅ DETECTAR SI ES MÓVIL: Cerrar sidebar automáticamente en móviles
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // md breakpoint
        setSidebarOpen(false);
      }
    };

    // Cerrar sidebar en móviles al cargar
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
      <div className="flex h-screen bg-gray-900">
        {/* Header compartido con línea única */}
        <div className="absolute top-0 left-0 right-0 h-12 z-30 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-700"></div>
        </div>

        {/* Sidebar - Overlay en mobile, colapsable en desktop */}
        <div
          className={`${
            sidebarOpen
              ? "fixed inset-y-0 left-0 w-64 z-50 md:relative md:inset-auto md:w-auto"
              : "hidden"
          } md:block ${
            sidebarCollapsed ? "md:w-16" : "md:w-48 lg:w-52"
          } transition-all duration-300 ease-in-out`}
        >
          {/* Overlay para cerrar sidebar en móviles */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Sidebar
            selectedChatId={currentConversation?.id}
            onClose={() => setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            onOpenPlans={handleOpenPlans}
            onChatSelect={handleChatSelect}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <Chat onMenuClick={() => setSidebarOpen(true)} conversationId={id} />
        </div>

        {/* Modales */}
        {showPlans && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
      </div>
    </ProtectedRoute>
  );
}
