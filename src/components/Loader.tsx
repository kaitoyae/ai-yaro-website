import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type LoaderProps = {
  onComplete: () => void;
};

export const Loader = ({ onComplete }: LoaderProps) => {
  const [progress, setProgress] = useState(0);
  const completionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((previousProgress) => {
        if (previousProgress >= 100) {
          window.clearInterval(timer);
          completionTimeoutRef.current = window.setTimeout(onComplete, 200);
          return 100;
        }

        return previousProgress + 25;
      });
    }, 100);

    return () => {
      window.clearInterval(timer);
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [onComplete]);

  const boundedProgress = Math.min(progress, 100);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${boundedProgress}%`}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303] pointer-events-none"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p aria-hidden="true" className="font-mono text-5xl font-black text-[#00ff9d]">
        {boundedProgress}%
      </p>
      <span className="sr-only">Loading {boundedProgress}%</span>
    </motion.div>
  );
};
