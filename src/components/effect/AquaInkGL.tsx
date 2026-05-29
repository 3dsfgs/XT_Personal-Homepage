"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  shade: number;
  drift: number;
  spin: number;
  angle: number;
};

type InkPoint = {
  active: boolean;
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  pointerId: number | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function AquaInkGL({
  className,
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.style.touchAction = "none";

    let frame = 0;
    let disposed = false;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const particles: Particle[] = [];
    const pointer: InkPoint = {
      active: false,
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      pointerId: null,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width || canvas.clientWidth || window.innerWidth);
      height = Math.max(1, rect.height || canvas.clientHeight || window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const addParticle = (
      x: number,
      y: number,
      strength: number,
      velocityX: number,
      velocityY: number,
      finalPoint = false
    ) => {
      const count = finalPoint ? 6 : 3;
      for (let index = 0; index < count; index += 1) {
        const spread = strength * (finalPoint ? 1.2 : 0.75);
        const jitterX = random(-spread, spread);
        const jitterY = random(-spread, spread);
        const speedBoost = finalPoint ? 1.16 : 0.9;
        particles.push({
          x: x + jitterX,
          y: y + jitterY,
          vx: velocityX * random(0.0028, 0.0055) * speedBoost + random(-0.15, 0.15),
          vy: velocityY * random(0.0028, 0.0055) * speedBoost + random(-0.15, 0.15),
          life: random(56, 110),
          maxLife: random(56, 110),
          size: random(4.5, 13.5) * strength,
          shade: random(8, 40),
          drift: random(0.01, 0.06),
          spin: random(-0.08, 0.08),
          angle: random(0, Math.PI * 2),
        });
      }
    };

    const emitStroke = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      strength = 1,
      finalPoint = false
    ) => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const distance = Math.hypot(deltaX, deltaY);
      const stepCount = Math.max(1, Math.ceil(distance / 7));

      for (let step = 0; step <= stepCount; step += 1) {
        const t = stepCount === 0 ? 0 : step / stepCount;
        const x = startX + deltaX * t;
        const y = startY + deltaY * t;
        addParticle(x, y, strength, deltaX, deltaY, finalPoint && step === stepCount);
      }
    };

    const getPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onPointerDown = (event: PointerEvent) => {
      const point = getPoint(event);
      pointer.active = true;
      pointer.pointerId = event.pointerId;
      pointer.x = point.x;
      pointer.y = point.y;
      pointer.lastX = point.x;
      pointer.lastY = point.y;

      if (canvas.setPointerCapture) {
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          // ignore capture failures on older browsers
        }
      }

      emitStroke(point.x, point.y, point.x, point.y, 1.5, true);
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = getPoint(event);

      if (!pointer.active) {
        pointer.x = point.x;
        pointer.y = point.y;
        return;
      }

      emitStroke(pointer.lastX, pointer.lastY, point.x, point.y, 1, false);
      pointer.lastX = point.x;
      pointer.lastY = point.y;
      pointer.x = point.x;
      pointer.y = point.y;
    };

    const finishPointer = (event?: PointerEvent) => {
      if (event?.pointerId != null && canvas.hasPointerCapture?.(event.pointerId)) {
        try {
          canvas.releasePointerCapture(event.pointerId);
        } catch {
          // ignore capture failures on cleanup
        }
      }

      pointer.active = false;
      pointer.pointerId = null;
    };

    const drawParticle = (particle: Particle) => {
      const lifeRatio = clamp(particle.life / particle.maxLife, 0, 1);
      const alpha = Math.pow(lifeRatio, 1.35);
      const fade = 1 - lifeRatio;
      const radius = particle.size * (0.72 + fade * 0.65);
      const shade = clamp(Math.round(particle.shade + fade * 18), 4, 64);

      context.save();
      context.globalCompositeOperation = "source-over";

      context.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha * 0.5})`;
      context.beginPath();
      context.arc(particle.x, particle.y, radius * 1.6, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = `rgba(${shade - 2}, ${shade - 2}, ${shade - 2}, ${alpha * 0.9})`;
      context.beginPath();
      context.arc(particle.x, particle.y, radius * 0.85, 0, Math.PI * 2);
      context.fill();

      context.restore();
    };

    const drawPaper = () => {
      const paper = context.createLinearGradient(0, 0, width, height);
      paper.addColorStop(0, "rgba(255, 255, 255, 0.18)");
      paper.addColorStop(0.45, "rgba(245, 240, 232, 0.24)");
      paper.addColorStop(1, "rgba(236, 229, 219, 0.12)");
      context.fillStyle = paper;
      context.fillRect(0, 0, width, height);

      const wash = context.createRadialGradient(
        width * 0.5,
        height * 0.38,
        0,
        width * 0.5,
        height * 0.38,
        Math.max(width, height) * 0.95
      );
      wash.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      wash.addColorStop(1, "rgba(245, 240, 232, 0.0)");
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);
    };

    const spawnIdleInk = () => {
      if (pointer.active || particles.length > 220) return;
      if (Math.random() > 0.02) return;

      const x = width * random(0.2, 0.8);
      const y = height * random(0.18, 0.82);
      emitStroke(x, y, x, y, random(0.75, 1.1), true);
    };

    const tick = () => {
      if (disposed) return;

      context.clearRect(0, 0, width, height);
      drawPaper();

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.life -= 1;
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.vy += 0.018;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.angle += particle.spin;
        particle.vx += Math.cos(particle.angle) * particle.drift * 0.1;
        particle.vy += Math.sin(particle.angle) * particle.drift * 0.08;

        drawParticle(particle);

        const outOfBounds =
          particle.x < -50 ||
          particle.y < -50 ||
          particle.x > width + 50 ||
          particle.y > height + 50;

        if (particle.life <= 0 || outOfBounds) {
          particles.splice(index, 1);
        }
      }

      spawnIdleInk();
      frame = window.requestAnimationFrame(tick);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", finishPointer);
    canvas.addEventListener("pointercancel", finishPointer);
    window.addEventListener("pointerup", finishPointer);
    window.addEventListener("pointercancel", finishPointer);
    window.addEventListener("resize", resize);

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);

    resize();
    tick();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", finishPointer);
      canvas.removeEventListener("pointercancel", finishPointer);
      window.removeEventListener("pointerup", finishPointer);
      window.removeEventListener("pointercancel", finishPointer);
      window.removeEventListener("resize", resize);
      particles.length = 0;
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        aria-label="AquaInkGL"
      />
    </div>
  );
}
