# BrepFlow Studio Onboarding Design Specification

## 🎯 Vision

Create an intuitive, beginner-friendly onboarding experience that transforms geometric modeling from intimidating to accessible, guiding neophytes through basic concepts while providing enough depth for advanced beginners.

## 📋 System Architecture

### Onboarding State Management

```typescript
interface OnboardingState {
  isFirstVisit: boolean;
  currentStep: number;
  completedTutorials: string[];
  userSkillLevel: 'neophyte' | 'beginner' | 'intermediate' | 'skip';
  currentPlayground: string | null;
  showHints: boolean;
  tourMode: boolean;
}

interface OnboardingStore {
  // State
  state: OnboardingState;

  // Actions
  startOnboarding: (skillLevel: OnboardingState['userSkillLevel']) => void;
  completeStep: (stepId: string) => void;
  skipToSection: (section: string) => void;
  toggleHints: () => void;
  enterPlayground: (playgroundId: string) => void;
  exitOnboarding: () => void;
  resetOnboarding: () => void;
}
```

### Component Architecture

```
OnboardingProvider
├── WelcomeScreen
├── SkillLevelSelector
├── GuidedTour
│   ├── InterfaceHighlight
│   ├── StepTooltip
│   └── NavigationControls
├── InteractivePlayground
│   ├── PlaygroundSelector
│   ├── GuideOverlay
│   ├── HintSystem
│   └── SuccessAnimation
└── ProgressTracker
```

## 🎨 User Experience Flow

### 1. Welcome & Assessment (15-30s)

**Goal**: Warm welcome and skill level detection

**Components**:

- **Animated Logo & Greeting**: "Welcome to BrepFlow Studio!"
- **Skill Level Selector**:
  - 🌱 "Complete Beginner" - Never used CAD/3D modeling
  - 📚 "Some Experience" - Used basic drawing tools or simple CAD
  - 🚀 "Skip Tutorial" - Jump directly to studio
- **Value Proposition**: "Create 3D models using visual programming - no complex menus or commands!"

**UI Design**:

```jsx
<WelcomeScreen>
  <LogoAnimation />
  <WelcomeMessage>
    Transform your ideas into 3D models using simple, visual building blocks - no CAD experience
    required!
  </WelcomeMessage>

  <SkillLevelGrid>
    <SkillCard level="neophyte" recommended>
      <Icon>🌱</Icon>
      <Title>I'm New to This</Title>
      <Description>Start with the basics</Description>
    </SkillCard>

    <SkillCard level="beginner">
      <Icon>📚</Icon>
      <Title>I Know Some 3D</Title>
      <Description>Skip basic concepts</Description>
    </SkillCard>

    <SkillCard level="skip">
      <Icon>🚀</Icon>
      <Title>Let Me Explore</Title>
      <Description>Jump right in</Description>
    </SkillCard>
  </SkillLevelGrid>
</WelcomeScreen>
```

### 2. Interface Tour (2-3 minutes)

**Goal**: Familiarize with studio layout without overwhelming

**Tour Stops**:

1. **Node Panel** (left): "Your toolkit of shapes and operations"
2. **Canvas** (center): "Where you connect building blocks"
3. **3D Viewport** (right): "See your creations come to life"
4. **Inspector** (right): "Fine-tune your shapes"
5. **Toolbar** (top): "Save, load, and manage projects"

**Interactive Elements**:

```jsx
<GuidedTour>
  <TourStep target=".node-panel" position="right">
    <Highlight pulse>
      <Title>🧰 Your Toolkit</Title>
      <Description>
        Drag these building blocks to create shapes. Start with simple ones like circles and boxes!
      </Description>
      <PreviewAnimation showing="drag-node-demo" />
    </Highlight>
  </TourStep>

  <TourStep target=".main-content" position="top">
    <Highlight>
      <Title>🔗 Visual Programming</Title>
      <Description>
        Connect blocks together like LEGO pieces. No coding required - just drag and connect!
      </Description>
    </Highlight>
  </TourStep>
</GuidedTour>
```

### 3. Geometry Playground (5-10 minutes)

**Goal**: Hands-on learning with guided mini-projects

**Playground Options**:

#### 🏀 **Playground 1: "Your First Shape"**

- **Objective**: Create a simple box
- **Steps**:
  1. Drag a "Box" node to canvas
  2. See it appear in 3D viewer
  3. Adjust size using inspector
  4. Success celebration!

