"use client";

import { useActionState, useState } from "react";
import {
  resetLegalPageAction,
  updateLegalPageAction,
  type PageState,
} from "@/app/actions/pages";
import {
  LEGAL_PAGE_DEFS,
  LEGAL_TEXT_MAX,
  type LegalPageKey,
  type LegalPagesContent,
} from "@/lib/legal-pages";

const initial: PageState = {};

export function LegalPagesForm({
  pages,
  customFlags,
}: {
  pages: LegalPagesContent;
  customFlags: Record<LegalPageKey, boolean>;
}) {
  const [active, setActive] = useState<LegalPageKey>("gizlilik");
  const def = LEGAL_PAGE_DEFS.find((item) => item.key === active)!;
  const isCustom = customFlags[active];

  const [state, action, pending] = useActionState(updateLegalPageAction, initial);
  const [resetState, resetAction, resetPending] = useActionState(
    resetLegalPageAction,
    initial,
  );
  const [last, setLast] = useState<"save" | "reset" | null>(null);
  const showSave = last === "save";
  const showReset = last === "reset";

  return (
    <>
      <div className="admin-panel" style={{ maxWidth: 820, marginBottom: "1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {LEGAL_PAGE_DEFS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`btn ${active === item.key ? "btn-primary" : "btn-secondary"}`}
              onClick={() => {
                setActive(item.key);
                setLast(null);
              }}
            >
              {item.title}
              {customFlags[item.key] ? " *" : ""}
            </button>
          ))}
        </div>
        <p style={{ marginBottom: 0, color: "var(--ink-soft)" }}>
          {def.description}{" "}
          <a href={def.path} target="_blank" rel="noopener">
            Sayfayı gör
          </a>
          {isCustom
            ? " — şu an özel metin gösteriliyor."
            : " — şu an hazır şablon gösteriliyor."}
        </p>
      </div>

      <form
        action={action}
        className="admin-form"
        key={`${active}-${pages[active].slice(0, 40)}`}
        onSubmit={() => setLast("save")}
      >
        <input type="hidden" name="pageKey" value={active} />
        <label>
          Metnin tamamı
          <textarea
            name="customText"
            rows={28}
            maxLength={LEGAL_TEXT_MAX}
            defaultValue={pages[active]}
            spellCheck
          />
        </label>
        <p className="form-hint">
          Biçim: boş satır yeni paragraf açar; <strong>## </strong> ile başlayan
          satır başlık olur; <strong>- </strong> ile başlayan ardışık satırlar
          madde işaretli liste olur.
        </p>
        {showSave && state.error ? (
          <p className="form-error">{state.error}</p>
        ) : null}
        {showSave && state.success ? (
          <p className="form-success">{state.success}</p>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Kaydediliyor..." : "Metni Kaydet"}
        </button>
      </form>

      {showReset && resetState.error ? (
        <p className="form-error">{resetState.error}</p>
      ) : null}
      {showReset && resetState.success ? (
        <p className="form-success">{resetState.success}</p>
      ) : null}
      {isCustom ? (
        <form
          action={resetAction}
          className="admin-form"
          style={{ marginTop: "1rem" }}
          onSubmit={() => setLast("reset")}
        >
          <input type="hidden" name="pageKey" value={active} />
          <p className="form-hint" style={{ margin: 0 }}>
            Yazdığınız metni silip hazır şablona dönmek için:
          </p>
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={resetPending}
          >
            {resetPending ? "Dönülüyor..." : "Şablona Dön"}
          </button>
        </form>
      ) : null}
    </>
  );
}
