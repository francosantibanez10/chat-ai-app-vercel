"use client";

import React, { useEffect, useRef } from "react";

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  componentName,
  children,
}) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔍 [PERFORMANCE] ${componentName} renderizado #${renderCount.current} (${timeSinceLastRender}ms desde el último)`
      );

      // Alertar si hay demasiados re-renderizados
      if (renderCount.current > 10) {
        console.warn(
          `⚠️ [PERFORMANCE] ${componentName} se ha renderizado ${renderCount.current} veces - posible re-renderizado infinito`
        );
      }
    }
  });

  return <>{children}</>;
};

export default PerformanceMonitor;
