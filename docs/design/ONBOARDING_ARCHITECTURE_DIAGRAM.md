# Sim4D Studio Onboarding System Architecture

## 🏗️ System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Sim4D Studio Application                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Node Panel    │  │  Canvas (RF)    │  │  3D Viewport    │  │
│  │   (Toolkit)     │  │   (Graph)       │  │   (Preview)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Onboarding Layer                              │
└─────────────────────────────────────────────────────────────────┘
     ┌─────────────────────────────────────────────────────────┐
     │              OnboardingProvider                         │
     ├─────────────────────────────────────────────────────────┤
     │  ┌─────────────────┐    ┌─────────────────────────────┐  │
     │  │ OnboardingStore │    │      Analytics Tracking     │  │
     │  │  - State Mgmt   │    │   - Events & Metrics       │  │
     │  │  - Progress     │    │   - Performance Monitor     │  │
     │  │  - Persistence  │    │   - A/B Testing            │  │
     │  └─────────────────┘    └─────────────────────────────┘  │
     └─────────────────────────────────────────────────────────┘
              │                             │
              ▼                             ▼
     ┌─────────────────┐             ┌─────────────────┐
     │  Welcome Flow   │             │  Learning Flow  │
     └─────────────────┘             └─────────────────┘
              │                             │
              ▼                             ▼
     ┌─────────────────┐             ┌─────────────────┐
     │ Skill Assessment│             │  Guided Tour    │
     │  🌱 Neophyte    │             │  Interface      │
     │  📚 Beginner    │             │  Highlights     │
     │  🚀 Skip        │             │  Navigation     │
     └─────────────────┘             └─────────────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │ Interactive     │
                                   │ Playgrounds     │
                                   └─────────────────┘
                                            │
                      ┌─────────────────────┼─────────────────────┐
                      ▼                     ▼                     ▼
              ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
              │ First Shape   │    │ Building      │    │ Sketch to     │
              │ Playground    │    │ Blocks        │    │ Solid         │
              │ 🏀 Basic Box  │    │ 🎯 Booleans   │    │ 🎨 Workflow   │
              └───────────────┘    └───────────────┘    └───────────────┘
                      │                     │                     │
                      └─────────────────────┼─────────────────────┘
                                            ▼
                                   ┌─────────────────┐
                                   │  Support        │
                                   │  Systems        │
                                   └─────────────────┘
                                            │
                      ┌─────────────────────┼─────────────────────┐
                      ▼                     ▼                     ▼
              ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
              │ Hint System   │    │ Progress      │    │ Success       │
              │ Smart Context │    │ Tracking      │    │ Celebrations  │
              │ Help on Demand│    │ Step Counter  │    │ Animations    │
              └───────────────┘    └───────────────┘    └───────────────┘
```

## 🎯 User Journey Flow

```
New User Arrives
        │
        ▼
┌──────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Welcome        │ Yes  │  Skill Level    │      │   Start         │
│   First Time?    │─────▶│  Assessment     │─────▶│   Onboarding    │
└──────────────────┘      └─────────────────┘      └─────────────────┘
        │ No                       │                        │
        ▼                          ▼                        ▼
┌──────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Skip to        │      │  Customize      │      │   Guided        │
│   Main App       │      │  Experience     │      │   Tour          │
└──────────────────┘      └─────────────────┘      └─────────────────┘
                                  │                        │
                                  └────────┬───────────────┘
                                          ▼
                                 ┌─────────────────┐
                                 │  Interactive    │
                                 │  Playgrounds    │
                                 └─────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │   Playground 1:       │
                              │   "Your First Shape"  │
                              │   • Drag Box Node     │
                              │   • See 3D Result     │
                              │   • Adjust Parameters │
                              └───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │   Playground 2:       │
                              │   "Building Blocks"   │
                              │   • Create 2 Shapes   │
                              │   • Boolean Union     │
                              │   • Explore Results   │
                              └───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │   Playground 3:       │
                              │   "Sketch to Solid"   │
                              │   • Draw Circle       │
                              │   • Extrude to Solid  │
                              │   • Add Features      │
                              └───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │   Graduation          │
                              │   🎉 Celebration      │
                              │   • Certificate       │
                              │   • Next Steps        │
                              │   • Continue Creating │
                              └───────────────────────┘
