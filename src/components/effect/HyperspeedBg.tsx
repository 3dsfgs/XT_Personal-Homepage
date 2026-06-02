"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";

type HyperspeedPreset = {
  background: number;
  fogNear: number;
  fogFar: number;
  roadColor: number;
  streakColor: number;
  sideColor: number;
  accentColor: number;
  fov: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  baseSpeed: number;
  speedSpread: number;
  streakCount: number;
  sideCount: number;
  starCount: number;
  spreadX: number;
  spreadY: number;
  depth: number;
};

export const HYPERSPEED_PRESET_COUNT = 6;

const PRESETS: HyperspeedPreset[] = [
  {
    background: 0x040407,
    fogNear: 18,
    fogFar: 235,
    roadColor: 0x07070b,
    streakColor: 0xff3245,
    sideColor: 0xffa0aa,
    accentColor: 0xffffff,
    fov: 76,
    cameraX: 0,
    cameraY: 2.05,
    cameraZ: 12,
    baseSpeed: 94,
    speedSpread: 30,
    streakCount: 232,
    sideCount: 46,
    starCount: 180,
    spreadX: 10.4,
    spreadY: 3.8,
    depth: 232,
  },
  {
    background: 0x070611,
    fogNear: 20,
    fogFar: 228,
    roadColor: 0x09070f,
    streakColor: 0x91f3ff,
    sideColor: 0xdcfaff,
    accentColor: 0xffffff,
    fov: 78,
    cameraX: 0.15,
    cameraY: 2.1,
    cameraZ: 12,
    baseSpeed: 90,
    speedSpread: 24,
    streakCount: 224,
    sideCount: 42,
    starCount: 176,
    spreadX: 9.8,
    spreadY: 3.4,
    depth: 224,
  },
  {
    background: 0x020806,
    fogNear: 18,
    fogFar: 230,
    roadColor: 0x050c08,
    streakColor: 0x7dffbf,
    sideColor: 0xe6fff0,
    accentColor: 0xffffff,
    fov: 75,
    cameraX: -0.12,
    cameraY: 2,
    cameraZ: 12,
    baseSpeed: 95,
    speedSpread: 32,
    streakCount: 240,
    sideCount: 48,
    starCount: 184,
    spreadX: 10.8,
    spreadY: 3.6,
    depth: 234,
  },
  {
    background: 0x090502,
    fogNear: 22,
    fogFar: 242,
    roadColor: 0x120705,
    streakColor: 0xffbf6e,
    sideColor: 0xffefd4,
    accentColor: 0xffffff,
    fov: 79,
    cameraX: 0,
    cameraY: 2.18,
    cameraZ: 12,
    baseSpeed: 87,
    speedSpread: 22,
    streakCount: 216,
    sideCount: 40,
    starCount: 168,
    spreadX: 9.6,
    spreadY: 3.3,
    depth: 216,
  },
  {
    background: 0x010101,
    fogNear: 20,
    fogFar: 212,
    roadColor: 0x050505,
    streakColor: 0xf8f8f8,
    sideColor: 0xcfcfcf,
    accentColor: 0xffffff,
    fov: 74,
    cameraX: 0,
    cameraY: 2,
    cameraZ: 12,
    baseSpeed: 96,
    speedSpread: 36,
    streakCount: 250,
    sideCount: 52,
    starCount: 196,
    spreadX: 10.6,
    spreadY: 3.9,
    depth: 240,
  },
  {
    background: 0x020b10,
    fogNear: 18,
    fogFar: 220,
    roadColor: 0x061016,
    streakColor: 0x74e5ff,
    sideColor: 0xdff7ff,
    accentColor: 0xcfffff,
    fov: 77,
    cameraX: 0.08,
    cameraY: 2.06,
    cameraZ: 12,
    baseSpeed: 92,
    speedSpread: 26,
    streakCount: 228,
    sideCount: 44,
    starCount: 180,
    spreadX: 10.2,
    spreadY: 3.5,
    depth: 228,
  },
];

type State = {
  x: number;
  y: number;
  z: number;
  speed: number;
  scale: number;
  rotation: number;
  laneX: number;
  laneY: number;
  curve: number;
  phase: number;
  thickness: number;
};

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

