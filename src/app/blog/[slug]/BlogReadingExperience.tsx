"use client";

import { useEffect, useRef, useState } from "react";
import "./blog-reading.css";

type Section = { id: string; title: string };

export function BlogReadingExperience({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const headings = Array.from(content.querySelectorAll<HTMLHeadingElement>("h2"));
    const items = headings.map((heading, index) => {
      const id = `story-section-${index + 1}`;
      heading.id = id;
      return { id, title: heading.textContent || "" };
    });
    setSections(items);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const blocks = Array.from(content.children) as HTMLElement[];
    let observer: IntersectionObserver | undefined;
    if (!reduceMotion.matches && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      blocks.forEach((block) => {
        block.classList.add("story-reveal");
        observer?.observe(block);
      });
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const top = content.getBoundingClientRect().top + window.scrollY;
      const height = content.offsetHeight - window.innerHeight * 0.65;
      setProgress(Math.max(0, Math.min(100, ((window.scrollY - top) / Math.max(height, 1)) * 100)));
      const current = headings.reduce(
        (result, heading, index) =>
          heading.getBoundingClientRect().top <= window.innerHeight * 0.38 ? index : result,
        0
      );
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [html]);

  return (
    <div className="blog-story-layout">
      <nav className="blog-story-nav" aria-label="文章章节">
        <span className="blog-story-nav-label">SECTIONS / 章节</span>
        {sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={active === index ? "location" : undefined}
            className={active === index ? "is-active" : ""}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {section.title}
          </a>
        ))}
        <div className="blog-story-track" aria-hidden="true">
          <span style={{ height: `${progress}%` }} />
        </div>
      </nav>
      <div
        ref={contentRef}
        className="blog-story-content text-[rgba(var(--mio-text-default),0.92)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
