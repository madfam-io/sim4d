export type SkillLevel = 'neophyte' | 'beginner' | 'intermediate' | 'skip';

export interface OnboardingState {
  isFirstVisit: boolean;
  currentStep: number;
  completedTutorials: string[];
  userSkillLevel: SkillLevel;
  currentPlayground: string | null;
  showHints: boolean;
  tourMode: boolean;
  analytics: {
    sessionId: string;
    startTime: number;
    events: OnboardingEvent[];
  };
}

export interface OnboardingEvent {
  type:
    | 'onboarding_started'
    | 'step_completed'
    | 'playground_entered'
    | 'objective_completed'
    | 'hint_requested'
    | 'onboarding_abandoned'
    | 'onboarding_completed'
    | 'tour_started'
    | 'tour_skipped';
  timestamp: number;
  metadata: Record<string, any>;
}

export interface PlaygroundObjective {
  id: string;
  description: string;
  completed: boolean;
  hint?: string;
  validation: (graph: any) => boolean;
}

export interface Playground {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  requiredNodes: string[];
  objectives: PlaygroundObjective[];
  icon: string;
}

export interface OnboardingStore {
  state: OnboardingState;

  // Actions
  startOnboarding: (skillLevel: SkillLevel) => void;
  completeStep: (stepId: string) => void;
  skipToSection: (section: string) => void;
  toggleHints: () => void;
  enterPlayground: (playgroundId: string) => void;
  exitPlayground: () => void;
  exitOnboarding: () => void;
  resetOnboarding: () => void;
  completeObjective: (playgroundId: string, objectiveId: string) => void;
  trackEvent: (event: Omit<OnboardingEvent, 'timestamp'>) => void;

  // Computed
  progressPercentage: () => number;
  isPlaygroundActive: (playgroundId: string) => boolean;
  getPlaygroundProgress: (playgroundId: string) => number;
}

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  disableBeacon?: boolean;
}
