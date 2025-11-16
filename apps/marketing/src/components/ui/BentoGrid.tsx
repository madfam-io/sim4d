import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px]',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  onClick?: () => void;
}

export function BentoCard({
  children,
  className,
  gradient = 'from-gray-800 to-gray-900',
  onClick,
}: BentoCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-br backdrop-blur-xl',
        'border border-gray-800/50',
        'transition-all duration-300',
        'hover:shadow-2xl hover:shadow-purple-500/10',
        'cursor-pointer',
        gradient,
        className
      )}
      onClick={onClick}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      </div>

      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
