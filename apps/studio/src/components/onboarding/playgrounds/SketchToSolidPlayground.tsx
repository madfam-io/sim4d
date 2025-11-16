import React from 'react';
import { motion } from 'framer-motion';
import '../onboarding.css';

export const SketchToSolidPlayground: React.FC = () => {
  return (
    <motion.div
      className="sketch-to-solid-playground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="playground-content">
        <h2>✏️ Sketch to Solid Playground</h2>
        <p>Coming soon! This playground will teach you how to turn 2D sketches into 3D solids.</p>
      </div>
    </motion.div>
  );
};
