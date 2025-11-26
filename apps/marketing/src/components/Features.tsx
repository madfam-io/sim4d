import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BentoGrid } from './ui/BentoGrid';
import { FeatureCard } from './ui/FeatureCard';
import { Cpu, Cloud, Layers, Zap, Globe, Lock, GitBranch, Box, Sparkles } from 'lucide-react';

const features = [
  {
    id: 'web-first',
    icon: Globe,
    title: 'Web-First Architecture',
    description: 'No installation required. Works on any device with a modern browser.',
    gradient: 'from-blue-500 to-cyan-500',
    size: 'large',
    demo: '/demos/web-first.mp4',
  },
  {
    id: 'occt-kernel',
    icon: Cpu,
    title: 'OCCT Geometry Kernel',
    description: 'Professional-grade B-Rep/NURBS geometry via WebAssembly.',
    gradient: 'from-purple-500 to-pink-500',
    size: 'medium',
  },
  {
    id: 'node-based',
    icon: GitBranch,
    title: 'Visual Programming',
    description: 'Intuitive node-based workflow inspired by Grasshopper.',
    gradient: 'from-green-500 to-emerald-500',
    size: 'medium',
  },
  {
    id: 'real-time',
    icon: Zap,
    title: 'Real-Time Evaluation',
    description: 'Instant feedback with smart caching and dirty propagation.',
    gradient: 'from-yellow-500 to-orange-500',
    size: 'small',
  },
  {
    id: 'collaborative',
    icon: Cloud,
    title: 'Cloud-Ready',
    description: 'Built for real-time collaboration and cloud workflows.',
    gradient: 'from-indigo-500 to-purple-500',
    size: 'small',
  },
  {
    id: 'open-source',
    icon: Lock,
    title: 'Open Source',
    description: 'MPL 2.0 licensed. Extend and customize to your needs.',
    gradient: 'from-red-500 to-pink-500',
    size: 'small',
  },
];

export function Features() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section id="features" className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Revolutionary Features
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Sim4D combines the power of desktop CAD with the accessibility of the web, bringing
            professional parametric modeling to everyone.
          </p>
        </motion.div>

        {/* Bento grid layout */}
        <BentoGrid>
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`
                ${feature.size === 'large' ? 'col-span-2 row-span-2' : ''}
                ${feature.size === 'medium' ? 'col-span-1 row-span-2' : ''}
                ${feature.size === 'small' ? 'col-span-1 row-span-1' : ''}
              `}
            >
              <FeatureCard
                id={feature.id}
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                size={feature.size as 'small' | 'medium' | 'large'}
                demo={feature.demo}
              />
            </motion.div>
          ))}
        </BentoGrid>

        {/* Technical highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Layers className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">78+ Nodes</h3>
            <p className="text-gray-400">
              Comprehensive node library for curves, surfaces, solids, and analysis
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Box className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">STEP/IGES Export</h3>
            <p className="text-gray-400">
              Industry-standard file formats for manufacturing and collaboration
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <Sparkles className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">WebAssembly Speed</h3>
            <p className="text-gray-400">
              Near-native performance for complex geometric operations
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
