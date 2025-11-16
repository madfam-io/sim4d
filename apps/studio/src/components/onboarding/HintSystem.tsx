import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../store/onboarding-store';
import './onboarding.css';

export interface Hint {
  id: string;
  title: string;
  content: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  trigger?: string; // CSS selector or element ID to attach hint to
  delay?: number; // Delay in seconds before showing
  dismissible?: boolean;
  showOnce?: boolean; // Only show once per session
  priority?: 'low' | 'medium' | 'high';
}

interface HintSystemProps {
  hints: Hint[];
  enabled?: boolean;
}

const HINT_POSITIONS = {
  'top-left': { top: '2rem', left: '2rem' },
  'top-right': { top: '2rem', right: '2rem' },
  'bottom-left': { bottom: '2rem', left: '2rem' },
  'bottom-right': { bottom: '2rem', right: '2rem' },
  center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
};

interface HintCardProps {
  hint: Hint;
  onDismiss: () => void;
  onToggleHints: () => void;
}

const HintCard = React.forwardRef<HTMLDivElement, HintCardProps>(
  ({ hint, onDismiss, onToggleHints }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <motion.div
        ref={ref}
        className={`hint-card hint-${hint.priority || 'medium'}`}
        style={HINT_POSITIONS[hint.position]}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3 }}
        layout
      >
        <div className="hint-header">
          <div className="hint-icon">💡</div>
          <h4 className="hint-title">{hint.title}</h4>
          <div className="hint-actions">
            <motion.button
              className="hint-expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '−' : '+'}
            </motion.button>
            {hint.dismissible !== false && (
              <motion.button
                className="hint-dismiss-button"
                onClick={onDismiss}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Dismiss hint"
              >
                ×
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="hint-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p>{hint.content}</p>
              <div className="hint-footer">
                <motion.button
                  className="hint-settings-button"
                  onClick={onToggleHints}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ⚙️ Hint Settings
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

HintCard.displayName = 'HintCard';

export const HintSystem: React.FC<HintSystemProps> = ({ hints, enabled = true }) => {
  const { state, toggleHints, trackEvent } = useOnboardingStore();
  const [activeHints, setActiveHints] = useState<Hint[]>([]);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !state.showHints) return;

    const showHints = async () => {
      for (const hint of hints) {
        // Skip if already dismissed and showOnce is true
        if (hint.showOnce && dismissedHints.has(hint.id)) continue;

        // Apply delay if specified
        if (hint.delay) {
          await new Promise((resolve) => setTimeout(resolve, hint.delay! * 1000));
        }

        // Check if hint should still be shown (user might have disabled hints)
        if (!state.showHints) break;

        setActiveHints((prev) => {
          if (prev.find((h) => h.id === hint.id)) return prev;
          return [...prev, hint];
        });

        // Track hint shown event
        trackEvent({
          type: 'hint_requested',
          metadata: {
            hint_id: hint.id,
            hint_title: hint.title,
            hint_priority: hint.priority || 'medium',
          },
        });
      }
    };

    showHints();
  }, [hints, enabled, state.showHints, dismissedHints, trackEvent]);

  const handleDismissHint = (hintId: string) => {
    setActiveHints((prev) => prev.filter((h) => h.id !== hintId));
    setDismissedHints((prev) => new Set([...prev, hintId]));

    trackEvent({
      type: 'hint_requested',
      metadata: {
        hint_id: hintId,
        action: 'dismissed',
      },
    });
  };

  const handleToggleHints = () => {
    toggleHints();
    trackEvent({
      type: 'hint_requested',
      metadata: {
        action: 'settings_toggled',
        new_state: !state.showHints,
      },
    });
  };

  if (!enabled || !state.showHints) return null;

  return (
    <div className="hint-system">
      <AnimatePresence mode="popLayout">
        {activeHints
          .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
          })
          .map((hint) => (
            <HintCard
              key={hint.id}
              hint={hint}
              onDismiss={() => handleDismissHint(hint.id)}
              onToggleHints={handleToggleHints}
            />
          ))}
      </AnimatePresence>

      {/* Global Hint Toggle Button */}
      <motion.div
        className="hint-toggle-global"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5 }} // Show after 5 seconds
      >
        <motion.button
          className="global-hint-button"
          onClick={handleToggleHints}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Toggle hints"
        >
          💡
        </motion.button>
      </motion.div>
    </div>
  );
};
