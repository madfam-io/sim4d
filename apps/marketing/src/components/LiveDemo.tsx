import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCw, Maximize2, X } from 'lucide-react';
import { GlowButton } from './ui/GlowButton';

interface LiveDemoProps {
  isVisible: boolean;
}

export function LiveDemo({ isVisible }: LiveDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: 'Create Base Geometry',
      description: 'Start with primitive shapes using parametric controls',
      duration: 3000,
    },
    {
      title: 'Apply Transformations',
      description: 'Transform and array geometry with node connections',
      duration: 3000,
    },
    {
      title: 'Boolean Operations',
      description: 'Combine shapes with union, difference, and intersection',
      duration: 3000,
    },
    {
      title: 'Export to STEP',
      description: 'Export manufacturing-ready files instantly',
      duration: 3000,
    },
  ];

  useEffect(() => {
    if (isPlaying && currentStep < demoSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, demoSteps[currentStep].duration);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep === demoSteps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, demoSteps]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (currentStep === demoSteps.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
                  See It In Action
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Watch how BrepFlow transforms visual node graphs into precise CAD geometry in
                real-time
              </p>
            </div>

            {/* Demo container */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700">
              {/* Demo toolbar */}
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button
                  onClick={handlePlayPause}
                  className="p-2 rounded-lg bg-black/50 backdrop-blur-sm border border-gray-700 hover:bg-black/70 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleRestart}
                  className="p-2 rounded-lg bg-black/50 backdrop-blur-sm border border-gray-700 hover:bg-black/70 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-lg bg-black/50 backdrop-blur-sm border border-gray-700 hover:bg-black/70 transition-colors"
                >
                  {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Demo content area */}
              <div className="relative aspect-video bg-black/20">
                {/* Placeholder for actual BrepFlow iframe or video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">
                      {demoSteps[currentStep].title}
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      {demoSteps[currentStep].description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Demo steps indicator */}
              <div className="p-6 border-t border-gray-800">
                <div className="flex justify-center gap-4">
                  {demoSteps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        index === currentStep
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {index + 1}. {step.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA section */}
            <div className="mt-12 text-center">
              <p className="text-lg text-gray-300 mb-6">
                Ready to experience the future of parametric CAD?
              </p>
              <div className="flex justify-center gap-4">
                <GlowButton href="https://studio.brepflow.com" variant="primary" size="large">
                  Launch BrepFlow Studio
                </GlowButton>
                <GlowButton href="/docs/getting-started" variant="secondary" size="large">
                  Read Documentation
                </GlowButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
