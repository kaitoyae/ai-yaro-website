import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GradientDescentBackground } from './components/GradientDescentBackground';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { AboutSection } from './sections/AboutSection';
import { ActivitiesSection } from './sections/ActivitiesSection';
import { ContributeSection } from './sections/ContributeSection';
import { Footer } from './sections/Footer';
import { HeroSection } from './sections/HeroSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { TokenSection } from './sections/TokenSection';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence>{loading ? <Loader onComplete={() => setLoading(false)} /> : null}</AnimatePresence>
      <GradientDescentBackground />

      <div
        aria-hidden={loading}
        className={`relative z-10 transition-opacity duration-1000 ${
          loading ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <Header />
        <main>
          <HeroSection />
          <AboutSection />
          <ActivitiesSection />
          <TokenSection />
          <ProjectsSection />
          <ContributeSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
