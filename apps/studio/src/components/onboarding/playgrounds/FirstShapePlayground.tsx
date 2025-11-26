import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useOnboardingStore } from '../../../store/onboarding-store';
import '../onboarding.css';

interface ObjectiveProps {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  onComplete: () => void;
}

const Objective: React.FC<ObjectiveProps> = ({
  title,
  description,
  completed,
  current,
  onComplete,
}) => (
  <motion.div
    className={`objective ${completed ? 'completed' : ''} ${current ? 'current' : ''}`}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="objective-header">
      <div className="objective-status">{completed ? '✅' : current ? '🎯' : '⏳'}</div>
      <h4 className="objective-title">{title}</h4>
    </div>
    <p className="objective-description">{description}</p>
    {current && !completed && (
      <motion.button
        className="complete-objective-button"
        onClick={onComplete}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Mark as Complete
      </motion.button>
    )}
  </motion.div>
);

export const FirstShapePlayground: React.FC = () => {
  const { completeObjective, completeStep } = useOnboardingStore();
  const [currentObjective, setCurrentObjective] = useState(0);
  const [completedObjectives, setCompletedObjectives] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const objectives = [
    {
      id: 'locate-node-panel',
      title: 'Find the Node Panel',
      description:
        'Look for the sidebar with building blocks (nodes) on the left side of the screen.',
    },
    {
      id: 'drag-box-node',
      title: 'Create a Box Node',
      description: 'Find the "Box" node in the panel and drag it to the main canvas.',
    },
    {
      id: 'set-dimensions',
      title: 'Set Box Dimensions',
      description: 'Click on the box node and set its width, height, and depth to your liking.',
    },
    {
      id: 'view-3d-result',
      title: 'See Your Creation',
      description: 'Look at the 3D viewport to see your first shape come to life!',
    },
    {
      id: 'celebrate',
      title: 'Celebrate Your Success!',
      description: "You've created your first 3D shape in Sim4D! 🎉",
    },
  ];

  const handleObjectiveComplete = useCallback(
    (objectiveIndex: number) => {
      const objective = objectives[objectiveIndex];
      if (!objective) return;

      setCompletedObjectives((prev) => new Set([...prev, objectiveIndex]));
      completeObjective('first-shape', objective.id);

      // Show celebration
      const messages = [
        'Great job! 🎉',
        "You're doing amazing! ✨",
        'Keep it up! 🚀',
        'Fantastic work! 🌟',
        "You're a natural! 💫",
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      if (randomMessage) {
        setCelebrationMessage(randomMessage);
      }
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);

      // Move to next objective
      if (objectiveIndex < objectives.length - 1) {
        setTimeout(() => setCurrentObjective(objectiveIndex + 1), 1000);
      } else {
        // Completed all objectives
        setTimeout(() => {
          completeStep('playground_first-shape');
          setCelebrationMessage("🎊 Playground Complete! You're ready for more advanced shapes!");
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 5000);
        }, 1000);
      }
    },
    [objectives, completeObjective, completeStep]
  );

  const isObjectiveCompleted = (index: number) => completedObjectives.has(index);
  const isObjectiveCurrent = (index: number) =>
    index === currentObjective && !isObjectiveCompleted(index);

  return (
    <div className="first-shape-playground">
      {showCelebration && <Confetti recycle={false} numberOfPieces={200} />}

      <div className="playground-layout">
        {/* Instructions Panel */}
        <div className="instructions-panel">
          <motion.div
            className="instructions-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>🎯 Your First Shape</h2>
            <p>Let's create a simple 3D box together! Follow these steps:</p>
          </motion.div>

          <div className="objectives-list">
            {objectives.map((objective, index) => (
              <Objective
                key={objective.id}
                id={objective.id}
                title={objective.title}
                description={objective.description}
                completed={isObjectiveCompleted(index)}
                current={isObjectiveCurrent(index)}
                onComplete={() => handleObjectiveComplete(index)}
              />
            ))}
          </div>

          <motion.div
            className="help-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h4>💡 Need Help?</h4>
            <div className="help-tips">
              <p>
                <strong>🔍 Can't find the Node Panel?</strong>
                <br />
                It should be on the left side of the screen with colorful blocks.
              </p>

              <p>
                <strong>🎲 Looking for the Box node?</strong>
                <br />
                Look for a cube icon in the "Primitives" or "Basic Shapes" section.
              </p>

              <p>
                <strong>👁️ Where's the 3D view?</strong>
                <br />
                The 3D viewport is usually the large area on the right side of the screen.
              </p>
            </div>
          </motion.div>

          <div className="progress-indicator">
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(completedObjectives.size / objectives.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="progress-text">
              {completedObjectives.size} of {objectives.length} steps completed
            </p>
          </div>
        </div>

        {/* Main Workspace Placeholder */}
        <div className="workspace-placeholder">
          <motion.div
            className="workspace-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="workspace-message">
              <h3>🏗️ Your Workspace</h3>
              <p>
                This is where the main Sim4D interface will be integrated.
                <br />
                For now, follow the steps on the left to simulate the experience!
              </p>

              <div className="simulation-area">
                <motion.div
                  className="node-panel-demo"
                  animate={{
                    boxShadow: isObjectiveCurrent(0)
                      ? '0 0 20px rgba(16, 185, 129, 0.5)'
                      : '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <h4>📦 Node Panel</h4>
                  <div className="demo-nodes">
                    <motion.div
                      className="demo-node box-node"
                      animate={{
                        scale: isObjectiveCurrent(1) ? 1.1 : 1,
                        boxShadow: isObjectiveCurrent(1)
                          ? '0 0 15px rgba(99, 102, 241, 0.5)'
                          : '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      🟫 Box
                    </motion.div>
                    <div className="demo-node">🔴 Sphere</div>
                    <div className="demo-node">🔺 Cylinder</div>
                  </div>
                </motion.div>

                <motion.div
                  className="viewport-demo"
                  animate={{
                    boxShadow: isObjectiveCurrent(3)
                      ? '0 0 20px rgba(16, 185, 129, 0.5)'
                      : '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <h4>👁️ 3D Viewport</h4>
                  <div className="demo-viewport">
                    <AnimatePresence>
                      {completedObjectives.has(1) && (
                        <motion.div
                          className="demo-box"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          📦
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="celebration-overlay"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="celebration-message"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              {celebrationMessage}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
