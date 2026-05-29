"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function IntroAnimation({
  duration = 2500,
}: {
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="intro-animation"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <div className="flex flex-col items-center gap-4 text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="h-12 w-12 rounded-full border-2 border-white/30 border-t-white"
            />
            <div className="text-sm tracking-[0.35em] text-white/80">
              LOADING
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