#### 🎯 **Playground 2: "Building Blocks"**

- **Objective**: Combine two shapes
- **Steps**:
  1. Create a box and cylinder
  2. Connect them with "Boolean Union"
  3. Watch them merge in real-time
  4. Try different combinations

#### 🎨 **Playground 3: "From Sketch to Solid"**

- **Objective**: Understand sketch → solid workflow
- **Steps**:
  1. Create a circle sketch
  2. Extrude it into a cylinder
  3. Add features like chamfers
  4. Export your creation

**Playground UI**:

```jsx
<InteractivePlayground>
  <PlaygroundSelector>
    <PlaygroundCard id="first-shape" difficulty="easy" time="2 min">
      <Icon>🏀</Icon>
      <Title>Your First Shape</Title>
      <Description>Create a simple 3D box</Description>
      <Badge>Perfect Start</Badge>
    </PlaygroundCard>
  </PlaygroundSelector>

  <GuideOverlay>
    <StepIndicator current={1} total={4} />
    <TaskDescription>🎯 Drag a "Box" from the Solid category to the canvas</TaskDescription>
    <HintButton />
    <SkipButton />
  </GuideOverlay>

  <SuccessModal when="task-complete">
    <Animation type="confetti" />
    <Message>🎉 Amazing! You created your first 3D shape!</Message>
    <NextButton>Try Adding Color</NextButton>
  </SuccessModal>
</InteractivePlayground>
```

## 🎨 UI/UX Component Specifications

### Design System

```css
/* Color Palette */
:root {
  --onboarding-primary: #6366f1; /* Indigo */
  --onboarding-success: #10b981; /* Emerald */
  --onboarding-warning: #f59e0b; /* Amber */
  --onboarding-background: #fafaff; /* Very light indigo */
  --onboarding-surface: #ffffff;
  --onboarding-text: #1f2937;
  --onboarding-text-light: #6b7280;

  /* Animations */
  --onboarding-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --onboarding-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Key Components

#### 1. **Highlight System**

```jsx
<Highlight target=".node-panel" type="pulse|glow|outline" intensity="subtle|normal|strong">
  <Tooltip position="right" arrow>
    Content with clear typography and visual hierarchy
  </Tooltip>
</Highlight>
```

#### 2. **Progress Indicators**

```jsx
<ProgressTracker>
  <StepIndicator>
    <Step completed>Interface Tour</Step>
    <Step active>First Shape</Step>
    <Step>Building Blocks</Step>
    <Step>Advanced Features</Step>
  </StepIndicator>

  <ProgressBar value={35} max={100} />
  <TimeEstimate>About 8 minutes remaining</TimeEstimate>
</ProgressTracker>
```

#### 3. **Smart Hints System**

```jsx
<HintSystem>
  <HintTrigger condition="user-stuck-30s" priority="high">
    <HintBubble>
      💡 Try dragging the Box node from the Solid section!
      <HintAction>Show Me</HintAction>
    </HintBubble>
  </HintTrigger>

  <ContextualTip when="hovering-node">This creates 3D rectangular shapes</ContextualTip>
