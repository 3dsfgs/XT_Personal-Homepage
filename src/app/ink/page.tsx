import Link from "next/link";
import { AquaInkGL } from "@/components/effect/AquaInkGL";

export const metadata = {
  title: "墨池 | remio-home",
  description: "墨池 - 黑白水墨发呆解压页",
};

export default function InkPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f0e8] text-[#1a1a1a]">
      <AquaInkGL />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),rgba(245,240,232,0.18)_30%,rgba(245,240,232,0.02)_72%,rgba(245,240,232,0)_100%)]" />
      <header className="absolute left-0 top-0 z-10 flex w-full items-start justify-between px-5 py-4 md:px-8 md:py-6">
        <div className="pointer-events-none">
          <p className="text-xs uppercase tracking-[0.45em] text-black/45">
            AquaInkGL
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[0.3em] md:text-4xl">
            墨池
          </h1>
          <p className="mt-3 max-w-[28rem] text-sm leading-6 text-black/55 md:text-base">
            黑白之间，留一点空白。
          </p>
        </div>
        <Link
          href="/"
          className="pointer-events-auto rounded-full border border-black/15 bg-white/35 px-4 py-2 text-sm text-black/70 backdrop-blur-md transition hover:border-black/25 hover:bg-white/50 hover:text-black"
        >
          返回首页
        </Link>
      </header>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 px-5 py-5 md:px-8 md:py-8">
        <div className="flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-3xl border border-black/10 bg-white/20 px-5 py-4 backdrop-blur-md">
          <p className="text-sm text-black/60">
            试着拖动鼠标或在屏幕上滑动，墨迹会在落点处扩散。
          </p>
          <p className="text-xs tracking-[0.35em] text-black/35">
            FOCUS / RELAX / INK
          </p>
        </div>
      </div>
    </main>
  );
}
