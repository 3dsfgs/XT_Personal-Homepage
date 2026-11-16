import * as THREE from "three";
import type { LocalWeather } from "../weather/useLocalWeather";

export type Season = "spring" | "summer" | "autumn" | "winter";
export type SeasonMode = "auto" | Season;
export const SEASON_MODES: SeasonMode[] = ["auto", "spring", "summer", "autumn", "winter"];

const SEASONS = {
  spring: {
    name: "春",
    detail: "花信微风",
    tint: 0x91c7ad,
    particle: 0xf0b8c6,
    kind: 0,
    fall: 0.035,
    haze: 0.035,
  },
  summer: {
    name: "夏",
    detail: "流萤晚风",
    tint: 0x509c9d,
    particle: 0xc9df97,
    kind: 1,
    fall: -0.018,
    haze: 0.02,
  },
  autumn: {
    name: "秋",
    detail: "落叶金风",
    tint: 0xc89766,
    particle: 0xe7b37a,
    kind: 2,
    fall: 0.045,
    haze: 0.04,
  },
  winter: {
    name: "冬",
    detail: "薄雾微雪",
    tint: 0x9fbddc,
    particle: 0xdbe9f8,
    kind: 3,
    fall: 0.028,
    haze: 0.065,
  },
};

export function seasonOf(date: Date): Season {
  const month = date.getMonth() + 1;
  return month >= 3 && month <= 5
    ? "spring"
    : month >= 6 && month <= 8
      ? "summer"
      : month >= 9 && month <= 11
        ? "autumn"
        : "winter";
}

export function atmosphereProfile(date: Date, mode: SeasonMode, weather: LocalWeather | null) {
  const season = mode === "auto" ? seasonOf(date) : mode;
  const base = SEASONS[season];
  const live = mode === "auto" ? weather : null;
  const condition = live?.weather || "";
  const night = date.getHours() < 6 || date.getHours() >= 19;
  const rain = /雨/.test(condition);
  const snow = /雪/.test(condition);
  const fog = /雾|霾/.test(condition);
  const cloudy = /阴|多云/.test(condition);
  const humidity = Number(live?.humidity);
  const humid = Number.isFinite(humidity) ? Math.max(0, Math.min(1, humidity / 100)) : 0.5;
  return {
    season,
    name: base.name,
    detail: live ? condition : base.detail,
    source: live ? `${live.city || "当地"}天气` : "季节氛围",
    tint: base.tint,
    particle: rain ? 0xa9c9e4 : snow ? SEASONS.winter.particle : base.particle,
    kind: snow ? 3 : rain ? 4 : base.kind,
    fall: rain ? 0.48 : snow ? 0.035 : base.fall,
    haze: Math.min(
      0.18,
      base.haze + (fog ? 0.08 : rain ? 0.04 : cloudy ? 0.02 : 0) + humid * 0.01,
    ),
    night,
  };
}

export type AtmosphereProfile = ReturnType<typeof atmosphereProfile>;

/** Mist uses the scene's depth fog. Only sparse particles get an extra draw call. */
export function createSeasonalAtmosphere(scene: THREE.Scene, compact: boolean) {
  const count = compact ? 22 : 48;
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(seeds, 3));
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTint: { value: new THREE.Color(0xdbe9f8) },
      uKind: { value: 3 },
      uFall: { value: 0.028 },
      uPixelScale: { value: 400 },
      uOpacity: { value: 0.13 },
      uWind: { value: new THREE.Vector2() },
    },
    vertexShader: `
      uniform float uTime, uFall, uPixelScale, uKind, uOpacity;
      uniform vec2 uWind;
      varying float vSeed, vOpacity;
      void main() {
        // Perspective and depth testing keep these inside the scene, off the screen plane.
        float t = uTime * (0.6 + position.z * 0.6);
        float life = fract(position.y + t * uFall * 0.4);
        vec3 p = vec3((position.x - 0.5) * 72.0, 16.0 - life * 32.0, -6.0 - position.z * 72.0);
        p.x += sin(t * 0.25 + position.y * 40.0) * (0.6 + position.z) + uWind.x * (0.8 + position.z);
        p.y += uWind.y * 0.6;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        float depth = max(1.0, -mvPosition.z);
        float size = uKind > 3.5 ? 0.35 : uKind > 2.5 ? 0.10 : uKind > 0.5 && uKind < 1.5 ? 0.10 : 0.19;
        gl_PointSize = clamp(size * uPixelScale * projectionMatrix[1][1] / depth, 1.0, 9.0);
        vSeed = position.x * 30.0 + position.y * 15.0;
        float fade = smoothstep(3.0, 12.0, depth) * (1.0 - smoothstep(30.0, 86.0, depth));
        fade *= smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.85, 1.0, life));
        vOpacity = uOpacity * fade * (0.8 + sin(t + vSeed) * 0.2);
      }
    `,
    fragmentShader: `
      uniform float uTime, uKind;
      uniform vec3 uTint;
      varying float vSeed, vOpacity;
      void main() {
        vec2 p = gl_PointCoord - 0.5;
        float angle = vSeed + uTime * 0.3;
        vec2 q = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p;
        float shape = 1.0 - smoothstep(0.15, 0.5, length(p));
        if (uKind < 0.5) shape = 1.0 - smoothstep(0.25, 0.48, length(q * vec2(1.6, 0.85)));
        else if (uKind > 1.5 && uKind < 2.5) shape = 1.0 - smoothstep(0.3, 0.48, abs(q.x) * 0.8 + abs(q.y) * 1.4);
        else if (uKind > 3.5) shape = (1.0 - smoothstep(0.025, 0.085, abs(p.x + p.y * 0.12))) * (1.0 - smoothstep(0.25, 0.5, abs(p.y)));
        gl_FragColor = vec4(uTint * 0.55, shape * vOpacity);
      }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const particles = new THREE.Points(geometry, particleMaterial);
  particles.frustumCulled = false;
  scene.add(particles);

  const particle = new THREE.Color();
  let time = 0;
  return {
    update(
      delta: number,
      profile: AtmosphereProfile,
      x: number,
      y: number,
      gust: number,
      reduced: boolean,
    ) {
      time += delta;
      const blend = reduced ? 1 : 1 - Math.exp(-delta * 1.5);
      particle.setHex(profile.particle);
      particleMaterial.uniforms.uTime.value = time;
      particleMaterial.uniforms.uKind.value = profile.kind;
      particleMaterial.uniforms.uFall.value = profile.fall;
      particleMaterial.uniforms.uTint.value.lerp(particle, blend);
      particleMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        particleMaterial.uniforms.uOpacity.value,
        (profile.kind === 4 ? 0.2 : 0.13) * (compact ? 0.8 : 1),
        blend,
      );
      particleMaterial.uniforms.uWind.value.set(x + gust * 0.2, y);
      particles.visible = !reduced;
    },
    resize(height: number, pixelRatio: number) {
      particleMaterial.uniforms.uPixelScale.value = Math.max(height, 1) * pixelRatio * 0.5;
    },
    dispose() {
      scene.remove(particles);
      geometry.dispose();
      particleMaterial.dispose();
    },
  };
}
