import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "文章不存在 | remio-home",
    };
  }

  return {
    title: `${post.title} | 博客`,
    description: post.summary,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="relative min-h-screen px-5 pb-16 pt-24 text-[rgba(var(--mio-text-default),1)] md:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/blog"
            className="rounded-full border border-white/10 bg-[rgba(var(--mio-main),0.45)] px-4 py-2 text-sm text-[rgba(var(--mio-text-default),0.72)] shadow-mio-link backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-[rgba(var(--mio-text-default),1)]"
          >
            返回博客
          </Link>
          <span className="text-xs tracking-[0.35em] text-[rgba(var(--mio-text-default),0.42)]">
            {post.date}
          </span>
        </div>

        <article className="rounded-[2rem] border border-white/10 bg-[rgba(var(--mio-main),0.58)] p-6 shadow-mio-link backdrop-blur-xl md:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-[#0dbf56]">
            Markdown Post
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[rgba(var(--mio-text-default),0.72)] md:text-base">
            {post.summary}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[rgba(var(--mio-text-default),0.08)] px-3 py-1 text-xs text-[rgba(var(--mio-text-default),0.58)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            className="mt-8 text-[rgba(var(--mio-text-default),0.92)]"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
      </div>
    </main>
  );
}
