"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; label: string };
type NavGroup = { title?: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  { items: [{ href: "/admin", label: "Özet" }] },
  {
    title: "İçerik",
    items: [
      { href: "/admin/blog", label: "Blog Yazıları" },
      { href: "/admin/blog/yeni", label: "Yeni Blog Yazısı" },
      { href: "/admin/hizmetler", label: "Hizmetler" },
      { href: "/admin/hakkimizda", label: "Hakkımda" },
    ],
  },
  {
    title: "Site bilgileri",
    items: [
      { href: "/admin/iletisim", label: "İletişim" },
      { href: "/admin/sosyal-medya", label: "Sosyal Medya" },
      { href: "/admin/kvkk", label: "KVKK Metni" },
      { href: "/admin/yasal", label: "Yasal Metinler" },
      { href: "/admin/ayarlar", label: "Ayarlar" },
    ],
  },
  {
    title: "Müşteri iletişimi",
    items: [
      { href: "/admin/mesajlar", label: "Mesajlar" },
      { href: "/admin/mukellefler", label: "Mükellefler" },
    ],
  },
];

const ACCOUNT_ITEM: NavItem = { href: "/admin/hesap", label: "Hesabım" };

const ALL_HREFS = [...GROUPS.flatMap((group) => group.items), ACCOUNT_ITEM].map(
  (item) => item.href,
);

/** Açık sayfaya en uzun eşleşen menü adresi (örn. /admin/blog/yeni, "Blog Yazıları"ndan önce gelir). */
function activeHref(pathname: string): string {
  let best = "";
  for (const href of ALL_HREFS) {
    const match = pathname === href || pathname.startsWith(`${href}/`);
    if (match && href.length > best.length) best = href;
  }
  return best;
}

export function AdminNav({
  userName,
  logoutAction,
}: {
  userName: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = activeHref(pathname);

  const renderLink = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={item.href === current ? "page" : undefined}
    >
      {item.label}
    </Link>
  );

  return (
    <>
      <div className="admin-sidebar-bar">
        <h1>Yönetim Paneli</h1>
        <button
          type="button"
          className="admin-menu-toggle"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Kapat" : "Menü"}
        </button>
      </div>
      <nav
        id="admin-menu"
        className={`admin-nav${open ? " is-open" : ""}`}
        aria-label="Yönetim menüsü"
        onClick={(event) => {
          // Telefonda bir bağlantıya basınca menü kapansın.
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {GROUPS.map((group) => (
          <div key={group.title ?? "genel"} className="admin-nav-group">
            {group.title ? (
              <p className="admin-nav-title">{group.title}</p>
            ) : null}
            {group.items.map(renderLink)}
          </div>
        ))}
        <div className="admin-nav-group">
          <p className="admin-nav-title">Hesap</p>
          {renderLink(ACCOUNT_ITEM)}
          <Link href="/" target="_blank">
            Siteyi Gör
          </Link>
          <form action={logoutAction}>
            <button type="submit">Çıkış Yap</button>
          </form>
          <p className="admin-nav-user">{userName}</p>
        </div>
      </nav>
    </>
  );
}
