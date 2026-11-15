"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 首页进场动画：名字逐字出现 + 进度线画完后揭幕。
 * 每次进入首页都播放，避免会话标记使原有出现动画被跳过。
 */
export function IntroAnimation({
  name = "昱安",
  tagline = "WELCOME · HOMEPAGE",
  duration = 1400,
}: {
  name?: string;
  tagline?: string;
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          data-no-background-interaction=""
          key="intro-animation"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div className="flex flex-col items-center gap-6 text-white">
            <h1 className="flex text-5xl font-semibold tracking-[0.2em] md:text-7xl">
              {Array.from(name).map((ch, i) => (
                <span key={i} className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.12, ease: EASE }}
                  >
                    {ch}
                  </motion.span>
                </span>
              ))}
            </h1>
            <div className="relative h-px w-48 overflow-hidden bg-white/15 md:w-64">
              <motion.div
                className="absolute inset-y-0 left-0 w-full origin-left bg-[#0dbf56]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: duration / 1000, ease: "easeInOut" }}
              />
            </div>
            <motion.p
              className="font-mono text-[10px] tracking-[0.5em] text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {tagline}
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
