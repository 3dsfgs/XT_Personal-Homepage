import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

const BLOG_DIR = join(process.cwd(), "src", "content", "blog");

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  content: string;
  html: string;
  excerpt: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(value: string) {
  let text = escapeHtml(value);

  // 1. 🌟 新增：优先拦截并解析图片语法 ![alt](url)
  // 1. 优先拦截并解析图片语法 ![alt](url)
  // width: 40% !important;：整体缩小 60%（只剩 40% 宽度）。
  //border-radius: 12px;：修改圆角大小。
  //order: 1px solid rgba(255, 255, 255, 0.2);：修改微弱边框（0.2 代表 20% 透明度的白边）。
  text = text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, alt: string, src: string) => {
      return `<img src="${src}" alt="${alt}" style="width: 60% !important; height: auto !important; display: block; margin: 1.25rem 0; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />`;
    }
  );
  // 2. 解析普通超链接 [label](href) （保持你原本的逻辑不变）
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, href: string) => {
      const external = /^https?:\/\//i.test(href);
      return `<a class="text-[#0dbf56] underline-offset-4 transition hover:underline" href="${href}"${
        external ? ' target="_blank" rel="noreferrer"' : ""
      }>${label}</a>`;
    }
  );

  // 3. 解析行内代码、加粗和斜体（保持原本逻辑不变）
  text = text.replace(
    /`([^`]+)`/g,
    "<code class=\"rounded bg-[rgba(var(--mio-text-default),0.08)] px-1 py-0.5 text-[0.95em] text-[rgba(var(--mio-text-default),0.94)]\">$1</code>"
  );
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong class=\"font-semibold text-[rgba(var(--mio-text-default),1)]\">$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em class=\"italic text-[rgba(var(--mio-text-default),0.9)]\">$1</em>");

  return text;
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFrontmatter(source: string) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return {
      meta: {},
      content: source.trim(),
    };
  }

  const meta: Record<string, string | string[]> = {};
  match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex < 0) return;
      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      if (!key) return;

      if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
        meta[key] = rawValue
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
        return;
      }

      meta[key] = rawValue.replace(/^["']|["']$/g, "");
    });

  return {
    meta,
    content: match[2].trim(),
  };
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let quoteLines: string[] = [];
  let codeLines: string[] = [];
  let inCode = false;
  let codeLang = "";

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(
      `<p class="my-4 text-base leading-7 text-[rgba(var(--mio-text-default),0.86)]">${renderInline(
        paragraph.join(" ").trim()
      )}</p>`
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push(
      `<ul class="my-4 list-disc space-y-2 pl-6">${listItems
        .map(
          (item) =>
            `<li class="leading-7 text-[rgba(var(--mio-text-default),0.86)]">${renderInline(
              item
            )}</li>`
        )
        .join("")}</ul>`
    );
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    blocks.push(
      `<blockquote class="my-4 border-l-2 border-[rgba(var(--mio-text-default),0.18)] pl-4 italic text-[rgba(var(--mio-text-default),0.72)]">${quoteLines
        .map((item) => renderInline(item))
        .join("<br />")}</blockquote>`
    );
    quoteLines = [];
  };

  const flushCode = () => {
    if (!codeLines.length) return;
    blocks.push(
      `<pre class="my-5 overflow-auto rounded-2xl bg-black/80 p-4 text-sm text-white"><code${
        codeLang ? ` data-lang="${escapeHtml(codeLang)}"` : ""
      }>${escapeHtml(codeLines.join("\n"))}</code></pre>`
    );
    codeLines = [];
    codeLang = "";
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        flushQuote();
        inCode = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = headingMatch[1].length;
      const headingClass =
        level === 1
          ? "mt-10 text-3xl font-semibold tracking-tight"
          : level === 2
            ? "mt-8 text-2xl font-semibold tracking-tight"
            : level === 3
              ? "mt-6 text-xl font-semibold"
              : "mt-5 text-lg font-semibold";
      blocks.push(
        `<h${level} class="${headingClass}">${renderInline(headingMatch[2])}</h${level}>`
      );
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      flushList();
      quoteLines.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      listItems.push(trimmed.replace(/^[-*+]\s+/, ""));
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushQuote();
  flushCode();

  return blocks.join("\n");
}

function readPostFile(filePath: string): BlogPost {
  const slug = filePath.replace(/\.md$/, "");
  const source = readFileSync(join(BLOG_DIR, filePath), "utf-8");
  const { meta, content } = parseFrontmatter(source);
  const title = typeof meta.title === "string" ? meta.title : slug;
  const date = typeof meta.date === "string" ? meta.date : "2026-06-01";
  const summary =
    typeof meta.summary === "string"
      ? meta.summary
      : typeof meta.description === "string"
        ? meta.description
        : stripMarkdown(content).slice(0, 160);
  const tags = Array.isArray(meta.tags)
    ? meta.tags
    : typeof meta.tags === "string" && meta.tags
      ? meta.tags.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  return {
    slug,
    title,
    date,
    summary,
    tags,
    content,
    html: markdownToHtml(content),
    excerpt: summary || stripMarkdown(content).slice(0, 120),
  };
}

export function getBlogPosts() {
  if (!existsSync(BLOG_DIR)) return [];

  return readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(""))
    .map((file) => readPostFile(file))
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function getBlogPostBySlug(slug: string) {
  const filePath = join(BLOG_DIR, `${slug}.md`);
  if (!existsSync(filePath)) return null;
  return readPostFile(`${slug}.md`);
}
