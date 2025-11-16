import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  size?: 'small' | 'medium' | 'large';
  demo?: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  size = 'medium',
  demo,
  className = '',
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      className={`
        relative group cursor-pointer
        bg-gradient-to-br from-gray-900/50 to-gray-800/50
        border border-gray-700/50 rounded-xl overflow-hidden
        backdrop-blur-sm hover:border-gray-600/50
        transition-all duration-300
        ${className}
      `}
    >
      {/* Background gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
      />

      {/* Content */}
      <div
        className={`relative p-6 h-full flex flex-col ${size === 'large' ? 'p-8' : size === 'small' ? 'p-4' : 'p-6'}`}
      >
        {/* Icon */}
        <div
          className={`
          inline-flex items-center justify-center rounded-lg mb-4
          bg-gradient-to-br ${gradient} ${size === 'large' ? 'w-16 h-16' : 'w-12 h-12'}
        `}
        >
          <Icon className={`text-white ${size === 'large' ? 'w-8 h-8' : 'w-6 h-6'}`} />
        </div>

        {/* Title */}
        <h3
          className={`
          font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text
          group-hover:bg-gradient-to-r ${gradient} transition-all duration-300
          ${size === 'large' ? 'text-2xl' : size === 'small' ? 'text-lg' : 'text-xl'}
        `}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={`
          text-gray-400 flex-1
          ${size === 'large' ? 'text-lg leading-relaxed' : size === 'small' ? 'text-sm' : 'text-base'}
        `}
        >
          {description}
        </p>

        {/* Demo video preview for large cards */}
        {demo && size === 'large' && (
          <div className="mt-6 rounded-lg overflow-hidden bg-gray-800">
            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <div className="text-gray-500 text-sm">Demo Preview</div>
            </div>
          </div>
        )}

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Border glow effect */}
        <div
          className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-br ${gradient} blur-xl -z-10 scale-75
        `}
        />
      </div>

      {/* Interactive indicator */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>
    </motion.div>
  );
}
