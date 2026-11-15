"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function GlobalThemeControl() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
      aria-pressed={dark}
      title={dark ? "切换到浅色模式" : "切换到深色模式"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-black/20 bg-white/90 text-xl text-amber-700 shadow-[0_8px_28px_rgba(0,0,0,.28)] backdrop-blur-md transition duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-white/30 dark:bg-[#171923]/90 dark:text-amber-200"
    >
      <span aria-hidden="true">{dark ? "☾" : "☀"}</span>
    </button>
  );
}
