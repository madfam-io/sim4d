import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Github, MessageCircle, Users, BookOpen, Star, GitFork } from 'lucide-react';
import { GlowButton } from './ui/GlowButton';

export function Community() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const communityStats = [
    { icon: Star, value: '2.8k', label: 'GitHub Stars' },
    { icon: GitFork, value: '450', label: 'Forks' },
    { icon: Users, value: '10k+', label: 'Community Members' },
    { icon: MessageCircle, value: '24/7', label: 'Support' },
  ];

  const resources = [
    {
      icon: Github,
      title: 'Open Source',
      description: 'Contribute to the codebase and shape the future of CAD',
      link: 'https://github.com/aureo-labs/sim4d',
      color: 'from-gray-600 to-gray-700',
    },
    {
      icon: MessageCircle,
      title: 'Discord Community',
      description: 'Join discussions, get help, and share your creations',
      link: 'https://discord.gg/sim4d',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Comprehensive guides, tutorials, and API references',
      link: '/docs',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: Users,
      title: 'Forum',
      description: 'Ask questions, share knowledge, and showcase projects',
      link: 'https://forum.sim4d.com',
      color: 'from-blue-500 to-cyan-600',
    },
  ];

  return (
    <section id="community" className="relative py-32 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Join the Revolution
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Be part of a growing community that&apos;s reimagining parametric CAD for the web era
          </p>
        </motion.div>

        {/* Community stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {communityStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                <stat.icon className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Resource cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {resources.map((resource, index) => (
            <motion.a
              key={resource.title}
              href={resource.link}
              target={resource.link.startsWith('http') ? '_blank' : undefined}
              rel={resource.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-all duration-300"
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${resource.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              <div className="relative z-10">
                <resource.icon className="w-10 h-10 mb-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <h3 className="text-xl font-semibold mb-2 text-white">{resource.title}</h3>
                <p className="text-gray-400 mb-4">{resource.description}</p>
                <span className="text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  Learn more
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-90" />
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

          <div className="relative z-10 p-12 text-center">
            <h3 className="text-3xl font-bold mb-4 text-white">Stay Updated</h3>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Get the latest updates, tutorials, and community highlights delivered to your inbox
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <GlowButton href="mailto:hello@sim4d.com" variant="primary">
                Contact Us
              </GlowButton>
            </form>

            <p className="mt-4 text-sm text-gray-300">
              Join 10,000+ developers and designers. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