```

## 🔄 State Management Flow

```
OnboardingStore (Zustand)
├── State
│   ├── isFirstVisit: boolean
│   ├── currentStep: number
│   ├── completedTutorials: string[]
│   ├── userSkillLevel: SkillLevel
│   ├── currentPlayground: string | null
│   ├── showHints: boolean
│   └── tourMode: boolean
│
├── Actions
│   ├── startOnboarding(skillLevel)
│   ├── completeStep(stepId)
│   ├── enterPlayground(playgroundId)
│   ├── exitOnboarding()
│   └── resetOnboarding()
│
└── Computed Values
    ├── progressPercentage
    ├── currentPlaygroundData
    ├── availablePlaygrounds
    └── nextRecommendedStep

Analytics Integration:
├── Session Tracking
├── Event Logging
├── Performance Metrics
└── A/B Testing Support
```

## 🎨 Component Hierarchy

```
OnboardingProvider
├── WelcomeScreen
│   ├── LogoAnimation
│   ├── WelcomeMessage
│   └── SkillLevelSelector
│       ├── SkillCard (Neophyte)
│       ├── SkillCard (Beginner)
│       └── SkillCard (Skip)
│
├── GuidedTour (react-joyride)
│   ├── TourStep[]
│   ├── Spotlight
│   ├── Tooltip
│   └── NavigationControls
│
├── PlaygroundManager
│   ├── PlaygroundSelector
│   │   └── PlaygroundCard[]
│   ├── ActivePlayground
│   │   ├── GuideOverlay
│   │   ├── ObjectiveList
│   │   ├── HintSystem
│   │   └── ProgressIndicator
│   └── SuccessModal
│       ├── ConfettiAnimation
│       ├── CelebrationMessage
│       └── NextStepButton
│
├── HintSystem
│   ├── ContextualHints
│   ├── SmartTriggers
│   ├── HintBubble
│   └── DemonstrationModal
│
└── ProgressTracker
    ├── StepIndicator
    ├── ProgressBar
    └── TimeEstimate
```

## 📱 Responsive Considerations

### Desktop (1200px+)

- Full sidebar layout with tour highlights
- Side-by-side playground instructions
- Rich animations and interactions

### Tablet (768px - 1199px)

- Collapsible sidebar
- Overlay-based instructions
- Touch-optimized controls

### Mobile (< 768px)

- Bottom sheet navigation
- Full-screen playground mode
- Gesture-based interactions

## 🔌 Integration Points

### Existing System Integration

```typescript
// App.tsx Integration
const App = () => {
  const { isFirstVisit, tourMode } = useOnboardingStore();

  return (
    <ReactFlowProvider>
      {isFirstVisit && <OnboardingProvider />}
      <div className="app">
        <AppContent />
        {tourMode && <GuidedTour />}
      </div>
    </ReactFlowProvider>
  );
};

// Node Panel Enhancement
const NodePanel = () => {
  const { showHints, currentStep } = useOnboardingStore();

  return (
    <div className="node-panel">
      {showHints && <OnboardingHints />}
      <NodeCategories />
    </div>
  );
};

// Graph Store Integration
const useGraphStore = create((set, get) => ({
  // Existing graph logic...

  // Onboarding hooks
  onNodeAdded: (node) => {
    // Trigger playground validation
    const { validateObjective } = useOnboardingStore.getState();
    validateObjective('node-added', node);
  },
}));
```

## 📊 Analytics & Metrics

### Event Tracking

```typescript
interface OnboardingEvent {
  type:
    | 'started'
    | 'step_completed'
    | 'playground_entered'
    | 'objective_completed'
    | 'hint_requested'
    | 'abandoned'
    | 'completed';
  timestamp: number;
  metadata: {
    skillLevel?: string;
    stepId?: string;
    playgroundId?: string;
    timeSpent?: number;
    helpRequested?: boolean;
  };
}
```

### Success Metrics

- **Completion Rate**: % completing full onboarding
- **Engagement Depth**: Average playgrounds completed
- **Time to Success**: Time to first successful shape creation
- **Retention Impact**: Return rates for onboarded vs non-onboarded users

This architecture ensures a scalable, maintainable, and delightful onboarding experience that transforms geometric modeling from intimidating to accessible for all skill levels.
