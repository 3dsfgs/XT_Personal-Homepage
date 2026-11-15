import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { AboutSection, Lang } from "@/content/about";

const BLOG_DIR = join(process.cwd(), "src", "content", "blog");

/** 从一篇 Markdown 中取出第一张图片的路径 */
export function firstImageOfPost(slug: string): string | null {
  const filePath = join(BLOG_DIR, `${slug}.md`);
  if (!existsSync(filePath)) return null;
  const match = readFileSync(filePath, "utf-8").match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match ? match[1] : null;
}

/** 把 welcome.md 按语言（# 中文 / # English）和 ## 标题拆成段落 */
export function getAboutSections(): Record<Lang, Record<string, AboutSection>> {
  const filePath = join(BLOG_DIR, "welcome.md");
  const source = existsSync(filePath) ? readFileSync(filePath, "utf-8") : "";
  const body = source.replace(/\r\n/g, "\n").replace(/^---[\s\S]*?\n---\s*/, "");
  const result = { zh: {}, en: {} } as Record<Lang, Record<string, AboutSection>>;

  (["zh", "en"] as Lang[]).forEach((lang) => {
    const heading = lang === "zh" ? "# 中文" : "# English";
    const start = body.indexOf(heading);
    if (start < 0) return;
    const next = body.indexOf("\n# ", start + heading.length);
    const chunk = body.slice(start, next < 0 ? undefined : next);

    chunk
      .split(/^## /m)
      .slice(1)
      .forEach((block) => {
        const [titleLine, ...rest] = block.split("\n");
        const title = titleLine.trim();
        const section: AboutSection = { title, paragraphs: [], bullets: [], images: [] };

        rest
          .map((line) => line.trim())
          .filter((line) => line && line !== "---")
          .forEach((line) => {
            const image = line.match(/^!\[[^\]]*\]\(([^)]+)\)/);
            if (image) section.images.push(image[1]);
            else if (/^[-*+]\s+/.test(line))
              section.bullets.push(
                line.replace(/^[-*+]\s+/, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
              );
            else section.paragraphs.push(line);
          });

        result[lang][title] = section;
      });
  });

  return result;
}
