import React from 'react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useOnboardingStore } from '../../store/onboarding-store';
import type { SkillLevel } from '../../types/onboarding';
import { trackEvent } from '../../services/analytics';
import './onboarding.css';

interface SkillCardProps {
  level: SkillLevel;
  icon: string;
  title: string;
  description: string;
  recommended?: boolean;
  onClick: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({
  level,
  icon,
  title,
  description,
  recommended,
  onClick,
}) => (
  <motion.div
    className={`skill-card ${recommended ? 'recommended' : ''}`}
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="skill-icon">{icon}</div>
    <h3 className="skill-title">{title}</h3>
    <p className="skill-description">{description}</p>
    {recommended && <div className="recommended-badge">Recommended</div>}
  </motion.div>
);

export const WelcomeScreen: React.FC = () => {
  const { startOnboarding } = useOnboardingStore();

  useEffect(() => {
    // Track when onboarding is shown
    trackEvent('onboarding_started');
  }, []);

  const handleSkillSelect = (skillLevel: SkillLevel) => {
    trackEvent('onboarding_skill_selected', { skillLevel });
    startOnboarding(skillLevel);
  };

  return (
    <motion.div
      className="welcome-screen-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="welcome-screen-content">
        <motion.div
          className="welcome-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="logo-animation"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            🏗️
          </motion.div>
          <h1 className="welcome-title">Welcome to BrepFlow Studio!</h1>
          <p className="welcome-subtitle">
            Transform your ideas into 3D models using simple, visual building blocks
            <br />
            <strong>No CAD experience required!</strong>
          </p>
        </motion.div>

        <motion.div
          className="skill-level-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="skill-question">What's your experience with 3D modeling?</h2>

          <div className="skill-cards">
            <SkillCard
              level="neophyte"
              icon="🌱"
              title="I'm New to This"
              description="Start with the basics - I'll guide you every step"
              recommended
              onClick={() => handleSkillSelect('neophyte')}
            />

            <SkillCard
              level="beginner"
              icon="📚"
              title="I Know Some 3D"
              description="Skip the basics, show me BrepFlow specifics"
              onClick={() => handleSkillSelect('beginner')}
            />

            <SkillCard
              level="skip"
              icon="🚀"
              title="Let Me Explore"
              description="Jump right into the studio"
              onClick={() => handleSkillSelect('skip')}
            />
          </div>
        </motion.div>

        <motion.div
          className="welcome-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="welcome-promise">
            🎯 Learn by doing • 🎨 Visual and intuitive • ⚡ Get results fast
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
