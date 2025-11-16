import React, { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '../../store/onboarding-store';
import { WelcomeScreen } from './WelcomeScreen';
import { GuidedTour } from './GuidedTour';
import { PlaygroundManager } from './PlaygroundManager';
import { HintSystem, type Hint } from './HintSystem';
import { ProgressTracker } from './ProgressTracker';
import './onboarding.css';

const getHintsForCurrentState = (state: any): Hint[] => {
  const hints: Hint[] = [];

  // Welcome screen hints
  if (state.isFirstVisit && !state.tourMode && !state.currentPlayground) {
    hints.push({
      id: 'welcome-skill-selection',
      title: 'Choose Your Path',
      content:
        "Select your experience level to get a personalized onboarding experience. Don't worry - you can always change this later!",
      position: 'center',
      delay: 2,
      priority: 'medium',
      showOnce: true,
    });
  }

  // Tour mode hints
  if (state.tourMode) {
    hints.push({
      id: 'tour-navigation',
      title: 'Tour Navigation',
      content:
        'Use the Next/Previous buttons to navigate through the tour. You can skip the tour at any time if you prefer to explore on your own.',
      position: 'top-right',
      delay: 1,
      priority: 'low',
    });

    if (state.userSkillLevel === 'neophyte') {
      hints.push({
        id: 'tour-beginner-tip',
        title: 'Take Your Time',
        content:
          "Since you're new to 3D modeling, don't rush through the tour. Each step builds on the previous one.",
        position: 'bottom-left',
        delay: 3,
        priority: 'medium',
      });
    }
  }

  // Playground hints
  if (state.currentPlayground) {
    hints.push({
      id: 'playground-help',
      title: 'Need Help?',
      content:
        'If you get stuck, look for the help section in the instructions panel. You can also click the hint button to toggle these helpful tips.',
      position: 'bottom-right',
      delay: 5,
      priority: 'low',
    });

    if (state.currentPlayground === 'first-shape') {
      hints.push({
        id: 'first-shape-encouragement',
        title: 'Your First Shape',
        content:
          "Don't worry about making mistakes! This is a safe space to learn and experiment. The goal is to get comfortable with the interface.",
        position: 'top-left',
        delay: 10,
        priority: 'medium',
      });
    }
  }

  // General hints for main app
  if (!state.isFirstVisit && !state.tourMode && !state.currentPlayground) {
    hints.push({
      id: 'main-app-welcome-back',
      title: 'Welcome Back!',
      content:
        'You can restart the onboarding process anytime from the help menu, or jump into interactive playgrounds to practice specific skills.',
      position: 'top-right',
      delay: 2,
      priority: 'low',
      showOnce: true,
    });
  }

  return hints;
};

interface OnboardingOrchestratorProps {
  children: React.ReactNode;
}

export const OnboardingOrchestrator: React.FC<OnboardingOrchestratorProps> = ({ children }) => {
  const { state } = useOnboardingStore();

  const currentHints = useMemo(() => getHintsForCurrentState(state), [state]);

  const showWelcomeScreen = state.isFirstVisit && !state.tourMode && !state.currentPlayground;
  const showTour = state.tourMode;
  const showPlaygrounds = state.currentPlayground !== null;
  const showMainApp = !showWelcomeScreen && !showTour && !showPlaygrounds;

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcomeScreen && <WelcomeScreen key="welcome" />}

        {showTour && (
          <div key="tour" className="tour-overlay">
            {children}
            <GuidedTour />
          </div>
        )}

        {showPlaygrounds && <PlaygroundManager key="playgrounds" />}

        {showMainApp && (
          <div key="main-app" className="main-app-container">
            {children}

            {/* Progress tracker for users who haven't completed onboarding */}
            {state.completedTutorials.length < 4 && (
              <div className="progress-tracker-container">
                <ProgressTracker position="sidebar" compact={false} showDetails={true} />
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Hint system is always active */}
      <HintSystem hints={currentHints} enabled={true} />
    </>
  );
};
