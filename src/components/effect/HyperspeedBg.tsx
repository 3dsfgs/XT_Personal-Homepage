"use client";

import { useEffect, useMemo, useRef } from "react";
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

const PRESETS: HyperspeedPreset[] = [
  {
    background: 0x03040a,
    fogNear: 20,
    fogFar: 240,
    roadColor: 0x05070d,
    streakColor: 0x9fefff,
    sideColor: 0xd9ffff,
    accentColor: 0xffffff,
    fov: 76,
    cameraX: 0,
    cameraY: 2.1,
    cameraZ: 12,
    baseSpeed: 92,
    speedSpread: 28,
    streakCount: 230,
    sideCount: 44,
    starCount: 180,
    spreadX: 10,
    spreadY: 3.8,
    depth: 230,
  },
  {
    background: 0x090611,
    fogNear: 20,
    fogFar: 220,
    roadColor: 0x0a0713,
    streakColor: 0xd8a7ff,
    sideColor: 0xf1d7ff,
    accentColor: 0xffffff,
    fov: 78,
    cameraX: 0.2,
    cameraY: 2.15,
    cameraZ: 12,
    baseSpeed: 88,
    speedSpread: 24,
    streakCount: 220,
    sideCount: 40,
    starCount: 170,
    spreadX: 9.5,
    spreadY: 3.4,
    depth: 220,
  },
  {
    background: 0x020804,
    fogNear: 18,
    fogFar: 230,
    roadColor: 0x040b06,
    streakColor: 0x7dffbf,
    sideColor: 0xdcffe8,
    accentColor: 0xffffff,
    fov: 75,
    cameraX: -0.15,
    cameraY: 2.0,
    cameraZ: 12,
    baseSpeed: 94,
    speedSpread: 32,
    streakCount: 240,
    sideCount: 48,
    starCount: 180,
    spreadX: 10.5,
    spreadY: 3.5,
    depth: 230,
  },
  {
    background: 0x0c0705,
    fogNear: 24,
    fogFar: 240,
    roadColor: 0x120805,
    streakColor: 0xffc270,
    sideColor: 0xffecd4,
    accentColor: 0xffffff,
    fov: 79,
    cameraX: 0,
    cameraY: 2.2,
    cameraZ: 12,
    baseSpeed: 86,
    speedSpread: 20,
    streakCount: 210,
    sideCount: 38,
    starCount: 160,
    spreadX: 9.4,
    spreadY: 3.3,
    depth: 210,
  },
  {
    background: 0x010101,
    fogNear: 20,
    fogFar: 210,
    roadColor: 0x050505,
    streakColor: 0xf6f6f6,
    sideColor: 0xd8d8d8,
    accentColor: 0xffffff,
    fov: 74,
    cameraX: 0,
    cameraY: 2.0,
    cameraZ: 12,
    baseSpeed: 96,
    speedSpread: 36,
    streakCount: 250,
    sideCount: 52,
    starCount: 200,
    spreadX: 10.8,
    spreadY: 3.9,
    depth: 240,
  },
];

type State = {
  x: number;
  y: number;
  z: number;
  speed: number;
  scale: number;
  rotation: number;
};

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

