"use client";

import { useEffect, useState } from "react";
import type { ExternalNewsItem } from "@/lib/external-news";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M14.5 6L9 12l5.5 6" : "M9.5 6L15 12l-5.5 6"}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mg-cal">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.5 9.5h17M8 3.5v3M16 3.5v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function themeClass(theme: string) {
  const value = theme.toLowerCase().trim();
  if (["navy", "blue", "indigo"].includes(value)) return "theme-navy";
  if (["emerald", "green", "teal"].includes(value)) return "theme-emerald";
  if (["amber", "gold", "yellow"].includes(value)) return "theme-amber";
  return "theme-crimson";
}

function shorten(text: string, max = 140) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

type Props = {
  items: ExternalNewsItem[];
  /** Ayarlar’daki kaynak etiketi; boşsa varsayılan. */
  label?: string;
};

export function MaliGelismelerSlider({
  items,
  label = "Güncel mali gelişmeler",
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  if (items.length === 0) return null;

  const item = items[index] ?? items[0];
  const go = (next: number) => {
    setIndex((next + items.length) % items.length);
  };

  const cardInner = (
    <div className={`mg-card ${themeClass(item.theme)}`}>
      <div className="mg-card-top">
        <span className="mg-badge">{item.badge}</span>
      </div>
      <strong className="mg-title" title={item.title}>
        {shorten(item.title, 120)}
      </strong>
      {item.summary ? (
        <p className="mg-summary" title={item.summary}>
          {shorten(item.summary, 220)}
        </p>
      ) : null}
      <div className="mg-meta">
        <CalendarIcon />
        <span>
          {item.dateLabel}
          {item.dateLabel && item.source ? " — " : ""}
          {item.source}
        </span>
      </div>
    </div>
  );

  return (
    <section
      className="mg-section"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mg-head">
        <span className="mg-live-dot" aria-hidden="true" />
        <h2 className="mg-label">{label}</h2>
        <span className="mg-live">CANLI</span>
      </div>

      <div className="mg-stage">
        {items.length > 1 ? (
          <button
            type="button"
            className="mg-nav mg-nav-prev"
            aria-label="Önceki haber"
            onClick={() => go(index - 1)}
          >
            <ChevronIcon direction="left" />
          </button>
        ) : null}

        <div className="mg-viewport">
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mg-card-link"
            >
              {cardInner}
            </a>
          ) : (
            <div className="mg-card-link">{cardInner}</div>
          )}
        </div>

        {items.length > 1 ? (
          <button
            type="button"
            className="mg-nav mg-nav-next"
            aria-label="Sonraki haber"
            onClick={() => go(index + 1)}
          >
            <ChevronIcon direction="right" />
          </button>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="mg-dots" role="group" aria-label="Haber seçimi">
          {items.map((entry, i) => (
            <button
              key={entry.id}
              type="button"
              className={i === index ? "is-active" : ""}
              aria-label={`Haber ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
