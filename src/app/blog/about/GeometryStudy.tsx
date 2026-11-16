"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Lang } from "@/content/about";

type Point = [number, number, number];

/** Small moving sketches in the margins, drawn as vectors rather than another WebGL canvas. */
export function GeometryStudy({ kind, lang }: { kind: "mesh" | "rays"; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const front = useRef<SVGPathElement>(null);
  const back = useRef<SVGPathElement>(null);
  const ray = useRef<SVGPathElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const phase = useRef(0);
  const visible = useInView(ref, { margin: "80px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const rings = kind === "mesh" ? 14 : 9;
    const sides = kind === "mesh" ? 8 : 6;
    const points: Point[] = [];
    const edges: [number, number][] = [];
    for (let i = 0; i < rings; i++) {
      const u = (i / rings) * Math.PI * 2;
      for (let j = 0; j < sides; j++) {
        const v = (j / sides) * Math.PI * 2;
        const radius = kind === "mesh" ? 63 + 24 * Math.cos(v) : 54 + 17 * Math.cos(v + u);
        points.push([radius * Math.cos(u), 24 * Math.sin(v), radius * Math.sin(u)]);
        const n = i * sides + j;
        edges.push([n, i * sides + ((j + 1) % sides)], [n, ((i + 1) % rings) * sides + j]);
        if (kind === "rays") edges.push([n, ((i + 1) % rings) * sides + ((j + 1) % sides)]);
      }
    }
    const draw = () => {
      const angle = phase.current * 0.16 + 0.35 + pointer.current.x * 0.2;
      const tilt = 0.65 + Math.sin(phase.current * 0.12) * 0.16 + pointer.current.y * 0.15;
      const projected = points.map(([x, y, z]) => {
        const xx = x * Math.cos(angle) - z * Math.sin(angle);
        const zz = x * Math.sin(angle) + z * Math.cos(angle);
        const yy = y * Math.cos(tilt) - zz * Math.sin(tilt);
        const depth = y * Math.sin(tilt) + zz * Math.cos(tilt);
        const scale = 330 / (330 + depth);
        return [160 + xx * scale, 115 + yy * scale, depth];
      });
      let near = "";
      let far = "";
      edges.forEach(([a, b]) => {
        const p = projected[a];
        const q = projected[b];
        const line = `M${p[0].toFixed(1)},${p[1].toFixed(1)}L${q[0].toFixed(1)},${q[1].toFixed(1)}`;
        if (p[2] + q[2] < 0) near += line;
        else far += line;
      });
      front.current?.setAttribute("d", near);
      back.current?.setAttribute("d", far);
      const y = 100 + Math.sin(phase.current * 0.45) * 30;
      ray.current?.setAttribute(
        "d",
        `M24 ${y}L160 115L276 ${205 - y}M24 ${y - 13}L160 102M24 ${y + 13}L160 128`,
      );
    };
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last >= 32) {
        phase.current += last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const play = () => {
      cancelAnimationFrame(frame);
      last = 0;
      draw();
      if (visible && !reduced && !document.hidden) frame = requestAnimationFrame(tick);
    };
    play();
    document.addEventListener("visibilitychange", play);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", play);
    };
  }, [kind, visible, reduced]);

  return (
    <figure
      ref={ref}
      className={`yu-study yu-study--${kind} ${visible && !reduced ? "is-running" : ""}`}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: (event.clientX - rect.left) / rect.width - 0.5,
          y: (event.clientY - rect.top) / rect.height - 0.5,
        };
      }}
      onPointerLeave={() => {
        pointer.current = { x: 0, y: 0 };
      }}
    >
      <svg viewBox="0 0 320 230" fill="none" aria-hidden="true">
        <path
          className="yu-study__guides"
          d="M14 115H306M160 16V214M26 23H42M26 23V39M294 207H278M294 207V191"
        />
        <ellipse
          className="yu-study__guides"
          cx="160"
          cy="115"
          rx="108"
          ry="88"
          strokeDasharray="2 7"
        />
        <path ref={back} className="yu-study__back" />
        <path ref={front} className="yu-study__front" />
        {kind === "rays" && <path ref={ray} className="yu-study__ray" />}
        <g className="yu-study__scan">
          <path d="M68 115H252" />
          <circle cx="160" cy="115" r="3" fill="currentColor" stroke="none" />
        </g>
        <text x="22" y="222">
          {kind === "mesh" ? "( x, y, z ) → ∞" : "light → surface → image"}
        </text>
        <text x="274" y="22">
          {kind === "mesh" ? "02" : "04"}
        </text>
      </svg>
      <figcaption>
        <span>Fig.{kind === "mesh" ? "02" : "04"}</span>
        {lang === "zh"
          ? kind === "mesh"
            ? "形体，在思考中生长"
            : "让想法，有迹可循"
          : kind === "mesh"
            ? "A shape, a thought in motion"
            : "Tracing an idea into form"}
      </figcaption>
    </figure>
  );
}
