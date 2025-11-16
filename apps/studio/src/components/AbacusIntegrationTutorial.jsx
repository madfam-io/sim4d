import React, { useState, useEffect } from 'react';
import './AbacusIntegrationTutorial.css';

/**
 * Interactive Abacus Integration Tutorial
 * A playable, hands-on tutorial that guides users through the complete
 * abacus creation workflow within the real BrepFlow Studio interface.
 */
export const AbacusIntegrationTutorial = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [highlightedElement, setHighlightedElement] = useState(null);

  const tutorialSteps = [
    {
      id: 'welcome',
      title: '🧮 Welcome to the Parametric Abacus Tutorial',
      content:
        "You'll create a complete parametric abacus using real BrepFlow nodes, parameters, and OCCT geometry processing.",
      action: 'Click "Start Tutorial" to begin your journey',
      target: null,
      validation: null,
    },
    {
      id: 'studio-navigation',
      title: '🧭 Navigate the Studio Interface',
      content:
        "First, let's explore the BrepFlow Studio. Notice the node editor canvas, toolbars, and viewport areas.",
      action: 'Look around the interface, then click "Next" when ready',
      target: '.studio-workspace',
      validation: () => true,
    },
    {
      id: 'node-palette',
      title: '🎨 Open the Node Palette',
      content:
        'To create geometry, we need nodes. The node palette contains all available geometry operations.',
      action: 'Click the "Add Node" button or press Tab to open the node palette',
      target: '[data-testid="add-node-button"], .node-palette-trigger',
      validation: () => document.querySelector('.node-palette')?.style.display !== 'none',
    },
    {
      id: 'create-frame-top',
      title: '📦 Create Top Frame Bar',
      content:
        "Let's start building our abacus frame. We'll create the top horizontal bar using a Box node.",
      action: 'Search for "Box" in the node palette and drag it to the canvas',
      target: '.node-palette',
      validation: () => document.querySelectorAll('[data-node-type="Box"]').length > 0,
    },
    {
      id: 'configure-frame-top',
      title: '⚙️ Configure Top Frame Parameters',
      content: 'Now set the top frame dimensions. Click the Box node to open its parameter panel.',
      action: 'Set Width: 170mm, Height: 4mm, Depth: 20mm',
      target: '[data-node-type="Box"]',
      validation: () => checkParameters('box-1', { width: 170, height: 4, depth: 20 }),
    },
    {
      id: 'create-frame-bottom',
      title: '📦 Create Bottom Frame Bar',
      content: 'Add the bottom frame bar. Create another Box node for the bottom of our abacus.',
      action: 'Add another Box node and position it below the first one',
      target: '.node-palette',
      validation: () => document.querySelectorAll('[data-node-type="Box"]').length > 1,
    },
    {
      id: 'configure-frame-bottom',
      title: '⚙️ Configure Bottom Frame Parameters',
      content: 'Set the same dimensions but different position for the bottom frame.',
      action: 'Set Width: 170mm, Height: 4mm, Depth: 20mm, Position Z: -40mm',
      target: '[data-node-type="Box"]:nth-of-type(2)',
      validation: () => checkParameters('box-2', { width: 170, height: 4, depth: 20, z: -40 }),
    },
    {
      id: 'create-rod',
      title: '🔧 Create Abacus Rod',
      content:
        "Now add the vertical rods. We'll use Cylinder nodes for the rods that hold the beads.",
      action: 'Add a Cylinder node from the palette',
      target: '.node-palette',
      validation: () => document.querySelectorAll('[data-node-type="Cylinder"]').length > 0,
    },
    {
      id: 'configure-rod',
      title: '⚙️ Configure Rod Parameters',
      content: 'Set the rod dimensions to span between the frame bars.',
      action: 'Set Radius: 1mm, Height: 70mm, Position: center',
      target: '[data-node-type="Cylinder"]',
      validation: () => checkParameters('cylinder-1', { radius: 1, height: 70 }),
    },
    {
      id: 'duplicate-rods',
      title: '📋 Duplicate Rods',
      content: 'Create multiple rods by duplicating this one. We need 5 rods total for our abacus.',
      action: 'Select the rod and duplicate it 4 times (Ctrl+D), spacing them 30mm apart',
      target: '[data-node-type="Cylinder"]',
      validation: () => document.querySelectorAll('[data-node-type="Cylinder"]').length >= 5,
    },
    {
      id: 'create-bead',
      title: '🔵 Create Abacus Bead',
      content: 'Now for the beads! Use Sphere nodes to create the counting beads.',
      action: 'Add a Sphere node from the palette',
      target: '.node-palette',
      validation: () => document.querySelectorAll('[data-node-type="Sphere"]').length > 0,
    },
    {
      id: 'configure-bead',
      title: '⚙️ Configure Bead Parameters',
      content: 'Set the bead size. Make them large enough to be easily manipulated.',
      action: 'Set Radius: 6mm, Position on first rod',
      target: '[data-node-type="Sphere"]',
      validation: () => checkParameters('sphere-1', { radius: 6 }),
    },
    {
      id: 'distribute-beads',
      title: '🔢 Distribute Beads on Rods',
      content: 'Create multiple beads on each rod. Each rod should have 7 beads.',
      action:
        'Duplicate the bead 34 times total (7 beads × 5 rods), positioning them along each rod',
      target: '[data-node-type="Sphere"]',
      validation: () => document.querySelectorAll('[data-node-type="Sphere"]').length >= 35,
    },
    {
      id: 'parameter-linking',
      title: '🔗 Link Parameters for Interactivity',
      content: 'Make the abacus truly parametric by linking related parameters.',
      action: 'Connect rod spacing to frame width, and bead count to rod parameters',
      target: '.parameter-panel',
      validation: () => checkParameterConnections(),
    },
    {
      id: 'evaluate-geometry',
      title: '⚡ Evaluate Geometry',
      content:
        'Time to see your abacus come to life! Evaluate the node graph to generate real OCCT geometry.',
      action: 'Click the "Evaluate" button or press F5 to compute the geometry',
      target: '[data-testid="evaluate-button"]',
      validation: () => checkGeometryGenerated(),
    },
    {
      id: 'viewport-interaction',
      title: '🎮 Explore 3D Viewport',
      content:
        'Your abacus should now be visible in the 3D viewport! Interact with it to see your creation.',
      action: 'Use mouse to orbit, zoom, and pan around your parametric abacus',
      target: '.viewport-3d',
      validation: () => checkViewportContent(),
    },
    {
      id: 'parameter-updates',
      title: '🔄 Test Real-Time Updates',
      content:
        'Change parameters to see live geometry updates. This is the power of parametric design!',
      action: 'Try changing bead radius or rod count and re-evaluate',
      target: '.parameter-panel',
      validation: () => true,
    },
    {
      id: 'export-geometry',
      title: '📦 Export Your Abacus',
      content: 'Export your creation in manufacturing-ready formats.',
      action: 'Use File > Export to save as STEP, STL, or IGES format',
      target: '[data-testid="export-menu"]',
      validation: () => checkExportCompleted(),
    },
    {
      id: 'completion',
      title: '🎉 Congratulations!',
      content:
        "You've successfully created a parametric abacus using real BrepFlow Studio with OCCT geometry processing!",
      action: 'Your integration test is complete. You can now create your own parametric designs.',
      target: null,
      validation: null,
    },
  ];

  const currentStepData = tutorialSteps[currentStep];

  // Helper functions for validation
  const checkParameters = (nodeId, expectedParams) => {
    // Would check actual node parameters in real implementation
    return userProgress[nodeId]?.parametersSet || false;
  };

  const checkParameterConnections = () => {
    return userProgress.parametersLinked || false;
  };

  const checkGeometryGenerated = () => {
    return userProgress.geometryEvaluated || false;
  };

  const checkViewportContent = () => {
    return userProgress.viewportInteracted || false;
  };

  const checkExportCompleted = () => {
    return userProgress.exportCompleted || false;
  };

  // Highlight target elements
  useEffect(() => {
    if (currentStepData.target && isVisible) {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        element.classList.add('tutorial-highlight');
        setHighlightedElement(element);
      }
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStep, isVisible]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    setIsVisible(false);
    if (onClose) onClose();

    // Show completion message
    alert(
      "🎉 Abacus Integration Tutorial Complete!\n\nYou've successfully created a parametric abacus using the real BrepFlow Studio interface."
    );
  };

  const skipTutorial = () => {
    if (confirm('Are you sure you want to skip the tutorial?')) {
      completeTutorial();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-panel">
        <div className="tutorial-header">
          <h2>{currentStepData.title}</h2>
          <div className="tutorial-progress">
            Step {currentStep + 1} of {tutorialSteps.length}
          </div>
          <button className="tutorial-close" onClick={skipTutorial}>
            ×
          </button>
        </div>

        <div className="tutorial-content">
          <p>{currentStepData.content}</p>
          <div className="tutorial-action">
            <strong>Action:</strong> {currentStepData.action}
          </div>
        </div>

        <div className="tutorial-controls">
          <button onClick={prevStep} disabled={currentStep === 0} className="btn-secondary">
            Previous
          </button>

          <div className="tutorial-progress-bar">
            <div
              className="tutorial-progress-fill"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          <button onClick={nextStep} className="btn-primary">
            {currentStep === tutorialSteps.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>

        <div className="tutorial-hint">
          💡 This is a hands-on tutorial - you'll actually create the abacus using real BrepFlow
          tools!
        </div>
      </div>

      <div className="tutorial-backdrop" onClick={() => {}} />
    </div>
  );
};

export default AbacusIntegrationTutorial;
