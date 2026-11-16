"use client";

import { useEffect, useState } from "react";

export type LocalWeather = {
  city: string;
  weather: string;
  temperature: string;
  humidity?: string;
  windpower?: string;
};

const REFRESH = 10 * 60 * 1000;
let cached: LocalWeather | null = null;
let checkedAt = 0;
let pending: Promise<LocalWeather | null> | null = null;

// Share the existing IP-based weather lookup between the badge and background.
// A failure leaves the seasonal artwork working without blocking the page.
function loadWeather() {
  if (pending) return pending;
  if (Date.now() - checkedAt < REFRESH) return Promise.resolve(cached);
  cached = null;
  pending = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch("/api/weather", {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) return null;
      const result = await response.json();
      if (result.success && typeof result.data?.weather === "string") {
        cached = result.data;
        return cached;
      }
      return null;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
      checkedAt = Date.now();
      pending = null;
    }
  })();
  return pending;
}

export function useLocalWeather(enabled = true) {
  const [weather, setWeather] = useState<LocalWeather | null>(null);
  useEffect(() => {
    if (!enabled) {
      setWeather(null);
      return;
    }
    let disposed = false;
    const refresh = () => {
      if (document.hidden) return;
      void loadWeather().then((value) => {
        if (!disposed) setWeather(value);
      });
    };
    refresh();
    const timer = setInterval(refresh, REFRESH);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      disposed = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [enabled]);
  return weather;
}
