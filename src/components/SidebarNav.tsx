"use client"

import { memo, useMemo, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { themes, type RoleTheme } from "@/lib/themes"

interface NavLink {
  href: string
  label: string
  icon: string
  extra?: React.ReactNode
}

const NavItem = memo(function NavItem({
  link,
  active,
}: {
  link: NavLink
  active: boolean
}) {
  const router = useRouter()
  const prefetch = useCallback(() => router.prefetch(link.href), [router, link.href])

  return (
    <Link
      href={link.href}
      prefetch={true}
      className={`inline-flex items-center justify-start gap-3 rounded-[30px] px-4 py-2.5 text-sm font-medium transition-colors ${
        active ? "" : "hover:bg-default-100 dark:hover:bg-default-50"
      }`}
      style={active ? { backgroundColor: "var(--brand-color)", color: "var(--brand-text-color)" } : undefined}
      onMouseEnter={prefetch}
    >
      <span className={`material-icons text-lg ${active ? "opacity-100" : "opacity-40"}`} aria-hidden>
        {link.icon}
      </span>
      <span className="flex-1 text-left truncate">{link.label}</span>
      {link.extra}
    </Link>
  )
})

export default function SidebarNav({
  links,
  label,
  theme = "SUPER_ADMIN",
}: {
  links: NavLink[]
  label: string
  theme?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const t: RoleTheme = themes[theme] ?? themes.SUPER_ADMIN

  useEffect(() => {
    links.forEach((link) => router.prefetch(link.href))
  }, [links, router])

  const activeMap = useMemo(() => {
    const m = new Map<string, boolean>()
    for (const link of links) {
      const segments = link.href.split("/").filter(Boolean)
      const active =
        pathname === link.href ||
        (segments.length > 2 && pathname.startsWith(link.href + "/"))
      m.set(link.href, active)
    }
    return m
  }, [links, pathname])

  return (
    <aside className="hidden w-56 shrink-0 md:block" data-tour="sidebar">
      <nav
        aria-label={label}
        className="h-full flex flex-col gap-0.5 p-4"
      >
        <p
          className={`px-4 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-widest ${t.sidebar.labelColor}`}
        >
          {label}
        </p>
        {links.map((link) => (
          <NavItem
            key={link.href}
            link={link}
            active={!!activeMap.get(link.href)}
          />
        ))}
      </nav>
    </aside>
  )
}