import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  count = 1,
  height = 'h-4',
  width = 'w-full',
  rounded = true,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={clsx(
            'bg-gray-700 animate-pulse',
            height,
            width,
            rounded && 'rounded',
            className
          )}
        />
      ))}
    </>
  );
};

// Skeleton específico para conversaciones
export const ConversationSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-3 p-3 rounded-lg"
        >
          <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
            <div className="h-3 bg-gray-700 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 40}%` }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 