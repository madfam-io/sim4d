import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useOnboardingStore } from '../../store/onboarding-store';
import { useGraphStore } from '../../store/graph-store';
import type { SkillLevel } from '../../types/onboarding';
import { trackEvent } from '../../services/analytics';
import { TemplateGallery } from '../templates/TemplateGallery';
import { loadTemplate } from '../../utils/template-loader';
import type { Template } from '../../templates/template-registry';
import './onboarding.css';

interface SkillCardProps {
  icon: string;
  title: string;
  description: string;
  recommended?: boolean;
  onClick: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({
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

const WelcomeHeader: React.FC = () => (
  <motion.div
    className="welcome-header"
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    <motion.div
      className="logo-animation"
      animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
      transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
    >
      🏗️
    </motion.div>
    <h1 className="welcome-title">Welcome to Sim4D Studio!</h1>
    <p className="welcome-subtitle">
      Transform your ideas into 3D models using simple, visual building blocks
      <br />
      <strong>No CAD experience required!</strong>
    </p>
  </motion.div>
);

interface SkillSelectionProps {
  onSelect: (level: SkillLevel) => void;
}

const SkillSelection: React.FC<SkillSelectionProps> = ({ onSelect }) => (
  <motion.div
    className="skill-level-grid"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.4 }}
  >
    <h2 className="skill-question">What&apos;s your experience with 3D modeling?</h2>
    <div className="skill-cards">
      <SkillCard
        icon="🌱"
        title="I'm New to This"
        description="Start with the basics - I'll guide you every step"
        recommended
        onClick={() => onSelect('neophyte')}
      />
      <SkillCard
        icon="📚"
        title="I Know Some 3D"
        description="Skip the basics, show me Sim4D specifics"
        onClick={() => onSelect('beginner')}
      />
      <SkillCard
        icon="🚀"
        title="Let Me Explore"
        description="Jump right into the studio"
        onClick={() => onSelect('skip')}
      />
    </div>
  </motion.div>
);

interface SampleProjectsSectionProps {
  onBrowse: () => void;
}

const SampleProjectsSection: React.FC<SampleProjectsSectionProps> = ({ onBrowse }) => (
  <motion.div
    className="sample-projects-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.6 }}
  >
    <div className="sample-projects-divider">
      <span>or</span>
    </div>
    <motion.button
      className="browse-samples-button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onBrowse}
    >
      <span className="browse-samples-icon">📦</span>
      <span className="browse-samples-text">
        <strong>Browse Sample Projects</strong>
        <small>Load a ready-made project and start exploring</small>
      </span>
    </motion.button>
  </motion.div>
);

const WelcomeFooter: React.FC = () => (
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
);

export const WelcomeScreen: React.FC = () => {
  const { startOnboarding } = useOnboardingStore();
  const { importGraph } = useGraphStore();
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  useEffect(() => {
    trackEvent('onboarding_started');
  }, []);

  const handleSkillSelect = (skillLevel: SkillLevel) => {
    trackEvent('onboarding_skill_selected', { skillLevel });
    startOnboarding(skillLevel);
  };

  const handleBrowseSamples = () => {
    trackEvent('onboarding_started', { source: 'browse_samples' });
    setShowTemplateGallery(true);
  };

  const handleTemplateSelect = async (template: Template) => {
    try {
      const result = await loadTemplate(template, {
        clearExisting: true,
        positionOffset: { x: 100, y: 100 },
        trackAnalytics: true,
      });
      if (result.success && result.graph) {
        importGraph(result.graph);
        trackEvent('template_loaded', { templateId: template.id });
        startOnboarding('skip');
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  if (showTemplateGallery) {
    return (
      <motion.div
        className="welcome-screen-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="welcome-template-gallery-container">
          <TemplateGallery
            onTemplateSelect={handleTemplateSelect}
            onClose={() => setShowTemplateGallery(false)}
            showRecommended={true}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="welcome-screen-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="welcome-screen-content">
        <WelcomeHeader />
        <SkillSelection onSelect={handleSkillSelect} />
        <SampleProjectsSection onBrowse={handleBrowseSamples} />
        <WelcomeFooter />
      </div>
    </motion.div>
  );
};