</HintSystem>
```

## 🎓 Progressive Learning Path

### Phase 1: Foundation (Complete Beginners)

1. **Interface Familiarity**: Navigate studio confidently
2. **Basic Shapes**: Create boxes, cylinders, spheres
3. **Parameter Editing**: Adjust size, position, rotation
4. **3D Visualization**: Understand viewport controls

### Phase 2: Connections (Advanced Beginners)

1. **Node Connections**: Link shapes with operations
2. **Boolean Operations**: Union, subtract, intersect
3. **Sketching Basics**: Lines, circles, rectangles
4. **Extrusion**: Turn 2D sketches into 3D solids

### Phase 3: Workflows (Intermediate)

1. **Feature-Based Modeling**: Fillets, chamfers, patterns
2. **Assembly Concepts**: Multiple parts and relationships
3. **Import/Export**: Working with external files
4. **Advanced Operations**: Sweeps, lofts, shells

## 🚀 Implementation Strategy

### Development Phases

#### Phase 1: Core Infrastructure (Week 1-2)

- Onboarding state management
- Welcome screen and skill assessment
- Basic tour system with highlighting

#### Phase 2: Interactive Playgrounds (Week 3-4)

- First three playground experiences
- Hint system and progress tracking
- Success animations and feedback

#### Phase 3: Polish & Analytics (Week 5-6)

- User testing and refinement
- Analytics integration
- Performance optimization
- Accessibility improvements

### Technical Implementation

#### 1. **Onboarding Store Integration**

```typescript
// apps/studio/src/store/onboarding-store.ts
export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  state: {
    isFirstVisit: !localStorage.getItem('brepflow-visited'),
    currentStep: 0,
    completedTutorials: [],
    userSkillLevel: 'neophyte',
    currentPlayground: null,
    showHints: true,
    tourMode: false,
  },

  startOnboarding: (skillLevel) => {
    set((state) => ({
      state: { ...state.state, userSkillLevel, tourMode: true },
    }));
    // Track analytics event
    analytics.track('onboarding_started', { skill_level: skillLevel });
  },

  // ... other methods
}));
```

#### 2. **Tour System**

```typescript
// apps/studio/src/components/onboarding/GuidedTour.tsx
export const GuidedTour: React.FC = () => {
  const { state, completeStep } = useOnboardingStore();
  const tourSteps = useMemo(() => getTourSteps(state.userSkillLevel), [state.userSkillLevel]);

  return (
    <Joyride
      steps={tourSteps}
      continuous
      showProgress
      styles={customJoyrideStyles}
      callback={handleTourCallback}
    />
  );
};
```

#### 3. **Playground Components**

```typescript
// apps/studio/src/components/onboarding/PlaygroundManager.tsx
export const PlaygroundManager: React.FC = () => {
  const { state, enterPlayground } = useOnboardingStore();

  const playgrounds = [
    {
      id: 'first-shape',
      component: FirstShapePlayground,
      title: 'Your First Shape',
      difficulty: 'easy',
      estimatedTime: '2 min'
    },
    // ... other playgrounds
  ];

  return state.currentPlayground ? (
    <PlaygroundContainer>
      <PlaygroundComponent />
      <GuideOverlay />
      <HintSystem />
    </PlaygroundContainer>
  ) : (
    <PlaygroundSelector playgrounds={playgrounds} onSelect={enterPlayground} />
  );
};
```

### Integration Points

#### 1. **App.tsx Modifications**

```typescript
function App() {
  const { state } = useOnboardingStore();

  return (
    <ReactFlowProvider>
      <div className="app">
        {state.isFirstVisit && <OnboardingProvider />}
        <AppContent />
        {state.tourMode && <GuidedTour />}
        {state.currentPlayground && <PlaygroundManager />}
      </div>
    </ReactFlowProvider>
  );
}
```

#### 2. **Enhanced Node Panel**

```typescript
// Add onboarding hints to existing NodePanel component
export const NodePanel: React.FC = () => {
  const { showHints, currentStep } = useOnboardingStore();

  return (
    <div className="node-panel">
      {showHints && <OnboardingHints />}
      {/* existing node categories */}
    </div>
  );
};
```

## 📊 Success Metrics

### Engagement Metrics

- **Completion Rate**: % of users who finish onboarding
- **Drop-off Points**: Where users abandon the flow
- **Time to First Success**: Creating first 3D shape
- **Feature Discovery**: Which tools users explore post-onboarding

### Learning Effectiveness

- **Skill Progression**: Pre/post-onboarding capability assessment
- **Retention**: Users returning after 7/30 days
- **Feature Usage**: Advanced features attempted within first session

### User Satisfaction

- **NPS Score**: Net Promoter Score post-onboarding
- **Support Tickets**: Reduction in basic usage questions
- **User Feedback**: Qualitative feedback collection

## 🎯 Success Criteria

**Immediate (Post-Implementation)**:

- 80% of new users complete at least one playground
- Average onboarding completion time under 10 minutes
- 90% user satisfaction score (4+ stars out of 5)

**Short-term (1 month)**:

- 60% of onboarded users create their first complete model
- 50% reduction in support tickets for basic usage
- 70% of users return for second session

**Long-term (3 months)**:

- 40% of new users become active weekly users
- Community-generated tutorial content emerges
- Feature adoption rate increases by 35%

---

**Next Steps**:

1. Validate design with user research and prototyping
2. Implement core infrastructure and welcome flow
3. Develop and test interactive playgrounds
4. Iterate based on user feedback and analytics
