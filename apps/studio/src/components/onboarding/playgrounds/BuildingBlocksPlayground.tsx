import React from 'react';
import { motion } from 'framer-motion';
import '../onboarding.css';

export const BuildingBlocksPlayground: React.FC = () => {
  return (
    <motion.div
      className="building-blocks-playground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="playground-content">
        <h2>🧱 Building Blocks Playground</h2>
        <p>Coming soon! This playground will teach you how to combine multiple shapes.</p>
      </div>
    </motion.div>
  );
};
