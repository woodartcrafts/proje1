import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  VIEW_DEDUP_HOURS,
  incrementPostViewBySlug,
  isBotUserAgent,
  viewCookieName,
} from "@/lib/post-views";

export const dynamic = "force-dynamic";

/** Blog yazısı görüntülenmesini sayar (istemci beacon). */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent");
  if (isBotUserAgent(ua)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  let slug = "";
  try {
    const body: unknown = await request.json();
    if (
      body &&
      typeof body === "object" &&
      "slug" in body &&
      typeof (body as { slug: unknown }).slug === "string"
    ) {
      slug = (body as { slug: string }).slug.trim().toLowerCase();
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!/^[a-z0-9-]{1,120}$/.test(slug)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let postId: string | null = null;
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, published: true },
    });
    if (!post?.published) {
      return NextResponse.json({ ok: true, skipped: "missing" });
    }
    postId = post.id;
  } catch {
    return NextResponse.json({ ok: true, skipped: "error" });
  }

  const cookieKey = viewCookieName(postId);
  const jar = await cookies();
  if (jar.get(cookieKey)?.value === "1") {
    return NextResponse.json({ ok: true, skipped: "dedup" });
  }

  const result = await incrementPostViewBySlug(slug);
  if (!result.ok) {
    return NextResponse.json({ ok: true, skipped: "count" });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieKey, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: VIEW_DEDUP_HOURS * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
