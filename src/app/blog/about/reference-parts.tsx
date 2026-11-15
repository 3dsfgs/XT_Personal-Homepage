"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";

export const pad = (value: number) => String(value).padStart(2, "0");
export const EASE = [0.16, 1, 0.3, 1] as const;
export const custom = (variables: Record<string, number | string>) => variables as CSSProperties;

export function Watermark({
  kind,
  className = "",
}: {
  kind: "mesh" | "axes" | "orbit";
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const visible = useInView(ref, { amount: 0.1 });
  const drawing =
    kind === "mesh" ? (
      <>
        <path pathLength="1" d="m80 12 53 30 15 60-43 44-66-13-27-61 30-45Z" />
        <path
          pathLength="1"
          d="M80 12l8 49 45-19-25 48 40 12-55 10 12 34-39-40-27 27 6-54-33-7 48-10-18-35 46 34 20 29-15 22-27-6-21-27 15-17 28-1"
        />
        <path pathLength="1" d="M60 62l6 44 42-16 M45 79l43-18 5 51" />
        <circle pathLength="1" cx="88" cy="61" r="3" />
      </>
    ) : kind === "axes" ? (
      <>
        <path
          pathLength="1"
          d="M28 121h108M44 140V22m0 99 70-70M126 116l10 5-10 5M39 32l5-10 5 10M104 54l10-3-3 10"
        />
        <path
          pathLength="1"
          d="M44 91l36-15 30 24-36 15Z M44 91v30l30 15v-21m36-15v21l-36 15M80 76v30"
        />
        <circle pathLength="1" cx="44" cy="121" r="4" />
      </>
    ) : (
      <>
        <circle pathLength="1" cx="80" cy="80" r="49" />
        <ellipse pathLength="1" cx="80" cy="80" rx="66" ry="24" transform="rotate(-32 80 80)" />
        <ellipse pathLength="1" cx="80" cy="80" rx="24" ry="60" transform="rotate(-32 80 80)" />
        <path pathLength="1" d="M72 80h16m-8-8v16M17 135l15-8m99-94 12-9" />
        <circle pathLength="1" cx="132" cy="47" r="4" />
      </>
    );
  return (
    <span className={`yu-watermark ${className}`} aria-hidden="true">
      <svg
        ref={ref}
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className={visible ? "is-drawing" : ""}
        data-watermark-drawing=""
        data-watermark-kind={kind}
      >
        <g className="yu-watermark__base">{drawing}</g>
        <g className="yu-watermark__stroke">{drawing}</g>
      </svg>
      <span>
        {kind === "mesh"
          ? "Fig.01 / always in progress"
          : kind === "axes"
            ? "x · y · z / a little experiment"
            : "to be continued ↗"}
      </span>
    </span>
  );
}

// Paths and class names follow the reference page's Phosphor icon markup.
export function Icon({
  kind = "arrow",
  size = 18,
  className = "",
}: {
  kind?:
    | "arrow"
    | "right"
    | "left"
    | "up"
    | "mail"
    | "github"
    | "copy"
    | "spark"
    | "book"
    | "close"
    | "pen"
    | "link"
    | "drop"
    | "code";
  size?: number;
  className?: string;
}) {
  const paths = {
    arrow:
      "M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z",
    right:
      "M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z",
    left: "M228,128a12,12,0,0,1-12,12H69l51.52,51.51a12,12,0,0,1-17,17l-72-72a12,12,0,0,1,0-17l72-72a12,12,0,0,1,17,17L69,116H216A12,12,0,0,1,228,128Z",
    up: "M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z",
    mail: "M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z",
    github:
      "M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z",
    copy: "M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z",
    spark:
      "M248,152a8,8,0,0,1-8,8H224v16a8,8,0,0,1-16,0V160H192a8,8,0,0,1,0-16h16V128a8,8,0,0,1,16,0v16h16A8,8,0,0,1,248,152ZM56,72H72V88a8,8,0,0,0,16,0V72h16a8,8,0,0,0,0-16H88V40a8,8,0,0,0-16,0V56H56a8,8,0,0,0,0,16ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z",
    book: "M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z",
    close:
      "M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z",
    pen: "M40 208l16-64L172 28l56 56-116 116-72 8Zm16-64 56 56M148 52l56 56M40 208l40-40M40 232h176",
    link: "m104 152 48-48M88 168l-16 16a40 40 0 0 1-56-56l48-48a40 40 0 0 1 56 0M168 88l16-16a40 40 0 0 1 56 56l-48 48a40 40 0 0 1-56 0",
    drop: "M128 24C112 52 48 112 48 152a80 80 0 0 0 160 0c0-40-64-100-80-128ZM88 156a40 40 0 0 0 40 40",
    code: "m80 64-56 64 56 64m96-128 56 64-56 64M148 40l-40 176",
  };
  const outline = ["pen", "link", "drop", "code"].includes(kind);
  const arrow = ["arrow", "right", "left", "up"].includes(kind);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill={outline ? "none" : "currentColor"}
      stroke={outline ? "currentColor" : undefined}
      strokeWidth={outline ? 14 : undefined}
      strokeLinecap={outline ? "round" : undefined}
      strokeLinejoin={outline ? "round" : undefined}
      className={`${className} ${arrow ? "yu-arrow" : ""}`}
      data-arrow={arrow ? kind : undefined}
      data-icon={kind}
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "li";
}) {
  const reduced = useReducedMotion();
  const Element = { div: motion.div, p: motion.p, li: motion.li }[as];
  return (
    <Element
      className={className}
      data-reveal=""
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -40px 0px" }}
      transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : delay, ease: EASE }}
    >
      {children}
    </Element>
  );
}

