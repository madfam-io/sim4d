import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { LiveDemo } from './components/LiveDemo';
import { Comparison } from './components/Comparison';
import { UseCases } from './components/UseCases';
import { Community } from './components/Community';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { FloatingCTA } from './components/FloatingCTA';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/globals.css';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDemoVisible, setIsDemoVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / totalHeight;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-dark">
        {/* Progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-accent z-50 origin-left"
          style={{ scaleX: scrollProgress }}
        />

        <Navigation />

        <main className="relative">
          <Hero onDemoClick={() => setIsDemoVisible(true)} />

          <Features />

          <section id="demo" className="relative py-32">
            <LiveDemo isVisible={isDemoVisible} />
          </section>

          <Comparison />

          <UseCases />

          <Community />
        </main>

        <Footer />

        <FloatingCTA />
      </div>
    </ThemeProvider>
  );
}
