import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../store/onboarding-store';
import { FirstShapePlayground } from './playgrounds/FirstShapePlayground';
import { BuildingBlocksPlayground } from './playgrounds/BuildingBlocksPlayground';
import { SketchToSolidPlayground } from './playgrounds/SketchToSolidPlayground';
import './onboarding.css';

const PLAYGROUND_CONFIGS = [
  {
    id: 'first-shape',
    title: '🎯 Your First Shape',
    description: 'Create a simple box and learn the basics',
    difficulty: 'easy' as const,
    estimatedTime: '3-5 min',
    requiredSkill: 'neophyte' as const,
    component: FirstShapePlayground,
  },
  {
    id: 'building-blocks',
    title: '🧱 Building Blocks',
    description: 'Combine shapes to create something amazing',
    difficulty: 'easy' as const,
    estimatedTime: '5-8 min',
    requiredSkill: 'neophyte' as const,
    component: BuildingBlocksPlayground,
  },
  {
    id: 'sketch-to-solid',
    title: '✏️ Sketch to Solid',
    description: 'Turn a 2D sketch into a 3D masterpiece',
    difficulty: 'medium' as const,
    estimatedTime: '8-12 min',
    requiredSkill: 'beginner' as const,
    component: SketchToSolidPlayground,
  },
];

interface PlaygroundCardProps {
  playground: (typeof PLAYGROUND_CONFIGS)[0];
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}

const PlaygroundCard: React.FC<PlaygroundCardProps> = ({
  playground,
  isActive,
  isCompleted,
  onSelect,
}) => (
  <motion.div
    className={`playground-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onSelect}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="playground-header">
      <h3 className="playground-title">{playground.title}</h3>
      {isCompleted && <div className="completed-badge">✅ Completed</div>}
    </div>

    <p className="playground-description">{playground.description}</p>

    <div className="playground-meta">
      <div className="difficulty-badge">
        {playground.difficulty === 'easy'
          ? '🟢 Easy'
          : playground.difficulty === 'medium'
            ? '🟡 Medium'
            : '🔴 Hard'}
      </div>
      <div className="time-estimate">⏱️ {playground.estimatedTime}</div>
    </div>

    <div className="playground-action">
      <motion.button
        className="start-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isCompleted ? 'Try Again' : isActive ? 'Continue' : 'Start'}
      </motion.button>
    </div>
  </motion.div>
);

export const PlaygroundManager: React.FC = () => {
  const { state, enterPlayground, exitPlayground } = useOnboardingStore();

  const availablePlaygrounds = useMemo(() => {
    return PLAYGROUND_CONFIGS.filter((playground) => {
      if (state.userSkillLevel === 'skip') return false;
      if (state.userSkillLevel === 'neophyte') return true;
      return playground.requiredSkill === 'beginner' || playground.id === 'first-shape';
    });
  }, [state.userSkillLevel]);

  const handlePlaygroundSelect = (playgroundId: string) => {
    enterPlayground(playgroundId);
  };

  const handleExitPlayground = () => {
    exitPlayground();
  };

  const isPlaygroundCompleted = (playgroundId: string) => {
    return state.completedTutorials.includes(`playground_${playgroundId}`);
  };

  // If in a specific playground, render that playground component
  if (state.currentPlayground) {
    const playground = PLAYGROUND_CONFIGS.find((p) => p.id === state.currentPlayground);
    if (playground) {
      const PlaygroundComponent = playground.component;
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={playground.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="playground-container"
          >
            <div className="playground-header-bar">
              <motion.button
                className="exit-playground-button"
                onClick={handleExitPlayground}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back to Playgrounds
              </motion.button>
              <h2 className="playground-active-title">{playground.title}</h2>
            </div>
            <PlaygroundComponent />
          </motion.div>
        </AnimatePresence>
      );
    }
  }

  // Render playground selection screen
  return (
    <motion.div
      className="playground-manager"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="playground-content">
        <motion.div
          className="playground-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="playground-title">🎮 Interactive Playgrounds</h1>
          <p className="playground-subtitle">
            Learn by doing! Choose an experience that matches your comfort level.
          </p>
        </motion.div>

        <motion.div
          className="playground-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {availablePlaygrounds.map((playground, index) => (
            <motion.div
              key={playground.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <PlaygroundCard
                playground={playground}
                isActive={state.currentPlayground === playground.id}
                isCompleted={isPlaygroundCompleted(playground.id)}
                onSelect={() => handlePlaygroundSelect(playground.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="playground-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="playground-encouragement">
            💡 Take your time, experiment, and don't worry about making mistakes!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
