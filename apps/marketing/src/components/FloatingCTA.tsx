import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play } from 'lucide-react';
import { GlowButton } from './ui/GlowButton';

interface FloatingCTAProps {
  showDelay?: number;
  hideOnScroll?: boolean;
}

export function FloatingCTA({ showDelay = 3000, hideOnScroll = false }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Check if user has previously dismissed the CTA
    const dismissed = localStorage.getItem('sim4d-cta-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show CTA after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [showDelay]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('sim4d-cta-dismissed', 'true');
  };

  const handleDemoClick = () => {
    // Scroll to demo section
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hide if scrolled too far up or if hideOnScroll is true
  const shouldHide = isDismissed || (hideOnScroll && scrollY < 500);

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 100 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl backdrop-blur-md">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-70" />

            {/* Content */}
            <div className="relative p-6">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">Ready to Build?</h3>
                <p className="text-sm text-gray-300">
                  Experience parametric CAD in your browser. No installation required.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">78+</div>
                  <div className="text-xs text-gray-400">Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">∞</div>
                  <div className="text-xs text-gray-400">Parameters</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">0</div>
                  <div className="text-xs text-gray-400">Setup</div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <GlowButton
                  href={import.meta.env.VITE_STUDIO_URL || 'http://localhost:5173'}
                  variant="primary"
                  size="small"
                  className="w-full flex items-center justify-center gap-2"
                >
                  Launch Studio
                  <ExternalLink className="w-3 h-3" />
                </GlowButton>
                <button
                  onClick={handleDemoClick}
                  className="w-full px-3 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-3 h-3" />
                  Watch Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>✓ Open Source</span>
                  <span>✓ MPL 2.0 License</span>
                  <span>✓ No Signup</span>
                </div>
              </div>
            </div>

            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-pulse" />
            </div>
          </div>

          {/* Pulse indicator */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
