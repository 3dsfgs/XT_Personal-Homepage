import Link from "next/link";

export const metadata = {
  title: "青木星 | remio-home",
  description: "青木星 - 使用原始 AquaInkGL 水墨效果的静态解压页",
};

export default function InkPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <iframe
        title="AquaInkGL"
        src="/AquaInkGL/index.html"
        className="absolute inset-0 h-full w-full border-0"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(0,0,0,0.04)_36%,rgba(0,0,0,0.22)_100%)]" />
      <header className="pointer-events-none absolute left-0 top-0 z-10 flex w-full items-start justify-between px-4 py-4 md:px-8 md:py-6">
        <div className="pointer-events-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.45em] text-white/40">
            AquaInkGL
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[0.25em]">
            青木星
          </h1>
        </div>
        <Link
          href="/"
          className="pointer-events-auto rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75 backdrop-blur-md transition hover:border-white/25 hover:bg-black/35 hover:text-white"
        >
          返回首页
        </Link>
      </header>
    </main>
  );
}
