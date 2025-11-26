import React, { useMemo, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useOnboardingStore } from '../../store/onboarding-store';
import type { TourStep, SkillLevel } from '../../types/onboarding';

const getTourSteps = (skillLevel: SkillLevel): TourStep[] => {
  const baseSteps: TourStep[] = [
    {
      target: '.node-panel',
      title: '🧰 Your Toolkit',
      content:
        'Drag these building blocks to create shapes. Start with simple ones like boxes and circles!',
      placement: 'right',
      spotlightPadding: 20,
    },
    {
      target: '.main-content .node-editor',
      title: '🔗 Visual Programming Canvas',
      content:
        'Connect blocks together like LEGO pieces. No coding required - just drag and connect!',
      placement: 'top',
      spotlightPadding: 15,
    },
    {
      target: '.viewport-3d',
      title: '👁️ 3D Preview',
      content:
        'Watch your creations come to life! Rotate, zoom, and inspect your 3D models in real-time.',
      placement: 'left',
      spotlightPadding: 10,
    },
    {
      target: '.sidebar-right',
      title: '⚙️ Fine-tune Everything',
      content: 'Adjust parameters, colors, and properties. Every detail is at your fingertips!',
      placement: 'left',
      spotlightPadding: 15,
    },
  ];

  if (skillLevel === 'neophyte') {
    return [
      {
        target: 'body',
        title: '👋 Welcome to Sim4D Studio!',
        content:
          "Let me show you around this powerful 3D modeling studio. Don't worry - it's easier than it looks!",
        placement: 'bottom',
        disableBeacon: true,
      },
      ...baseSteps,
      {
        target: '.logo',
        title: "🎯 You're Ready to Create!",
        content:
          "Now let's try building your first 3D shape together. I'll guide you through each step!",
        placement: 'bottom',
        spotlightPadding: 10,
      },
    ];
  }

  if (skillLevel === 'beginner') {
    return [
      {
        target: 'body',
        title: '🚀 Quick Sim4D Tour',
        content:
          "Since you have some 3D experience, let me quickly show you Sim4D's unique features.",
        placement: 'bottom',
        disableBeacon: true,
      },
      ...baseSteps,
    ];
  }

  return baseSteps;
};

const joyrideStyles = {
  options: {
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
    width: 400,
    zIndex: 1000,
  },
  tooltip: {
    borderRadius: '12px',
    fontSize: '16px',
  },
  tooltipContainer: {
    textAlign: 'left' as const,
  },
  tooltipTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1f2937',
  },
  tooltipContent: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#4b5563',
    marginBottom: '16px',
  },
  buttonNext: {
    backgroundColor: '#6366f1',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 20px',
  },
  buttonBack: {
    color: '#6b7280',
    marginRight: '12px',
    fontSize: '14px',
    fontWeight: '500',
  },
  buttonSkip: {
    color: '#9ca3af',
    fontSize: '14px',
  },
  beacon: {
    inner: '#6366f1',
    outer: '#6366f1',
  },
};

export const GuidedTour: React.FC = () => {
  const { state, completeStep, exitOnboarding, trackEvent } = useOnboardingStore();

  const tourSteps = useMemo(() => getTourSteps(state.userSkillLevel), [state.userSkillLevel]);

  const handleTourCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type, index, action } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        trackEvent({
          type: status === STATUS.SKIPPED ? 'tour_skipped' : 'step_completed',
          metadata: {
            tour_completed: status === STATUS.FINISHED,
            steps_completed: index + 1,
            total_steps: tourSteps.length,
          },
        });

        // Move to playground selection
        completeStep('interface_tour');
        // Don't exit onboarding, just end tour mode
      }

      if (type === EVENTS.STEP_AFTER) {
        const stepId = `tour_step_${index}`;
        completeStep(stepId);
      }

      // Track user interactions
      if (action === ACTIONS.CLOSE || action === ACTIONS.SKIP) {
        trackEvent({
          type: 'tour_skipped',
          metadata: {
            step_index: index,
            action: action,
          },
        });
      }
    },
    [tourSteps.length, completeStep, trackEvent]
  );

  if (!state.tourMode) {
    return null;
  }

  return (
    <Joyride
      steps={tourSteps}
      run={state.tourMode}
      continuous
      showProgress
      showSkipButton
      callback={handleTourCallback}
      styles={joyrideStyles as any}
      locale={{
        back: '← Previous',
        close: 'Close',
        last: 'Get Started! 🚀',
        next: 'Next →',
        skip: 'Skip Tour',
        open: 'Open the dialog',
      }}
      floaterProps={{
        disableAnimation: false,
      }}
      disableOverlayClose
      hideCloseButton={false}
      spotlightClicks={false}
      disableScrollParentFix={true}
    />
  );
};
