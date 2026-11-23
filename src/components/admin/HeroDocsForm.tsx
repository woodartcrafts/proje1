"use client";

import { useActionState } from "react";
import {
  updateHeroDocsAction,
  type HeroDocsState,
} from "@/app/actions/hero-docs";
import type { HeroDocSheet } from "@/lib/hero-docs";

const initial: HeroDocsState = {};

const DOC_LABELS = ["Arka belge", "Orta belge", "Ön belge"] as const;

export function HeroDocsForm({ sheets }: { sheets: HeroDocSheet[] }) {
  const [state, action, pending] = useActionState(
    updateHeroDocsAction,
    initial,
  );

  return (
    <form action={action} className="admin-form">
      <p className="form-hint" style={{ marginTop: 0 }}>
        Ana sayfa sağındaki üç evrak kartı. Avukat / mali müşavir ofisine göre
        başlık ve satırları değiştirin. Ön belgede mühür ve imza etiketleri
        vardır.
      </p>

      {sheets.map((sheet, index) => (
        <fieldset
          key={DOC_LABELS[index]}
          style={{
            margin: "0 0 1.25rem",
            padding: "1rem 1rem 0.25rem",
            border: "1px solid var(--line, #d7e0e7)",
            borderRadius: 10,
          }}
        >
          <legend style={{ padding: "0 0.4rem", fontWeight: 700 }}>
            {DOC_LABELS[index]}
          </legend>
          <label>
            Belge başlığı
            <input
              name={`doc${index}_title`}
              required
              minLength={2}
              maxLength={48}
              defaultValue={sheet.title}
            />
          </label>
          {[0, 1, 2, 3].map((rowIndex) => (
            <label key={rowIndex}>
              {rowIndex === 3 ? "Son satır (vurgulu)" : `Satır ${rowIndex + 1}`}
              <input
                name={`doc${index}_row${rowIndex}`}
                required
                minLength={2}
                maxLength={40}
                defaultValue={sheet.rows[rowIndex]?.label ?? ""}
              />
            </label>
          ))}
          {index === 2 ? (
            <>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name={`doc${index}_stamp`}
                  defaultChecked={sheet.stamp !== false}
                />
                Mühür ve imza satırlarını göster
              </label>
              <div className="form-row">
                <label>
                  Mühür metni
                  <input
                    name={`doc${index}_stampText`}
                    maxLength={20}
                    defaultValue={sheet.stampText ?? "ONAYLANDI"}
                  />
                </label>
                <label>
                  Sol imza
                  <input
                    name={`doc${index}_signLeft`}
                    maxLength={24}
                    defaultValue={sheet.signLeft ?? "Mükellef"}
                  />
                </label>
                <label>
                  Sağ imza
                  <input
                    name={`doc${index}_signRight`}
                    maxLength={24}
                    defaultValue={sheet.signRight ?? "Danışman"}
                  />
                </label>
              </div>
            </>
          ) : null}
        </fieldset>
      ))}

      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Kaydediliyor..." : "Evrakları kaydet"}
      </button>
    </form>
  );
}
