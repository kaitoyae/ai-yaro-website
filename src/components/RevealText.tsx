import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type RevealTextProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export const RevealText = ({ children, delay = 0, className = '' }: RevealTextProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { y: 20, opacity: 0 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