export function RollNumber({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return (
    <span className="oo-odo" aria-label={text}>
      {Array.from(text).map((char, index) =>
        /\d/.test(char) ? (
          <span className="oo-odo__digit" aria-hidden="true" key={index}>
            <motion.span
              className="oo-odo__col"
              initial={false}
              animate={{ y: `-${Number(char) * 10}%` }}
              transition={{ duration: reduced ? 0 : 0.75, ease: EASE }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n}>{n}</span>
              ))}
            </motion.span>
          </span>
        ) : (
          <span aria-hidden="true" key={index}>
            {char}
          </span>
        ),
      )}
    </span>
  );
}

export function SectionHead({
  id,
  no,
  label,
  title,
  small = false,
}: {
  id: string;
  no: number;
  label: string;
  title: string;
  small?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.15 });
  const reduced = useReducedMotion();
  return (
    <header
      ref={ref}
      className={`oo-sh ${small ? "oo-sh--sm" : "oo-sh--lg"}`}
      data-section=""
      data-no={pad(no)}
      data-kicker={label}
    >
      <motion.span
        className="oo-sh__rule"
        data-rule=""
        aria-hidden="true"
        initial={false}
        animate={{ scaleX: reduced || visible ? 1 : 0 }}
        style={{ transformOrigin: "left" }}
        transition={{ duration: reduced ? 0 : 1.2, ease: EASE }}
      />
      <svg className="oo-sh__reg" viewBox="0 0 11 11" aria-hidden="true">
        <circle cx="5.5" cy="5.5" r="3" />
        <path d="M5.5 0v11M0 5.5h11" />
      </svg>
      <p className="oo-sh__meta">
        <span className="oo-sh__no">
          <RollNumber text={visible || reduced ? pad(no) : "00"} />
        </span>
        <span className="oo-sh__slash">/</span>
        <span className="oo-sh__kicker">{label}</span>
      </p>
      <motion.h2
        id={id}
        className="oo-sh__title"
        initial={false}
        animate={{ opacity: reduced || visible ? 1 : 0, y: reduced || visible ? 0 : 22 }}
        transition={{ duration: reduced ? 0 : 0.8, ease: EASE }}
      >
        {title}
      </motion.h2>
    </header>
  );
}
