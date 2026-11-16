"use client";

/* eslint-disable @next/next/no-img-element -- Archive images use their original local files and aspect ratios. */

import Link from "next/link";
import { useTheme } from "next-themes";
import { MotionConfig } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { aboutConfig as C, type AboutSection, type I18n, type Lang } from "@/content/about";
import { PastCarousel, type PastCard } from "./PastCarousel";
import { GeometryStudy } from "./GeometryStudy";
import { Icon, Reveal, RollNumber, SectionHead, Watermark, custom, pad } from "./reference-parts";

type Props = { sections: Record<Lang, Record<string, AboutSection>>; cards: PastCard[] };
type Translate = (value: I18n) => string;
const EMPTY: AboutSection = { title: "", paragraphs: [], bullets: [], images: [] };
const CHAPTERS = [
  ["ab-hero", "Profile"],
  ["ab-now", "Now"],
  ["ab-past", "Past"],
  ["ab-site", "README"],
  ["ab-later", "Later"],
  ["ab-fin", "Fin"],
  ["ab-colophon", "Colophon"],
] as const;

function Contacts({
  t,
  onCopy,
  ending = false,
}: {
  t: Translate;
  onCopy: () => void;
  ending?: boolean;
}) {
  const contacts = [
    { label: "Email", value: C.email, href: `mailto:${C.email}`, icon: "mail" as const },
    {
      label: "GitHub",
      value: "@" + C.github.split("/").pop(),
      href: C.github,
      icon: "github" as const,
    },
    {
      label: t({ zh: "坐标", en: "Based in" }),
      value: t(C.location),
      href: "#ab-hero",
      icon: "arrow" as const,
    },
  ];
  return (
    <ul className={ending ? "oo-fin__contacts" : "oo-contacts"}>
      {contacts.map((contact, index) => (
        <li
          key={index}
          className={`${ending ? "oo-fin__crow" : ""} ${index === 0 ? "has-copy" : ""}`}
        >
          <a
            className={ending ? "oo-fin__clink" : "oo-contacts__row"}
            href={contact.href}
            {...(index === 1 ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <Icon kind={contact.icon} className={ending ? "oo-fin__cicon" : "oo-contacts__icon"} />
            <span className={ending ? "oo-fin__clabel" : "oo-contacts__label"}>
              {contact.label}
              {ending ? "" : ":"}
            </span>
            <span className={ending ? "oo-fin__cval" : "oo-contacts__value"}>
              <span className="oo-link-draw">{contact.value}</span>
            </span>
            {(!ending || index !== 0) && (
              <Icon size={16} className={ending ? "oo-fin__carrow" : "oo-contacts__arrow"} />
            )}
          </a>
          {index === 0 && (
            <button
              type="button"
              className={ending ? "oo-sq-btn oo-fin__copy" : "oo-copy"}
              aria-label={t({ zh: "复制邮箱地址", en: "Copy email address" })}
              onClick={onCopy}
            >
              <Icon kind="copy" size={16} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function Hero({
  t,
  lang,
  intro,
  latest,
  count,
  onCopy,
}: {
  t: Translate;
  lang: Lang;
  intro: AboutSection;
  latest?: PastCard;
  count: number;
  onCopy: () => void;
}) {
  const name = t(C.name);
  const heroRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let ready = false;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout>;
    const play = () => {
      if (disposed) return;
      if (preference.matches) {
        hero.dataset.entrance = "static";
      } else if (ready && !document.hidden) {
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            if (!disposed) hero.dataset.entrance = "playing";
          });
        });
      }
    };
    hero.dataset.entrance = preference.matches ? "static" : "waiting";
    // Start after the actual name fonts load, with a bounded fallback on slow connections.
    const fonts = Promise.allSettled([
      document.fonts.load('700 80px "About Noto Serif SC"', name),
      document.fonts.load('400 80px "About Newsreader"', "About"),
    ]);
    void Promise.race([
      fonts,
      new Promise((resolve) => {
        timer = setTimeout(resolve, 900);
      }),
    ]).then(() => {
      ready = true;
      play();
    });
    document.addEventListener("visibilitychange", play);
    preference.addEventListener("change", play);
    return () => {
      disposed = true;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", play);
      preference.removeEventListener("change", play);
    };
  }, [name]);

  return (
    <section ref={heroRef} id="ab-hero" className="oo-hero" aria-labelledby="oo-about-h1">
      <Watermark kind="mesh" className="yu-watermark--hero" />
      <div className="oo-hero__bar" data-hero-fade="" style={custom({ "--d": 0 })}>
        <span>
          <span className="oo-amber-text">No.01</span> — Profile
        </span>
        <span className="oo-hero__dateline">
          Latest project <span className="oo-hero__num">{latest?.date || "2026"}</span>
          <span className="oo-hero__sep">/</span>
          <span className="oo-hero__num">{pad(count)}</span> Frames
        </span>
      </div>
      <aside className="oo-note" role="note" data-hero-fade="" style={custom({ "--d": 1 })}>
        <span className="oo-note__seal">
          <Icon kind="spark" size={22} />
        </span>
        <span className="oo-note__body">
          <span className="oo-note__tag">Editor’s note</span>
          <strong className="oo-note__title">
            {t({ zh: "把想法真正做出来。", en: "Turn ideas into things." })}
          </strong>
          <span className="oo-note__text">{intro.paragraphs.at(-1)}</span>
        </span>
      </aside>
      <div className="oo-hero__h1" data-hero-fade="" style={custom({ "--d": 1 })}>
        <span className="oo-hero__h1-latin" aria-hidden="true">
          About
        </span>
        <h1 id="oo-about-h1" className="oo-hero__h1-zh">
          {t(C.title)}
        </h1>
      </div>
      <div className="oo-hero__grid">
        <div className="oo-intro">
          <span className="oo-intro__hello" data-hero-fade="" style={custom({ "--d": 2 })}>
            {t({ zh: "你好，这里是", en: "Hello, I am" })}
          </span>
          <span className="oo-intro__namerow">
            <strong
              className={`oo-intro__name ${lang === "en" ? "yu-name-en" : ""}`}
              aria-label={name}
            >
              {Array.from(name).map((char, i) => (
                <span key={i} className="oo-intro__mask" aria-hidden="true">
                  <span className="oo-intro__char" data-hero-char="" style={custom({ "--i": i })}>
                    {char}
                  </span>
                </span>
              ))}
            </strong>
            <span className="oo-intro__alias" data-hero-fade="" style={custom({ "--d": 3 })}>
              （{t(C.traits[0])}）
            </span>
          </span>
          {intro.paragraphs.slice(0, -1).map((paragraph, i) => (
            <Reveal as="p" key={paragraph} className="oo-intro__lede" delay={i * 0.08}>
              {paragraph}
            </Reveal>
          ))}
        </div>
        <div className="oo-hero__side">
          <div className="oo-bazi" data-hero-fade="" style={custom({ "--d": 5 })}>
            <p className="oo-label">{t({ zh: "赛博八字", en: "Cyber profile" })}</p>
            <ul className="oo-bazi__list">
              {C.traits.slice(1).map((trait, i) => (
                <li className="oo-bazi__chip" key={i}>
                  <span className="oo-bazi__idx" aria-hidden="true">
                    {["i", "ii", "iii"][i]}
                  </span>
                  <span className="oo-bazi__val">{t(trait)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div data-hero-fade="" style={custom({ "--d": 6 })}>
            <Contacts t={t} onCopy={onCopy} />
          </div>
          <p className="yu-coordinates" data-hero-fade="" style={custom({ "--d": 7 })}>
            <RollNumber text={C.coordinate} />
          </p>
        </div>
      </div>
      {intro.bullets.filter(
        (b) => !/github|开源项目|open-source|ENFP|狮子|Leo|北漂|Beijing/.test(b),
      ).length > 0 && (
        <ul className="yu-profile-notes">
          {intro.bullets
            .filter((b) => !/github|开源项目|open-source|ENFP|狮子|Leo|北漂|Beijing/.test(b))
            .map((b) => (
              <Reveal as="li" key={b}>
                {b}
              </Reveal>
            ))}
        </ul>
      )}
    </section>
  );
}

function Now({
  s,
  t,
  latest,
  lang,
}: {
  s: AboutSection;
  t: Translate;
  latest?: PastCard;
  lang: Lang;
}) {
  const groups = [[0, 4], [1], [2], [3, ...s.bullets.map((_, i) => i).filter((i) => i >= 5)]];
  const labels = [
    { title: { zh: "AI 日常", en: "Everyday AI" }, en: "Practice", key: "work" },
    { title: { zh: "开源", en: "Open source" }, en: "Open source", key: "oss" },
    { title: { zh: "图形与几何", en: "Graphics & geometry" }, en: "Rendering", key: "write" },
    { title: { zh: "独立开发", en: "Independent development" }, en: "Making", key: "act" },
  ];
  return (
    <section id="ab-now" className="oo-now oo-block" aria-labelledby="oo-now-title">
      <div className="yu-section-opening">
        <div>
          <div className="oo-now__head">
            <SectionHead id="oo-now-title" no={2} label="Now" title={s.title} />
            <span className="oo-now__live" aria-hidden="true">
              <span className="oo-now__pulse" />
              Now
            </span>
          </div>
          {s.paragraphs
            .filter((p) => !/[：:]$/.test(p))
            .slice(0, 1)
            .map((p) => (
              <Reveal as="p" key={p} className="yu-section-lede">
                {p}
              </Reveal>
            ))}
        </div>
        <GeometryStudy kind="mesh" lang={lang} />
      </div>
      <div className="oo-dash">
        {labels.map((group, i) => (
          <Reveal className={`oo-panel oo-panel--${group.key}`} key={group.key} delay={i * 0.06}>
            <header className="oo-panel__head">
              <span className="oo-panel__idx">{["i.", "ii.", "iii.", "iv."][i]}</span>
              <h3 className="oo-panel__title">{t(group.title)}</h3>
              <span className="oo-panel__en">{group.en}</span>
            </header>
            <ul className="oo-panel__lines">
              {groups[i]
                .filter((n) => s.bullets[n])
                .map((n) => (
                  <Reveal as="li" key={n} delay={(groups[i].indexOf(n) % 4) * 0.06}>
                    {s.bullets[n]}
                  </Reveal>
                ))}
            </ul>
            {i === 1 && (
              <>
                <a
                  className="oo-panel__more"
                  href={C.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t({ zh: "我的开源项目", en: "My projects" })}
                  <Icon kind="arrow" size={16} />
                </a>
                <blockquote className="oo-quote">
                  <span className="oo-quote__mark oo-quote__mark--open" aria-hidden="true">
                    “
                  </span>
                  <Reveal as="p">
                    {t({
                      zh: "比起停留在“知道”，我更喜欢真正把一个想法从零开始做出来。",
                      en: "I enjoy turning an idea into something real, starting from scratch.",
                    })}
                    <span className="oo-quote__mark oo-quote__mark--close" aria-hidden="true">
                      ”
                    </span>
                  </Reveal>
                </blockquote>
              </>
            )}
            {i === 3 && latest && (
              <a className="oo-latest" href={latest.link?.href || "#ab-past"}>
                {latest.image && (
                  <span
                    className="oo-img is-loaded fit-cover has-ratio oo-latest__img"
                    style={{ aspectRatio: "4/3" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={latest.image} alt={t(latest.title)} loading="lazy" />
                  </span>
                )}
                <span className="oo-latest__body">
                  <span className="oo-latest__kicker">
                    <span>Latest project</span>
                    <span>{latest.date}</span>
                  </span>
                  <span className="oo-latest__title">{t(latest.title)}</span>
                  <span className="oo-latest__count">
                    {t({ zh: "阅读开发记录", en: "Read the story" })}
                    <Icon kind="arrow" size={16} />
                  </span>
                </span>
              </a>
            )}
          </Reveal>
        ))}
      </div>
      {s.paragraphs
        .filter((p) => !/[：:]$/.test(p))
        .slice(1)
        .map((p) => (
          <Reveal as="p" key={p} className="yu-section-lede">
            {p}
          </Reveal>
        ))}
    </section>
  );
}

function Readme({ s, t, lang }: { s: AboutSection; t: Translate; lang: Lang }) {
  const colon = s.paragraphs.findIndex((p) => /[：:]$/.test(p));
  return (
    <section id="ab-site" className="oo-block" aria-labelledby="oo-readme-title">
      <div className="yu-section-opening">
        <div>
          <SectionHead id="oo-readme-title" no={4} label="README" title={s.title} />
          {s.paragraphs.slice(0, colon < 0 ? undefined : colon).map((p) => (
            <Reveal as="p" key={p} className="yu-section-lede">
              {p}
            </Reveal>
          ))}
        </div>
        <GeometryStudy kind="rays" lang={lang} />
      </div>
      <div className="oo-readme">
        <div className="oo-readme__tab">
          <span className="oo-readme__file">README.md</span>
          <span className="oo-readme__meta">
            {s.bullets.length} / {t({ zh: "后续可能会尝试", en: "Things to explore" })}
          </span>
        </div>
        <ol className="oo-readme__list">
          {s.bullets.map((item, i) => (
            <Reveal as="li" className="oo-readme__item" key={item} delay={(i % 3) * 0.05}>
              <span className="oo-readme__no">§ {pad(i + 1)}</span>
              <h3 className="oo-readme__title">{item}</h3>
              <span
                className="oo-readme__text yu-roadmap-mark"
                aria-label={t({ zh: "计划中的尝试", en: "Planned experiment" })}
              >
                [ ]
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
      {colon >= 0 &&
        s.paragraphs.slice(colon + 1).map((p) => (
          <Reveal as="p" key={p} className="yu-section-lede">
            {p}
          </Reveal>
        ))}
    </section>
  );
}

function Later({ s }: { s: AboutSection }) {
  return (
    <section id="ab-later" className="oo-block" aria-labelledby="oo-later-title">
      <SectionHead id="oo-later-title" no={5} label="Later" title={s.title} />
      <div className="yu-later">
        <Watermark kind="orbit" className="yu-watermark--later" />
        {s.paragraphs.map((paragraph, i) => (
          <Reveal as="p" key={paragraph} delay={i * 0.08}>
            {paragraph}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Fin({ t, lang, onCopy }: { t: Translate; lang: Lang; onCopy: () => void }) {
  return (
    <section id="ab-fin" className="oo-fin oo-block" aria-labelledby="oo-fin-title">
      <SectionHead
        id="oo-fin-title"
        no={6}
        label="Fin"
        title={t({ zh: "写在最后", en: "A final note" })}
      />
      <div className="oo-fin__grid">
        <div className="oo-fin__cta">
          <Reveal as="p" className="oo-fin__big">
            <span>Let’s</span> <em>talk.</em>
          </Reveal>
          <Reveal as="p" className="oo-fin__lede">
            {t({
              zh: "有想法、有问题，或者只是想聊聊天，都欢迎来找我。",
              en: "An idea, a question, or a conversation — you are welcome to get in touch.",
            })}
          </Reveal>
        </div>
        <Reveal>
          <Contacts t={t} onCopy={onCopy} ending />
        </Reveal>
      </div>
      <nav
        className="oo-doors"
        aria-label={t({ zh: "站内其他页面", en: "Elsewhere on this site" })}
      >
        <p className="oo-doors__kicker">Elsewhere on this site</p>
        <ul className="oo-doors__list">
          {C.elsewhere.map((item, i) => (
            <Reveal as="li" key={item.href} delay={i * 0.05}>
              <Link
                className="oo-door"
                href={item.href}
                {...(item.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="oo-door__no">{pad(i + 1)}</span>
                <Icon
                  kind={(["pen", "link", "drop", "code"] as const)[i]}
                  size={28}
                  className="oo-door__icon"
                />
                <span className="oo-door__title">{item[lang]}</span>
                <span className="oo-door__en">{lang === "zh" ? item.en : item.zh}</span>
                <Icon
                  kind={item.href.startsWith("http") ? "arrow" : "right"}
                  size={16}
                  className="oo-door__arrow"
                />
              </Link>
            </Reveal>
          ))}
        </ul>
      </nav>
    </section>
  );
}

function Colophon({ t }: { t: Translate }) {
  const rows = [
    {
      zh: "文字",
      en: "Words",
      text: t({
        zh: "这里的经历、尝试和想法，来自我自己的记录。",
        en: "Experiences, experiments and ideas from my own notes.",
      }),
    },
    { zh: "字体", en: "Type", text: "Newsreader · Noto Serif SC · JetBrains Mono" },
    {
      zh: "主题",
      en: "Theme",
      text: t({
        zh: "纸、墨与琥珀；浅色与深色随站点主题切换。",
        en: "Paper, ink and amber. Light and dark follow the site theme.",
      }),
    },
  ];
  return (
    <section id="ab-colophon" className="oo-colo oo-block" aria-labelledby="oo-colo-title">
      <SectionHead
        id="oo-colo-title"
        no={7}
        label="Colophon"
        title={t({ zh: "关于这一页", en: "About this page" })}
        small
      />
      <div className="oo-colo__grid">
        <ul
          className="oo-colo__specimens"
          aria-label={t({ zh: "本页使用的字体", en: "Type specimens" })}
        >
          {[
            { glyph: "Aa", name: "Newsreader", kind: "latin", role: "Latin & numerals" },
            { glyph: "昱", name: "Noto Serif SC", kind: "sc", role: "CJK" },
            { glyph: "{ }", name: "JetBrains Mono", kind: "mono", role: "Labels & code" },
          ].map((spec) => (
            <Reveal as="li" className="oo-colo__spec" key={spec.name}>
              <span className={`oo-colo__glyph is-${spec.kind}`} aria-hidden="true">
                {spec.glyph}
              </span>
              <span className="oo-colo__fname">{spec.name}</span>
              <span className="oo-colo__frole">{spec.role}</span>
            </Reveal>
          ))}
        </ul>
        <dl className="oo-colo__list">
          {rows.map((row) => (
            <Reveal className="oo-colo__row" key={row.en}>
              <dt>
                <span className="oo-colo__label">{t({ zh: row.zh, en: row.en })}</span>
                <span className="oo-colo__en">{row.en}</span>
              </dt>
              <dd>{row.text}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function AboutExperience({ sections, cards }: Props) {
  const [lang, setLang] = useState<Lang>("zh");
  const [toast, setToast] = useState("");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [positions, setPositions] = useState<number[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const t: Translate = (value) => value[lang];
  const sec = (key: keyof typeof C.sectionTitles.zh) =>
    sections[lang][C.sectionTitles[lang][key]] ?? EMPTY;
  const latest = [...cards].reverse().find((card) => card.postSlug);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("about-lang");
      if (saved === "zh" || saved === "en") setLang(saved);
    } catch {
      /* Storage is optional. */
    }
    return () => clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;
      const index = CHAPTERS.reduce(
        (last, chapter, i) =>
          (document.getElementById(chapter[0])?.getBoundingClientRect().top ?? Infinity) <=
          window.innerHeight * 0.3
            ? i
            : last,
        0,
      );
      setActive(index);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setPositions(
        CHAPTERS.map((chapter) =>
          Math.min(
            1,
            Math.max(
              0,
              ((document.getElementById(chapter[0])?.getBoundingClientRect().top ?? 0) +
                window.scrollY) /
                max,
            ),
          ),
        ),
      );
      schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, [lang]);

  const switchLang = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem("about-lang", next);
    } catch {
      /* Storage is optional. */
    }
  };
  const copyEmail = useCallback(async () => {
    let message = lang === "zh" ? "邮箱已复制" : "Email copied";
    try {
      await navigator.clipboard.writeText(C.email);
    } catch {
      message = C.email;
    }
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, [lang]);

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} className="oo-about" lang={lang === "zh" ? "zh-CN" : "en"}>
        <div className="oo-progress" aria-hidden="true">
          <span ref={progressRef} />
        </div>
        <div className="oo-grain" aria-hidden="true" />
        <nav className="yu-about-nav" aria-label={t({ zh: "主导航", en: "Main navigation" })}>
          <Link className="yu-about-wordmark" href="/">
            {t(C.name)}
            <span className="oo-amber">.</span>
          </Link>
          <div className="yu-about-navlinks">
            <Link href="/">{t({ zh: "首页", en: "Home" })}</Link>
            <a href="#ab-hero" aria-current="page">
              {t(C.title)}
            </a>
            <Link href="/blog">{t({ zh: "博客", en: "Blog" })}</Link>
            <button
              className="yu-language-switch"
              type="button"
              onClick={() => switchLang(lang === "zh" ? "en" : "zh")}
              aria-label={lang === "zh" ? "Switch to English" : "切换到中文"}
            >
              {lang === "zh" ? "EN" : "中"}
            </button>
            <button
              className="yu-theme-switch"
              type="button"
              role="switch"
              aria-checked={mounted && resolvedTheme === "dark"}
              aria-label={t({ zh: "切换明暗主题", en: "Toggle color theme" })}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              <span aria-hidden="true">{mounted && resolvedTheme === "dark" ? "☾" : "☀"}</span>
            </button>
          </div>
        </nav>
        <div className="oo-rail" aria-hidden="true">
          <span className="oo-rail__fill" ref={fillRef} />
          {positions.map((pos, i) => (
            <span
              className={`oo-rail__tick ${i <= active ? "is-on" : ""}`}
              style={{ bottom: `${pos * 100}%` }}
              key={i}
            />
          ))}
        </div>
        <div className={`oo-runhead ${active > 0 ? "is-on" : ""}`} aria-hidden="true">
          <span className="oo-runhead__txt">
            <span className="oo-amber-text">{pad(active + 1)}</span> / {CHAPTERS[active][1]}
          </span>
        </div>
        <main className="oo-wrap">
          <Hero
            t={t}
            lang={lang}
            intro={sec("intro")}
            latest={latest}
            count={cards.length}
            onCopy={copyEmail}
          />
          <Now s={sec("now")} t={t} latest={latest} lang={lang} />
          <PastCarousel
            cards={cards}
            t={t}
            title={sec("past").title}
            paragraphs={sec("past").paragraphs}
          />
          <Readme s={sec("site")} t={t} lang={lang} />
          <Later s={sec("later")} />
          <Fin t={t} lang={lang} onCopy={copyEmail} />
          <Colophon t={t} />
          <footer className="oo-end">
            <span className="oo-end__mark">
              <Icon kind="spark" size={30} />
            </span>
            <dl className="oo-colophon">
              <div>
                <dt>Sections</dt>
                <dd>01 — {pad(CHAPTERS.length)}</dd>
              </div>
              <div>
                <dt>Frames</dt>
                <dd>{pad(cards.length)}</dd>
              </div>
              <div>
                <dt>Issue</dt>
                <dd>No.01 — Profile</dd>
              </div>
            </dl>
            <button
              className="oo-sq-btn oo-totop"
              type="button"
              aria-label={t({ zh: "回到顶部", en: "Back to top" })}
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                })
              }
            >
              <Icon kind="up" />
            </button>
          </footer>
        </main>
        <div className="yu-toast" role="status" aria-live="polite">
          {toast && <span>{toast}</span>}
        </div>
      </div>
    </MotionConfig>
  );
}
