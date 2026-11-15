"use client";

/* eslint-disable @next/next/no-img-element -- Film frames and the full-size viewer render local archive assets directly. */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { I18n, PastCardConfig } from "@/content/about";
import { Icon, Reveal, RollNumber, SectionHead, Watermark, pad } from "./reference-parts";
import { PatentDetails } from "./PatentDetails";

export type PastCard = Omit<PastCardConfig, "image"> & { image: string | null };

function FrameImage({
  src,
  alt,
  onOpen,
  contain = false,
}: {
  src: string | null;
  alt: string;
  onOpen: () => void;
  contain?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <button
      className="oo-reel__open"
      type="button"
      onClick={onOpen}
      disabled={!src || failed}
      aria-label={alt}
    >
      {src && !failed ? (
        <span
          className={`oo-img is-loaded ${contain ? "fit-contain" : "fit-cover"} has-ratio oo-reel__img is-active`}
          style={{ aspectRatio: "4/3" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </span>
      ) : (
        <span className="yu-frame-placeholder">
          <Icon kind="spark" size={42} />
          <span>{failed ? "Image unavailable" : "Coming next"}</span>
        </span>
      )}
      {src && !failed && (
        <span className="oo-reel__zoom" aria-hidden="true">
          <Icon size={16} />
        </span>
      )}
    </button>
  );
}

export function PastCarousel({
  cards,
  t,
  title,
  paragraphs,
}: {
  cards: PastCard[];
  t: (value: I18n) => string;
  title: string;
  paragraphs: string[];
}) {
  const trackRef = useRef<HTMLOListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dragRef = useRef<{ x: number; scroll: number } | null>(null);
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState<PastCard | null>(null);
  const last = Math.max(0, cards.length - 1);

  const go = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(last, next));
    const frames = track.querySelectorAll<HTMLElement>(".oo-reel__frame");
    if (!frames[target]) return;
    track.scrollTo({
      left: frames[target].offsetLeft - frames[0].offsetLeft,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onWheel = (event: WheelEvent) => {
      // Native horizontal trackpad/touch scrolling stays native. Translate Shift+vertical wheel only.
      if (!event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const max = track.scrollWidth - track.clientWidth;
      if (
        (event.deltaY < 0 && track.scrollLeft <= 0) ||
        (event.deltaY > 0 && track.scrollLeft >= max)
      )
        return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (opened && !dialog.open) dialog.showModal();
    else if (!opened && dialog.open) dialog.close();
  }, [opened]);

  useEffect(() => {
    if (!opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  return (
    <section id="ab-past" className="oo-meet oo-block" aria-labelledby="oo-past-title">
      <Watermark kind="axes" className="yu-watermark--past" />
      <div className="oo-meet__head">
        <SectionHead id="oo-past-title" no={3} label="Past" title={title} />
        <div className="oo-meet__controls">
          <span className="oo-meet__count">
            <span className="oo-sr" aria-live="polite">
              {pad(index + 1)} / {pad(cards.length)}
            </span>
            <span className="oo-amber" aria-hidden="true">
              <RollNumber text={pad(cards.length ? index + 1 : 0)} />
            </span>
            <span aria-hidden="true"> / {pad(cards.length)}</span>
          </span>
          <button
            className="oo-sq-btn"
            type="button"
            aria-label={t({ zh: "上一帧", en: "Previous frame" })}
            disabled={index === 0}
            onClick={() => go(index - 1)}
          >
            <Icon kind="left" />
          </button>
          <button
            className="oo-sq-btn"
            type="button"
            aria-label={t({ zh: "下一帧", en: "Next frame" })}
            disabled={index === last}
            onClick={() => go(index + 1)}
          >
            <Icon kind="right" />
          </button>
        </div>
      </div>
      <div className="yu-past-intro">
        {paragraphs.map((paragraph, i) => (
          <Reveal as="p" key={paragraph} delay={(i % 2) * 0.08}>
            {paragraph}
          </Reveal>
        ))}
      </div>
      <div className="oo-reel">
        <ol
          className={`oo-reel__track ${dragging ? "is-dragging" : ""}`}
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={t({
            zh: "过去的尝试，使用左右方向键切换",
            en: "Past experiments. Use left and right arrows to navigate.",
          })}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            go(
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? last
                  : index + (event.key === "ArrowRight" ? 1 : -1),
            );
          }}
          onScroll={() => {
            const track = trackRef.current;
            const first = track?.querySelector<HTMLElement>(".oo-reel__frame");
            if (track && first)
              setIndex(
                Math.max(
                  0,
                  Math.min(
                    last,
                    Math.round(track.scrollLeft / Math.max(first.getBoundingClientRect().width, 1)),
                  ),
                ),
              );
          }}
          onPointerDown={(event) => {
            if (
              event.pointerType !== "mouse" ||
              event.button !== 0 ||
              (event.target as HTMLElement).closest("a")
            )
              return;
            dragRef.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft };
            moved.current = false;
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag) return;
            const delta = event.clientX - drag.x;
            if (Math.abs(delta) > 5) {
              moved.current = true;
              setDragging(true);
              if (!event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.setPointerCapture(event.pointerId);
            }
            if (moved.current) {
              event.preventDefault();
              event.currentTarget.scrollLeft = drag.scroll - delta;
            }
          }}
          onPointerUp={(event) => {
            dragRef.current = null;
            setDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            dragRef.current = null;
            moved.current = false;
            setDragging(false);
          }}
          onLostPointerCapture={() => {
            dragRef.current = null;
            setDragging(false);
          }}
          onClickCapture={(event) => {
            if (moved.current) {
              event.preventDefault();
              event.stopPropagation();
              moved.current = false;
            }
          }}
        >
          {cards.map((card, i) => (
            <li
              id={card.kind === "patents" ? "ab-patents" : undefined}
              className={`oo-reel__frame ${card.kind === "patents" ? "yu-patent-frame" : ""}`}
              key={card.kind || card.postSlug || `${card.date}-${i}`}
              aria-label={`${pad(i + 1)} / ${pad(cards.length)}`}
            >
              <article className="oo-reel__card">
                <div className="oo-reel__film">
                  <span className="oo-reel__perf" aria-hidden="true" />
                  <span className="oo-reel__edge oo-reel__edge--top" aria-hidden="true">
                    <span>{pad(i + 1)}</span>
                    <span>{pad(i + 1)}A</span>
                  </span>
                  <div className="oo-reel__shot">
                    <FrameImage
                      src={card.image}
                      alt={t(card.title)}
                      contain={card.kind === "patents"}
                      onOpen={() => setOpened(card)}
                    />
                  </div>
                  <span className="oo-reel__edge oo-reel__edge--bottom" aria-hidden="true">
                    <span>YU’AN / ARCHIVE</span>
                    <span>FRAME {pad(i + 1)}</span>
                  </span>
                </div>
                <div className="oo-reel__caption">
                  {card.date && <span className="oo-reel__date">{card.date}</span>}
                  <Reveal as="div">
                    <h3 className="oo-reel__title">{t(card.title)}</h3>
                  </Reveal>
                  <Reveal as="p" className="oo-reel__desc" delay={0.06}>
                    {t(card.body)}
                  </Reveal>
                  {card.kind === "patents" && (
                    <button
                      type="button"
                      className="oo-panel__more yu-patent-more"
                      onClick={() => setOpened(card)}
                    >
                      {t({ zh: "查看专利记录", en: "View patent records" })}
                      <Icon size={14} />
                    </button>
                  )}
                  {card.link && (
                    <Link className="oo-panel__more" href={card.link.href} draggable={false}>
                      {t(card.link.label)}
                      <Icon size={14} />
                    </Link>
                  )}
                </div>
              </article>
            </li>
          ))}
          <li className="oo-reel__leader yu-reel-trailer" aria-hidden="true" />
        </ol>
        <div className="oo-reel__progress" aria-hidden="true">
          <span style={{ width: `${cards.length ? ((index + 1) / cards.length) * 100 : 0}%` }} />
        </div>
      </div>
      <p className="yu-reel-hint">
        {t({
          zh: "悬停显影 · 拖拽 / 横向滑动 / ← → 切换 · 点击照片放大",
          en: "Hover to develop · Drag / scroll / ← → to browse · Click to enlarge",
        })}
      </p>
      <dialog
        className={`yu-lightbox ${opened?.kind === "patents" ? "yu-lightbox--patents" : ""}`}
        ref={dialogRef}
        aria-label={opened ? t(opened.title) : "Image preview"}
        onCancel={() => setOpened(null)}
        onClose={() => setOpened(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpened(null);
        }}
      >
        {opened && (
          <>
            <button
              className="oo-sq-btn yu-lightbox-close"
              type="button"
              aria-label={t({ zh: "关闭大图", en: "Close image preview" })}
              onClick={() => setOpened(null)}
            >
              <Icon kind="close" />
            </button>
            {opened.kind === "patents" ? (
              <PatentDetails t={t} image={opened.image || ""} />
            ) : (
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={opened.image || ""} alt={t(opened.title)} />
                <figcaption>
                  {t(opened.title)} / {opened.date}
                </figcaption>
              </figure>
            )}
          </>
        )}
      </dialog>
    </section>
  );
}
