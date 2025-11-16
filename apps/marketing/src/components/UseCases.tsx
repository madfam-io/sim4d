import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Wrench, Zap, Layers, Target, Users, Rocket, ArrowRight } from 'lucide-react';
import { GlowButton } from './ui/GlowButton';

const useCases = [
  {
    id: 'prototyping',
    icon: Zap,
    title: 'Rapid Prototyping',
    description:
      'From concept to 3D-printable model in minutes, not hours. Perfect for iterative design and quick validation.',
    benefits: ['Instant parameter changes', 'Real-time visualization', '3D printing ready'],
    industries: ['Product Design', 'Consumer Electronics', 'Automotive'],
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'manufacturing',
    icon: Wrench,
    title: 'Manufacturing Design',
    description:
      'Create precise parts with manufacturing constraints built-in. Export directly to CAM systems.',
    benefits: ['STEP/IGES export', 'Tolerance analysis', 'DFM validation'],
    industries: ['Aerospace', 'Medical Devices', 'Industrial Equipment'],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'education',
    icon: Users,
    title: 'Educational Projects',
    description:
      'Teach parametric design principles with visual, interactive tools. No software installation required.',
    benefits: ['Browser-based access', 'Collaborative learning', 'Progressive complexity'],
    industries: ['Universities', 'Technical Schools', 'Online Courses'],
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'research',
    icon: Target,
    title: 'Research & Development',
    description:
      'Explore design spaces with algorithmic modeling. Perfect for optimization and generative design.',
    benefits: ['Parametric exploration', 'Data-driven design', 'Algorithm integration'],
    industries: ['Research Labs', 'Startups', 'Innovation Teams'],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'architecture',
    icon: Layers,
    title: 'Architectural Modeling',
    description:
      'Create complex architectural forms with parametric control. Ideal for facade design and structural optimization.',
    benefits: ['Complex geometries', 'Environmental analysis', 'Collaborative workflows'],
    industries: ['Architecture Firms', 'Construction', 'Urban Planning'],
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'startup',
    icon: Rocket,
    title: 'Startup Innovation',
    description:
      'Launch your hardware startup without expensive CAD licenses. Scale from prototype to production.',
    benefits: ['Zero licensing costs', 'Cloud collaboration', 'Rapid iteration'],
    industries: ['Hardware Startups', 'Crowdfunding', 'Small Teams'],
    gradient: 'from-red-500 to-pink-500',
  },
];

export function UseCases() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section id="use-cases" className="relative py-32 px-4">
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
              Built for Every
            </span>
            <br />
            <span className="text-white">Use Case</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From rapid prototyping to manufacturing-grade design, BrepFlow adapts to your workflow.
            Discover how teams across industries are revolutionizing their design process.
          </p>
        </motion.div>

        {/* Use cases grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 h-full">
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}
                />

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${useCase.gradient} mb-4`}
                  >
                    <useCase.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3">{useCase.title}</h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-4">{useCase.description}</p>

                  {/* Benefits */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {useCase.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-center">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Industries */}
                  <div className="flex flex-wrap gap-2">
                    {useCase.industries.map((industry, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Workflow?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join teams worldwide who are already using BrepFlow to accelerate their design process.
            Start building with parametric CAD in your browser today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowButton href="http://localhost:5173" variant="primary" size="large">
              Try BrepFlow Studio
            </GlowButton>
            <GlowButton href="#demo" variant="secondary" size="large">
              Watch Demo
            </GlowButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
