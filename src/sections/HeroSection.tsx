import { motion } from 'framer-motion';

export const HeroSection = () => (
  <section className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 pt-20">
    <div className="mx-auto w-full max-w-4xl text-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
        <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[#00ff9d] md:text-sm md:tracking-[0.5em]">
          相対性理論 学べ！
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h1
          aria-label="AI野郎"
          className="glitch-text text-6xl font-black uppercase leading-[0.8] sm:text-8xl md:text-9xl lg:text-[10rem]"
          data-text="AI野郎"
        >
          <span aria-hidden="true">AI野郎</span>
        </h1>
      </motion.div>

      <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
        <p className="mx-auto mt-8 max-w-lg px-4 text-sm leading-relaxed text-gray-300 md:text-base">
          A radical community exploring the frontiers of Artificial Intelligence, Neuroscience, Medicine, and Physics. Born in Keio University,
          2025.
        </p>
      </motion.div>
    </div>

    <motion.div
      className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] text-gray-500"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span>SCROLL DOWN</span>
      <div className="h-10 w-px bg-gradient-to-b from-gray-500 to-transparent" />
    </motion.div>
  </section>
);
