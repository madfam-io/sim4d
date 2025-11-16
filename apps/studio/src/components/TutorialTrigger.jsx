import React, { useState } from 'react';
import AbacusIntegrationTutorial from './AbacusIntegrationTutorial';

/**
 * Tutorial Trigger Component
 * Provides easy access to launch the Abacus Integration Tutorial
 */
export const TutorialTrigger = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  const launchTutorial = () => {
    setShowTutorial(true);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <>
      {/* Tutorial Launch Button */}
      <div className="tutorial-trigger">
        <button
          onClick={launchTutorial}
          className="tutorial-launch-btn"
          title="Start Abacus Integration Tutorial"
        >
          🧮 Tutorial
        </button>
      </div>

      {/* Tutorial Component */}
      {showTutorial && <AbacusIntegrationTutorial onClose={closeTutorial} />}

      <style jsx>{`
        .tutorial-trigger {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }

        .tutorial-launch-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tutorial-launch-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(103, 126, 234, 0.4);
        }

        .tutorial-launch-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
};

export default TutorialTrigger;
