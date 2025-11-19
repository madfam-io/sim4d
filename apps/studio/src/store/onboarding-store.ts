import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  OnboardingStore,
  OnboardingState,
  SkillLevel,
  OnboardingEvent,
} from '../types/onboarding';

const STORAGE_KEY = 'brepflow-onboarding-state';

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getInitialState(): OnboardingState {
  const stored = localStorage.getItem(STORAGE_KEY);
  const hasVisited = localStorage.getItem('brepflow-visited');

  if (stored) {
    const parsedState = JSON.parse(stored);
    return {
      ...parsedState,
      tourMode: false, // Reset tour mode on reload
      currentPlayground: null, // Reset playground on reload
      analytics: {
        sessionId: generateSessionId(),
        startTime: Date.now(),
        events: parsedState.analytics?.events || [],
      },
    };
  }

  return {
    isFirstVisit: !hasVisited,
    currentStep: 0,
    completedTutorials: [],
    userSkillLevel: 'neophyte',
    currentPlayground: null,
    showHints: true,
    tourMode: false,
    analytics: {
      sessionId: generateSessionId(),
      startTime: Date.now(),
      events: [],
    },
  };
}

function saveState(state: OnboardingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem('brepflow-visited', 'true');
}

export const useOnboardingStore = create<OnboardingStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      state: getInitialState(),

      startOnboarding: (skillLevel: SkillLevel) => {
        set((store) => {
          const newState = {
            ...store.state,
            userSkillLevel: skillLevel,
            // If user selected 'skip', don't start tour mode
            tourMode: skillLevel !== 'skip',
            isFirstVisit: false,
          };
          saveState(newState);
          return { state: newState };
        });

        // Track onboarding start
        get().trackEvent({
          type: 'onboarding_started',
          metadata: { skill_level: skillLevel },
        });
      },

      completeStep: (stepId: string) => {
        set((store) => {
          const newState = {
            ...store.state,
            currentStep: store.state.currentStep + 1,
            completedTutorials: [...store.state.completedTutorials, stepId],
          };
          saveState(newState);
          return { state: newState };
        });

        get().trackEvent({
          type: 'step_completed',
          metadata: { step_id: stepId },
        });
      },

      skipToSection: (section: string) => {
        set((store) => {
          const newState = {
            ...store.state,
            tourMode: false,
            currentPlayground: section,
          };
          saveState(newState);
          return { state: newState };
        });
      },

      toggleHints: () => {
        set((store) => {
          const newState = {
            ...store.state,
            showHints: !store.state.showHints,
          };
          saveState(newState);
          return { state: newState };
        });
      },

      enterPlayground: (playgroundId: string) => {
        set((store) => {
          const newState = {
            ...store.state,
            currentPlayground: playgroundId,
            tourMode: false,
          };
          saveState(newState);
          return { state: newState };
        });

        get().trackEvent({
          type: 'playground_entered',
          metadata: { playground_id: playgroundId },
        });
      },

      exitPlayground: () => {
        set((store) => {
          const newState = {
            ...store.state,
            currentPlayground: null,
          };
          saveState(newState);
          return { state: newState };
        });
      },

      exitOnboarding: () => {
        set((store) => {
          const newState = {
            ...store.state,
            isFirstVisit: false,
            tourMode: false,
            currentPlayground: null,
          };
          saveState(newState);
          return { state: newState };
        });

        get().trackEvent({
          type: 'onboarding_completed',
          metadata: {
            total_time: Date.now() - get().state.analytics.startTime,
            completed_tutorials: get().state.completedTutorials.length,
          },
        });
      },

      resetOnboarding: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('brepflow-visited');

        set({
          state: {
            isFirstVisit: true,
            currentStep: 0,
            completedTutorials: [],
            userSkillLevel: 'neophyte',
            currentPlayground: null,
            showHints: true,
            tourMode: false,
            analytics: {
              sessionId: generateSessionId(),
              startTime: Date.now(),
              events: [],
            },
          },
        });
      },

      completeObjective: (playgroundId: string, objectiveId: string) => {
        get().trackEvent({
          type: 'objective_completed',
          metadata: {
            playground_id: playgroundId,
            objective_id: objectiveId,
          },
        });
      },

      trackEvent: (event: Omit<OnboardingEvent, 'timestamp'>) => {
        const fullEvent: OnboardingEvent = {
          ...event,
          timestamp: Date.now(),
        };

        set((store) => {
          const newState = {
            ...store.state,
            analytics: {
              ...store.state.analytics,
              events: [...store.state.analytics.events, fullEvent],
            },
          };
          saveState(newState);
          return { state: newState };
        });

        // Send to analytics service if available
        if (typeof window !== 'undefined' && (window as unknown).analytics) {
          (window as unknown).analytics.track(event.type, event.metadata);
        }
      },

      // Computed getters
      progressPercentage: () => {
        const { completedTutorials, userSkillLevel } = get().state;
        const totalSteps =
          userSkillLevel === 'neophyte' ? 8 : userSkillLevel === 'beginner' ? 6 : 4;
        return Math.round((completedTutorials.length / totalSteps) * 100);
      },

      isPlaygroundActive: (playgroundId: string) => {
        return get().state.currentPlayground === playgroundId;
      },

      getPlaygroundProgress: (playgroundId: string) => {
        // This would be calculated based on completed objectives
        // For now, returning 0 as placeholder
        return 0;
      },
    })),
    { name: 'onboarding-store' }
  )
);
