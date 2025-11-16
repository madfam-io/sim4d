import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { NodeFlowVisualization } from './three/NodeFlowVisualization';
import { GlowButton } from './ui/GlowButton';
import { TypewriterText } from './ui/TypewriterText';
import { ParticleField } from './ui/ParticleField';

interface HeroProps {
  onDemoClick: () => void;
}

export function Hero({ onDemoClick }: HeroProps) {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

      {/* Particle field animation */}
      <ParticleField className="absolute inset-0" />

      {/* 3D Canvas Background */}
      <div className="absolute inset-0 opacity-20">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          <Environment preset="city" />
          <NodeFlowVisualization />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Badge */}
        <div className="mb-6">
          <span className="px-4 py-2 text-sm font-medium text-accent-400 bg-accent-900/20 border border-accent-800/30 rounded-full backdrop-blur-sm">
            ✨ The Future of CAD is Here
          </span>
        </div>

        {/* Main heading with gradient */}
        <h1 className="mb-6 text-6xl md:text-7xl lg:text-8xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Parametric CAD
          </span>
          <br />
          <TypewriterText
            words={['in Your Browser', 'Without Installation', 'Collaborative', 'Open Source']}
            className="text-white"
          />
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mb-12 text-xl md:text-2xl text-gray-300">
          BrepFlow brings <span className="text-accent-400 font-semibold">Grasshopper-style</span>{' '}
          visual programming with{' '}
          <span className="text-accent-400 font-semibold">manufacturing-grade geometry</span> to the
          web. No plugins. No installations. Just powerful CAD in your browser.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <GlowButton onClick={onDemoClick} size="large" variant="primary" className="group">
            <span className="relative z-10 flex items-center gap-2">
              Try Live Demo
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </GlowButton>

          <GlowButton
            href="https://github.com/aureo-labs/brepflow"
            variant="secondary"
            size="large"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </span>
          </GlowButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 md:gap-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">78+</div>
            <div className="text-sm text-gray-400">Geometry Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">∞</div>
            <div className="text-sm text-gray-400">Parametric Control</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">0</div>
            <div className="text-sm text-gray-400">Installation Steps</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
