import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "博客 | remio-home",
  description: "小栩的站内 Markdown 博客",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <main className="relative min-h-screen overflow-hidden px-5 pb-16 pt-24 text-[rgba(var(--mio-text-default),1)] md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-[rgba(var(--mio-main),0.58)] p-6 shadow-mio-link backdrop-blur-xl md:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-[#0dbf56]">
            Blog
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            小栩的博客
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[rgba(var(--mio-text-default),0.72)] md:text-base">
            记录实践、发呆、思考；欢迎交流~
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {posts.length ? (
            posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-[1.75rem] border border-white/10 bg-[rgba(var(--mio-main),0.5)] p-6 shadow-mio-link backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[rgba(var(--mio-text-default),0.12)] hover:bg-[rgba(var(--mio-main),0.65)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold tracking-tight text-[rgba(var(--mio-text-default),1)]">
                    {post.title}
                  </h2>
                  <span className="text-xs tracking-[0.25em] text-[rgba(var(--mio-text-default),0.42)]">
                    {post.date}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[rgba(var(--mio-text-default),0.72)]">
                  {post.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[rgba(var(--mio-text-default),0.08)] px-3 py-1 text-xs text-[rgba(var(--mio-text-default),0.58)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(var(--mio-main),0.5)] p-6 text-sm text-[rgba(var(--mio-text-default),0.7)] shadow-mio-link backdrop-blur-xl md:col-span-2">
              还没有文章。你可以先新增一个 `src/content/blog/*.md` 文件。
            </div>
          )}
        </section>
        {/* 返回主页按钮 */}
        <footer className="mt-16 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            ← 返回主页
          </a>
        </footer>
        <section className="rounded-[1.75rem] border border-white/10 bg-[rgba(var(--mio-main),0.42)] p-6 text-sm leading-7 text-[rgba(var(--mio-text-default),0.72)] shadow-mio-link backdrop-blur-xl">
          <p>
            “尽吾志而不能至者，可以无悔矣”
          </p>
          <p className="mt-2">
            “自信人生二百年，会当水击三千里”
          </p>
          <p className="mt-2">
            “坚冰还盖着北海的时候，我看见了怒放的梅花”
          </p>
        </section>
      </div>
    </main>
  );
}
