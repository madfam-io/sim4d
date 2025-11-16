import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  disabled?: boolean;
}

export function GlowButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'medium',
  className,
  disabled = false,
}: GlowButtonProps) {
  const baseClasses = cn(
    'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300',
    'before:absolute before:inset-0 before:rounded-lg before:transition-opacity before:duration-300',
    'after:absolute after:inset-0 after:rounded-lg after:transition-opacity after:duration-300',
    'hover:scale-105 active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    {
      // Size variants
      'px-4 py-2 text-sm': size === 'small',
      'px-6 py-3 text-base': size === 'medium',
      'px-8 py-4 text-lg': size === 'large',

      // Style variants
      'bg-gradient-to-r from-blue-500 to-purple-500 text-white': variant === 'primary',
      'bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-gray-200':
        variant === 'secondary',
      'bg-transparent text-gray-300 hover:text-white': variant === 'ghost',

      // Glow effects
      'before:bg-gradient-to-r before:from-blue-500/50 before:to-purple-500/50 before:blur-xl before:opacity-0 hover:before:opacity-100':
        variant === 'primary',
      'before:bg-gray-500/30 before:blur-xl before:opacity-0 hover:before:opacity-100':
        variant === 'secondary',
    },
    className
  );

  const Component = href ? 'a' : 'button';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative inline-block"
    >
      <Component
        href={href}
        onClick={onClick}
        disabled={disabled}
        className={baseClasses}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        <span className="relative z-10">{children}</span>

        {/* Animated gradient border */}
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </Component>
    </motion.div>
  );
}
