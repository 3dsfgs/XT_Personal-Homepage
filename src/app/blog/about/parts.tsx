"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

// 两条缓动曲线，分工不同：EASE 给快速的文字/列表揭示用（expo-out，利落）；
// EASE_SLOW 给慢速氛围性动作用（图片擦除、长墨线），避免全站只有一种"手感"。
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_SLOW = [0.65, 0, 0.35, 1] as const;
export const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 非线性 stagger：相邻项间距递减，读起来像手调的节奏而不是等差数列。
 * 例：fanDelay(0)=0, fanDelay(1)≈0.11, fanDelay(2)≈0.16, fanDelay(3)≈0.19
 */
export function fanDelay(i: number, base = 0.11) {
  return base * Math.sqrt(i + 0.3) - base * Math.sqrt(0.3);
}

/** 进入视口时淡入上移——给正文段落用 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** 无位移、只变透明度+缩放——给引用块/结论句用，和 Reveal 区分质感 */
export function RevealIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE_SLOW }}
    >
      {children}
    </motion.div>
  );
}

/** 标题逐字浮现 */
export function SplitTitle({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <motion.span
      key={text}
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.055, delayChildren: delay }}
    >
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: { y: "0%", opacity: 1, transition: { duration: 0.75, ease: EASE } },
            }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** 单个数字滚轮 */
export function RollDigit({ value }: { value: number }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden leading-none tabular-nums">
      <motion.span
        className="flex flex-col"
        initial={false}
        animate={{ y: `-${value}em` }}
        transition={{ type: "spring", stiffness: 140, damping: 20 }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="block h-[1em]">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** 文本中的数字进入视口后从 0 滚动到目标值 */
export function RollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className={className} aria-label={text}>
      {Array.from(text).map((ch, i) =>
        /\d/.test(ch) ? (
          <RollDigit key={i} value={shown ? Number(ch) : 0} />
        ) : (
          <span key={i} aria-hidden>
            {ch}
          </span>
        )
      )}
    </span>
  );
}

/** 章节标题：顶部墨线 + 编号 / 英文标签 + 衬线大标题 */
export function SectionHead({
  id,
  no,
  title,
  label,
  extra,
}: {
  id?: string;
  no: number;
  title: string;
  label: string;
  extra?: ReactNode;
}) {
  return (
    <header id={id} className="relative mb-10 scroll-mt-24 pt-4">
      <motion.div
        className="absolute left-0 right-0 top-0 h-px origin-left bg-[var(--ab-ink)]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.3, ease: EASE_SLOW }}
      />
      <div className="ab-kicker flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className="ab-no-badge">{pad(no)}</span>
          {label}
        </span>
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      {/* 逐字揭示只留给 Hero 的名字，这里用轻量 fade，别把每个章节标题都做成仪式 */}
      <motion.h2
        className="ab-serif mt-4 text-[clamp(1.9rem,1.2rem+2.6vw,3.4rem)] font-semibold leading-[1.12] tracking-[-0.01em]"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
      >
        {title}
      </motion.h2>
    </header>
  );
}

/**
 * 裁切角标包住的图片，带 Fig. 图注。
 * `bleed` 时向左出血到视口边缘（负边距），打破两栏网格的规整切分。
 */
export function Plate({
  src,
  alt,
  caption,
  fig,
  bleed = false,
}: {
  src: string;
  alt: string;
  caption: string;
  fig: string;
  bleed?: boolean;
}) {
  return (
    <figure className={`ab-plate m-0 ${bleed ? "-ml-5 md:-ml-10" : ""}`}>
      <span className="ab-crop ab-crop--tl" />
      <span className="ab-crop ab-crop--tr" />
      <span className="ab-crop ab-crop--bl" />
      <span className="ab-crop ab-crop--br" />
      <motion.div
        className="overflow-hidden"
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        whileInView={{ clipPath: "inset(0 0 0% 0)" }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 1.3, ease: EASE_SLOW }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="block w-full" />
      </motion.div>
      <figcaption className={`ab-kicker mt-3 flex justify-between gap-4 normal-case tracking-[0.12em] ${bleed ? "pl-5 md:pl-10" : ""}`}>
        <span>
          <span className="ab-amber">Fig. {fig}</span> — {caption}
        </span>
      </figcaption>
    </figure>
  );
}