export default function HyperspeedBg({
  presetIndex = 0,
}: {
  presetIndex?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(true);

  const preset = useMemo(
    () => PRESETS[Math.abs(presetIndex) % PRESETS.length],
    [presetIndex]
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    runningRef.current = true;

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
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(preset.background);
    scene.fog = new THREE.Fog(preset.background, preset.fogNear, preset.fogFar);

    const camera = new THREE.PerspectiveCamera(
      preset.fov,
      host.clientWidth / host.clientHeight,
      0.1,
      2000
    );
    camera.position.set(preset.cameraX, preset.cameraY, preset.cameraZ);
    camera.lookAt(0, 0, -80);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new EffectPass(
      camera,
      new BloomEffect({
        intensity: 1.15,
        luminanceThreshold: 0.16,
        luminanceSmoothing: 0.45,
      })
    );
    bloomPass.renderToScreen = true;
    composer.addPass(bloomPass);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(60, preset.depth * 1.25),
      new THREE.MeshBasicMaterial({
        color: preset.roadColor,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
      })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -1.85, -preset.depth * 0.48);
    scene.add(road);

    const streakGeometry = new THREE.BoxGeometry(0.05, 0.05, 1);
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

    const sideGeometry = new THREE.BoxGeometry(0.02, 0.14, 0.8);
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
      dummy.scale.set(xScale * state.scale, yScale * state.scale, zScale * state.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    };

    const spawnStreak = (index: number, initial = false): State => {
      const state = {
        x: random(-preset.spreadX, preset.spreadX),
        y: random(-preset.spreadY, preset.spreadY),
        z: initial ? random(-preset.depth, preset.depth * 0.2) : -preset.depth - Math.random() * preset.depth * 0.35,
        speed: preset.baseSpeed + random(-preset.speedSpread, preset.speedSpread),
        scale: random(0.7, 1.65),
        rotation: random(-0.18, 0.18),
      };
      applyState(streakMesh, index, state, 0.05, 0.05, 1.0);
      return state;
    };

    const spawnSide = (index: number, initial = false): State => {
      const direction = index % 2 === 0 ? -1 : 1;
      const state = {
        x: direction * random(preset.spreadX * 1.06, preset.spreadX * 1.35),
        y: random(-1.2, 0.8),
        z: initial ? random(-preset.depth, preset.depth * 0.1) : -preset.depth - Math.random() * preset.depth * 0.25,
        speed: preset.baseSpeed + random(-preset.speedSpread * 0.6, preset.speedSpread * 0.6),
        scale: random(0.6, 1.5),
        rotation: random(-0.05, 0.05),
      };
      applyState(sideMesh, index, state, 0.02, 0.14, 0.8);
      return state;
    };

    for (let i = 0; i < preset.streakCount; i += 1) streakStates.push(spawnStreak(i, true));
    for (let i = 0; i < preset.sideCount; i += 1) sideStates.push(spawnSide(i, true));
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
    const onPointerDown = () => {
      speedTarget = 1.6;
      fovTarget = preset.fov + 10;
    };
    const onPointerUp = () => {
      speedTarget = 0;
      fovTarget = preset.fov;
    };

    const update = () => {
      if (!runningRef.current) return;
      const delta = Math.min(clock.getDelta(), 0.033);
      const speedLerp = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
      speedBoost = lerp(speedBoost, speedTarget, speedLerp);
      const time = clock.elapsedTime + speedBoost;

      pointerCurrent.x = lerp(pointerCurrent.x, pointerTarget.x, 0.05);
      pointerCurrent.y = lerp(pointerCurrent.y, pointerTarget.y, 0.05);

      camera.position.x = lerp(camera.position.x, preset.cameraX + pointerCurrent.x * 1.35, 0.05);
      camera.position.y = lerp(camera.position.y, preset.cameraY + pointerCurrent.y * 0.85, 0.05);
      camera.lookAt(pointerCurrent.x * 6, pointerCurrent.y * 2.4, -86);
      camera.fov = lerp(camera.fov, fovTarget, 0.08);
      camera.updateProjectionMatrix();

      const resetThreshold = 22;
      const farPlane = preset.depth * 0.55;

      streakStates.forEach((state, index) => {
        state.z += delta * state.speed;
        state.x += Math.sin(state.z * 0.008 + index * 0.19) * delta * 0.26;
        if (state.z > resetThreshold) {
          streakStates[index] = spawnStreak(index, false);
          return;
        }
        applyState(streakMesh, index, state, 0.05, 0.05, 1.0);
      });

      sideStates.forEach((state, index) => {
        state.z += delta * state.speed;
        state.y += Math.cos(state.z * 0.01 + index * 0.17) * delta * 0.08;
        if (state.z > resetThreshold) {
          sideStates[index] = spawnSide(index, false);
          return;
        }
        applyState(sideMesh, index, state, 0.02, 0.14, 0.8);
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

      composer.render(time);
      requestAnimationFrame(update);
    };

    host.addEventListener("pointermove", pointerMove);
    host.addEventListener("pointerleave", pointerLeave);
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerUp);

    window.addEventListener("resize", resize);
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : undefined;
    observer?.observe(host);
    resize();
    update();

    return () => {
      runningRef.current = false;
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerleave", pointerLeave);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerUp);
      composer.dispose();
      renderer.dispose();
      while (host.firstChild) host.removeChild(host.firstChild);
    };
  }, [preset]);

  return <div ref={hostRef} className="fixed inset-0 z-0" />;
}
