"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Send } from "lucide-react";

interface FeedbackWidgetProps {
  messageId: string;
  onFeedback: (
    type: "positive" | "negative" | "neutral",
    rating: number,
    reason?: string
  ) => void;
  className?: string;
}

export default function FeedbackWidget({
  messageId,
  onFeedback,
  className = "",
}: FeedbackWidgetProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "positive" | "negative" | "neutral" | null
  >(null);
  const [rating, setRating] = useState(0);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (type: "positive" | "negative" | "neutral") => {
    setFeedbackType(type);
    setShowFeedback(true);

    if (type === "positive") {
      setRating(5);
    } else if (type === "negative") {
      setRating(1);
    } else {
      setRating(3);
    }
  };

  const handleSubmit = async () => {
    if (!feedbackType) return;

    setIsSubmitting(true);
    try {
      await onFeedback(feedbackType, rating, reason);
      setShowFeedback(false);
      setFeedbackType(null);
      setRating(0);
      setReason("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowFeedback(false);
    setFeedbackType(null);
    setRating(0);
    setReason("");
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {!showFeedback ? (
        <>
          <button
            onClick={() => handleFeedback("positive")}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-colors"
            title="Respuesta útil"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleFeedback("negative")}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            title="Respuesta no útil"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleFeedback("neutral")}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-900/20 rounded-lg transition-colors"
            title="Dar feedback detallado"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-200">
              {feedbackType === "positive" &&
                "¿Qué te gustó de esta respuesta?"}
              {feedbackType === "negative" && "¿Qué se puede mejorar?"}
              {feedbackType === "neutral" && "Danos tu opinión"}
            </h4>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              Calificación (1-5):
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                    star <= rating
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              Comentario (opcional):
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explica tu feedback..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
