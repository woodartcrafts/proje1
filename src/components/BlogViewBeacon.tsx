"use client";

import { useEffect } from "react";

/** Yayındaki yazı sayfasında bir kez görüntülenme bildirir (bot/SSR sayılmaz). */
export function BlogViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    void fetch("/api/blog/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {
      // sayaç başarısız olsa sayfa bozulmasın
    });
    return () => controller.abort();
  }, [slug]);

  return null;
}