export default function HyperspeedBg({
  presetIndex = 0,
  onPresetChange,
}: {
  presetIndex?: number;
  onPresetChange?: (nextPreset: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(true);
  const frameRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const onPresetChangeRef = useRef(onPresetChange);
  const [transitioning, setTransitioning] = useState(false);

  const preset = useMemo(
    () => PRESETS[Math.abs(presetIndex) % PRESETS.length],
    [presetIndex]
  );

  useEffect(() => {
    onPresetChangeRef.current = onPresetChange;
  }, [onPresetChange]);

  useEffect(() => {
    setTransitioning(true);
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = window.setTimeout(() => {
      setTransitioning(false);
    }, 220);

    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, [presetIndex]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    runningRef.current = true;
    host.replaceChildren();

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.setClearColor(preset.background, 1);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.touchAction = "none";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(preset.background);
    scene.fog = new THREE.Fog(preset.background, preset.fogNear, preset.fogFar);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.32);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(preset.accentColor, 1.2);
    keyLight.position.set(-4, 6, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(preset.streakColor, 0.6);
    rimLight.position.set(4, 2, -6);
    scene.add(rimLight);

    const camera = new THREE.PerspectiveCamera(
      preset.fov,
      host.clientWidth / host.clientHeight,
      0.1,
      2000
    );
    camera.position.set(preset.cameraX, preset.cameraY, preset.cameraZ);
    camera.lookAt(0, 0, -84);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new EffectPass(
      camera,
      new BloomEffect({
        intensity: 0.92,
        luminanceThreshold: 0.22,
        luminanceSmoothing: 0.32,
      })
    );
    bloomPass.renderToScreen = true;
    composer.addPass(bloomPass);

    const roadGeometry = new THREE.PlaneGeometry(
      66,
      preset.depth * 1.34,
      14,
      Math.max(48, Math.floor(preset.depth / 3))
    );
    roadGeometry.rotateX(-Math.PI / 2);
    const roadPositions = roadGeometry.attributes.position as THREE.BufferAttribute;
    const roadBasePositions = new Float32Array(roadPositions.array as Float32Array);
    const road = new THREE.Mesh(
      roadGeometry,
      new THREE.MeshStandardMaterial({
        color: preset.roadColor,
        transparent: true,
        opacity: 0.9,
        roughness: 0.95,
        metalness: 0.02,
        emissive: preset.roadColor,
        emissiveIntensity: 0.12,
        depthWrite: false,
      })
    );
    road.position.set(0, -1.9, -preset.depth * 0.46);
    scene.add(road);

    const streakGeometry = new THREE.BoxGeometry(0.05, 0.05, 2.8);
    const streakMesh = new THREE.InstancedMesh(
      streakGeometry,
      new THREE.MeshBasicMaterial({
        color: preset.streakColor,
        transparent: true,
        opacity: 0.94,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      preset.streakCount
    );
    streakMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(streakMesh);

    const sideGeometry = new THREE.BoxGeometry(0.02, 0.14, 1.2);
    const sideMesh = new THREE.InstancedMesh(
      sideGeometry,
      new THREE.MeshBasicMaterial({
        color: preset.sideColor,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      preset.sideCount
    );
    sideMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(sideMesh);

    const laneGeometry = new THREE.BoxGeometry(0.11, 0.03, 2.1);
    const laneMesh = new THREE.InstancedMesh(
      laneGeometry,
      new THREE.MeshBasicMaterial({
        color: preset.accentColor,
        transparent: true,
        opacity: 0.74,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      Math.max(96, Math.floor(preset.depth * 0.85))
    );
    laneMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(laneMesh);

    const stars = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({
        color: preset.accentColor,
        size: 0.09,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
    );
    scene.add(stars);

    const dummy = new THREE.Object3D();
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();
    const streakStates: State[] = [];
    const sideStates: State[] = [];
    const laneStates: State[] = [];
    const starState: Array<{ x: number; y: number; z: number; speed: number }> =
      [];
    const starPositions = new Float32Array(preset.starCount * 3);

    const applyState = (
      mesh: THREE.InstancedMesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>,
      index: number,
      state: State,
      xScale: number,
      yScale: number,
      zScale: number
    ) => {
      dummy.position.set(state.x, state.y, state.z);
      dummy.rotation.set(0, 0, state.rotation);
      dummy.scale.set(
        xScale * state.scale,
        yScale * state.scale,
        zScale * state.scale * state.thickness
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    };

    const spawnStreak = (index: number, initial = false): State => {
      const laneProgress =
        preset.streakCount <= 1 ? 0.5 : index / (preset.streakCount - 1);
      const laneX = (laneProgress - 0.5) * preset.spreadX * 1.55;
      const laneBand = Math.sin(laneProgress * Math.PI * 2.2) * preset.spreadY * 0.08;
      const state = {
        x: laneX,
        y: laneBand,
        z: initial
          ? random(-preset.depth, preset.depth * 0.2)
          : -preset.depth - Math.random() * preset.depth * 0.35,
        speed: preset.baseSpeed + random(-preset.speedSpread, preset.speedSpread),
        scale: random(0.82, 1.55),
        rotation: random(-0.18, 0.18),
        laneX,
        laneY: laneBand,
        curve: random(0.18, 0.6),
        phase: random(0, Math.PI * 2),
        thickness: random(0.9, 1.4),
      };
      applyState(streakMesh, index, state, 0.055, 0.055, 1.05);
      return state;
    };

    const spawnSide = (index: number, initial = false): State => {
      const direction = index % 2 === 0 ? -1 : 1;
      const band = index / Math.max(1, preset.sideCount - 1);
      const laneX =
        direction *
        (preset.spreadX * (1.02 + band * 0.26) + random(-0.18, 0.18));
      const laneY = random(-1.2, 0.8);
      const state = {
        x: laneX,
        y: laneY,
        z: initial
          ? random(-preset.depth, preset.depth * 0.1)
          : -preset.depth - Math.random() * preset.depth * 0.25,
        speed:
          preset.baseSpeed + random(-preset.speedSpread * 0.6, preset.speedSpread * 0.6),
        scale: random(0.72, 1.35),
        rotation: random(-0.05, 0.05),
        laneX,
        laneY,
        curve: random(0.04, 0.2),
        phase: random(0, Math.PI * 2),
        thickness: random(0.82, 1.12),
      };
      applyState(sideMesh, index, state, 0.022, 0.14, 0.9);
      return state;
    };

    const spawnLane = (index: number, initial = false): State => {
      const laneProgress =
        laneMesh.count <= 1 ? 0.5 : index / (laneMesh.count - 1);
      const laneX = Math.sin(laneProgress * Math.PI * 3.2) * 0.68;
      const laneY = -1.48 + Math.sin(laneProgress * Math.PI * 2.6) * 0.22;
      const state = {
        x: laneX,
        y: laneY,
        z: initial
          ? random(-preset.depth, preset.depth * 0.18)
          : -preset.depth - Math.random() * preset.depth * 0.28,
        speed:
          preset.baseSpeed + random(-preset.speedSpread * 0.35, preset.speedSpread * 0.35),
        scale: random(0.84, 1.2),
        rotation: random(-0.03, 0.03),
        laneX,
        laneY,
        curve: random(0.14, 0.36),
        phase: random(0, Math.PI * 2),
        thickness: random(0.82, 1.08),
      };
      applyState(laneMesh, index, state, 0.11, 0.03, 1.0);
      return state;
    };

    for (let i = 0; i < preset.streakCount; i += 1) {
      streakStates.push(spawnStreak(i, true));
    }
    for (let i = 0; i < preset.sideCount; i += 1) {
      sideStates.push(spawnSide(i, true));
    }
    for (let i = 0; i < laneMesh.count; i += 1) {
      laneStates.push(spawnLane(i, true));
    }
    for (let i = 0; i < preset.starCount; i += 1) {
      starState.push({
        x: random(-preset.spreadX * 1.4, preset.spreadX * 1.4),
        y: random(-preset.spreadY * 1.3, preset.spreadY * 1.3),
        z: random(-preset.depth, preset.depth * 0.25),
        speed: random(preset.baseSpeed * 0.45, preset.baseSpeed * 0.8),
      });
    }
    const starAttr = new THREE.BufferAttribute(starPositions, 3);
    stars.geometry.setAttribute("position", starAttr);

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const pointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      pointerTarget.set(x, -y);
    };

    const pointerLeave = () => {
      pointerTarget.set(0, 0);
    };

    let speedBoost = 0;
    let speedTarget = 0;
    let fovTarget = preset.fov;
    let impactPulse = 0;

    const onPointerDown = () => {
      speedTarget = 2.1;
      fovTarget = preset.fov + 14;
      impactPulse = 1;
    };
    const onPointerUp = () => {
      speedTarget = 0;
      fovTarget = preset.fov;
    };
    const onClick = () => {
      onPresetChangeRef.current?.((presetIndex + 1) % PRESETS.length);
    };

    const update = () => {
      if (!runningRef.current) return;

      const delta = Math.min(clock.getDelta(), 0.033);
      const speedLerp = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
      speedBoost = lerp(speedBoost, speedTarget, speedLerp);
      impactPulse = lerp(impactPulse, 0, 0.07);
      const time = clock.elapsedTime + speedBoost;
      const flowTime = time * 0.7;
      const motionPulse = 1 + speedBoost * 0.16 + impactPulse * 0.5;

      pointerCurrent.x = lerp(pointerCurrent.x, pointerTarget.x, 0.05);
      pointerCurrent.y = lerp(pointerCurrent.y, pointerTarget.y, 0.05);

      camera.position.x = lerp(
        camera.position.x,
        preset.cameraX + pointerCurrent.x * 1.35,
        0.05
      );
      camera.position.y = lerp(
        camera.position.y,
        preset.cameraY + pointerCurrent.y * 0.85,
        0.05
      );
      camera.lookAt(pointerCurrent.x * 6, pointerCurrent.y * 2.4, -86);
      camera.fov = lerp(camera.fov, fovTarget, 0.08);
      camera.updateProjectionMatrix();

      for (let i = 0; i < roadBasePositions.length; i += 3) {
        const baseX = roadBasePositions[i];
        const baseZ = roadBasePositions[i + 2];
        const centerFalloff = 1 - Math.min(1, Math.abs(baseX) / 30);
        const depthPhase = baseZ * 0.06;
        roadPositions.array[i + 1] =
          Math.sin(depthPhase + flowTime * 1.45 + baseX * 0.14) *
            (0.16 + impactPulse * 0.14 + speedBoost * 0.02) *
            centerFalloff +
          Math.sin(baseX * 0.42 + flowTime * 2.1) * 0.03;
      }
      roadPositions.needsUpdate = true;
      roadGeometry.computeVertexNormals();

      const resetThreshold = 22;
      const farPlane = preset.depth * 0.55;

      streakStates.forEach((state, index) => {
        state.z += delta * state.speed;
        const progress = (state.z + preset.depth) / (preset.depth + resetThreshold);
        const ribbon =
          Math.sin(progress * Math.PI * 1.65 + flowTime + state.phase) *
          state.curve *
          motionPulse;
        state.x =
          state.laneX +
          ribbon * 1.05 +
          Math.sin(state.z * 0.012 + flowTime * 1.15 + state.phase) *
            state.curve *
            motionPulse *
            0.28;
        state.y =
          state.laneY +
          Math.cos(progress * Math.PI * 1.18 + flowTime * 1.12 + state.phase) *
            state.curve *
            motionPulse *
            0.62;
        if (state.z > resetThreshold) {
          streakStates[index] = spawnStreak(index, false);
          return;
        }
        applyState(streakMesh, index, state, 0.07, 0.06, 1.08);
      });

      sideStates.forEach((state, index) => {
        state.z += delta * state.speed;
        const progress = (state.z + preset.depth) / (preset.depth + resetThreshold);
        state.x =
          state.laneX +
          Math.sin(progress * Math.PI * 1.15 + flowTime + state.phase) *
            state.curve *
            motionPulse *
            0.55;
        state.y =
          state.laneY +
          Math.cos(state.z * 0.01 + flowTime * 0.9 + state.phase) *
            state.curve *
            motionPulse *
            0.42;
        if (state.z > resetThreshold) {
          sideStates[index] = spawnSide(index, false);
          return;
        }
        applyState(sideMesh, index, state, 0.028, 0.16, 1.0);
      });

      laneStates.forEach((state, index) => {
        state.z += delta * (state.speed * 1.03);
        const progress = (state.z + preset.depth) / (preset.depth + resetThreshold);
        const laneWave =
          state.curve * (0.78 + speedBoost * 0.08 + impactPulse * 0.18);
        state.x =
          state.laneX +
          Math.sin(progress * Math.PI * 1.5 + flowTime * 1.28 + state.phase) *
            laneWave *
            1.1;
        state.y =
          state.laneY +
          Math.cos(progress * Math.PI * 1.42 + flowTime * 1.82 + state.phase) *
            laneWave *
            0.82;
        if (state.z > resetThreshold) {
          laneStates[index] = spawnLane(index, false);
          return;
        }
        applyState(laneMesh, index, state, 0.12, 0.038, 1.05);
      });

      starState.forEach((star, index) => {
        star.z += delta * star.speed;
        if (star.z > farPlane) {
          star.x = random(-preset.spreadX * 1.4, preset.spreadX * 1.4);
          star.y = random(-preset.spreadY * 1.3, preset.spreadY * 1.3);
          star.z = -preset.depth;
        }
        starPositions[index * 3] = star.x;
        starPositions[index * 3 + 1] = star.y;
        starPositions[index * 3 + 2] = star.z;
      });

      starAttr.needsUpdate = true;
      streakMesh.instanceMatrix.needsUpdate = true;
      sideMesh.instanceMatrix.needsUpdate = true;
      laneMesh.instanceMatrix.needsUpdate = true;

      composer.render(time);
      frameRef.current = window.requestAnimationFrame(update);
    };

    host.addEventListener("pointermove", pointerMove);
    host.addEventListener("pointerleave", pointerLeave);
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerUp);
    host.addEventListener("click", onClick);

    window.addEventListener("resize", resize);
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : undefined;
    observer?.observe(host);
    resize();
    update();

    return () => {
      runningRef.current = false;
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerleave", pointerLeave);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerUp);
      host.removeEventListener("click", onClick);
      composer.dispose();
      renderer.dispose();
      while (host.firstChild) host.removeChild(host.firstChild);
    };
  }, [preset, presetIndex]);

  return (
    <div
      ref={hostRef}
      className="fixed inset-0 z-0 transition-opacity duration-300"
      style={{ opacity: transitioning ? 0.72 : 1 }}
    />
  );
}
