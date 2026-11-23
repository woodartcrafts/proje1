"use client";

import { useRef } from "react";
import type { HeroDocSheet } from "@/lib/hero-docs";

const LAYER_CLASS = ["doc doc-c", "doc doc-b", "doc doc-a"] as const;

/** Hero'daki dekoratif 3D evrak yığını. Fareyle hafifçe eğilir; dokunmatikte sabit. */
export function HeroDocs({ sheets }: { sheets: HeroDocSheet[] }) {
  const stage = useRef<HTMLDivElement>(null);

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = stage.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--tilt-y", `${(x * 14).toFixed(2)}deg`);
    el.style.setProperty("--tilt-x", `${(-y * 10).toFixed(2)}deg`);
  }

  function onLeave() {
    const el = stage.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div
      ref={stage}
      className="docs"
      aria-hidden="true"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <svg
        width="0"
        height="0"
        focusable="false"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id="stamp-ink" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              seed="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.6"
            />
          </filter>
        </defs>
      </svg>
      <div className="docs-floor" />
      <div className="docs-stack">
        {sheets.map((sheet, index) => (
          <div
            key={`${sheet.title}-${index}`}
            className={LAYER_CLASS[index] ?? "doc doc-a"}
          >
            <span className="doc-title">{sheet.title}</span>
            <div className="doc-rows">
              {sheet.rows.map((row) => (
                <div
                  key={row.label}
                  className={`doc-row${row.total ? " is-total" : ""}`}
                >
                  <span>{row.label}</span>
                  <i style={{ width: `${row.width}%` }} />
                </div>
              ))}
            </div>
            {sheet.stamp ? (
              <>
                <div className="doc-sign">
                  <span>{sheet.signLeft || "Mükellef"}</span>
                  <span>{sheet.signRight || "Danışman"}</span>
                </div>
                <div className="doc-stamp">
                  {sheet.stampText || "ONAYLANDI"}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
