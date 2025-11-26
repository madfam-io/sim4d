import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../store/onboarding-store';
import type { SkillLevel } from '../../types/onboarding';
import './onboarding.css';

interface ProgressTrackerProps {
  compact?: boolean;
  position?: 'top' | 'bottom' | 'sidebar';
  showDetails?: boolean;
}

interface MilestoneData {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredSteps: string[];
}

const getMilestones = (skillLevel: SkillLevel): MilestoneData[] => {
  const baseMilestones = [
    {
      id: 'interface-tour',
      title: 'Interface Mastery',
      description: 'Learn your way around Sim4D Studio',
      icon: '🧭',
      requiredSteps: ['interface_tour'],
    },
    {
      id: 'first-shape',
      title: 'First Creation',
      description: 'Build your very first 3D shape',
      icon: '🎯',
      requiredSteps: ['playground_first-shape'],
    },
  ];

  if (skillLevel === 'neophyte') {
    return [
      ...baseMilestones,
      {
        id: 'building-blocks',
        title: 'Shape Combination',
        description: 'Combine shapes to create complex forms',
        icon: '🧱',
        requiredSteps: ['playground_building-blocks'],
      },
      {
        id: 'mastery',
        title: 'CAD Mastery',
        description: "You're ready to create anything!",
        icon: '🏆',
        requiredSteps: ['playground_sketch-to-solid'],
      },
    ];
  }

  if (skillLevel === 'beginner') {
    return [
      ...baseMilestones,
      {
        id: 'advanced-techniques',
        title: 'Advanced Techniques',
        description: 'Master professional CAD workflows',
        icon: '🚀',
        requiredSteps: ['playground_sketch-to-solid'],
      },
    ];
  }

  return baseMilestones;
};

interface MilestoneProps {
  milestone: MilestoneData;
  isCompleted: boolean;
  isActive: boolean;
  completionPercentage: number;
  compact?: boolean;
}

const Milestone: React.FC<MilestoneProps> = ({
  milestone,
  isCompleted,
  isActive,
  completionPercentage,
  compact,
}) => (
  <motion.div
    className={`milestone ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${compact ? 'compact' : ''}`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="milestone-icon-container">
      <div className="milestone-icon">{milestone.icon}</div>
      {isCompleted && (
        <motion.div
          className="completion-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          ✅
        </motion.div>
      )}
      {isActive && (
        <motion.div
          className="progress-ring"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: completionPercentage / 100 }}
          transition={{ duration: 0.5 }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="28"
              stroke="rgba(99, 102, 241, 0.2)"
              strokeWidth="2"
              fill="none"
            />
            <motion.circle
              cx="30"
              cy="30"
              r="28"
              stroke="#6366f1"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="175.93"
              strokeDashoffset="175.93"
              animate={{
                strokeDashoffset: 175.93 - (175.93 * completionPercentage) / 100,
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        </motion.div>
      )}
    </div>

    {!compact && (
      <div className="milestone-content">
        <h4 className="milestone-title">{milestone.title}</h4>
        <p className="milestone-description">{milestone.description}</p>
      </div>
    )}
  </motion.div>
);

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  compact = false,
  position = 'sidebar',
  showDetails = true,
}) => {
  const { state, progressPercentage } = useOnboardingStore();

  const milestones = useMemo(() => getMilestones(state.userSkillLevel), [state.userSkillLevel]);

  const milestoneProgress = useMemo(() => {
    return milestones.map((milestone) => {
      const completedSteps = milestone.requiredSteps.filter((stepId) =>
        state.completedTutorials.includes(stepId)
      );
      const isCompleted = completedSteps.length === milestone.requiredSteps.length;
      const completionPercentage = (completedSteps.length / milestone.requiredSteps.length) * 100;

      return {
        ...milestone,
        isCompleted,
        completionPercentage,
        isActive: !isCompleted && completedSteps.length > 0,
      };
    });
  }, [milestones, state.completedTutorials]);

  const currentMilestone =
    milestoneProgress.find((m) => m.isActive) || milestoneProgress.find((m) => !m.isCompleted);

  const overallProgress = progressPercentage();
  const completedMilestones = milestoneProgress.filter((m) => m.isCompleted).length;

  if (state.userSkillLevel === 'skip') return null;

  return (
    <div className={`progress-tracker progress-${position} ${compact ? 'compact' : ''}`}>
      <AnimatePresence mode="wait">
        {showDetails && (
          <motion.div
            className="progress-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="progress-title">Your Journey</h3>
            <div className="progress-summary">
              <div className="overall-progress">
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="progress-text">{overallProgress}% Complete</span>
              </div>
              <div className="milestone-count">
                {completedMilestones} of {milestones.length} milestones
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="milestones-container">
        {milestoneProgress.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{
              opacity: 0,
              x: position === 'sidebar' ? -20 : 0,
              y: position !== 'sidebar' ? 20 : 0,
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Milestone
              milestone={milestone}
              isCompleted={milestone.isCompleted}
              isActive={milestone.isActive}
              completionPercentage={milestone.completionPercentage}
              compact={compact}
            />
          </motion.div>
        ))}
      </div>

      {currentMilestone && showDetails && (
        <motion.div
          className="current-milestone-highlight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="current-milestone-content">
            <div className="current-milestone-icon">🎯</div>
            <div>
              <h4 className="current-milestone-title">Next: {currentMilestone.title}</h4>
              <p className="current-milestone-description">{currentMilestone.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
