"use client"

import { memo, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { themes, type RoleTheme } from "@/lib/themes"

interface NavLink {
  href: string
  label: string
  icon: string
  extra?: React.ReactNode
}

function NavItem({
  link,
  active,
  isFirst,
  labelColor,
}: {
  link: NavLink
  active: boolean
  isFirst: boolean
  labelColor: string
}) {
  return (
    <Link
      href={link.href}
      prefetch
      className={
        "flex items-center gap-3 rounded-[30px] px-4 py-2.5 text-sm font-medium transition-colors duration-150 " +
        (active
          ? "bg-black text-white dark:bg-white dark:text-black"
          : "text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/60")
      }
    >
      <span
        className={
          "material-icons text-lg shrink-0 " +
          (active ? "opacity-100" : "opacity-40")
        }
        aria-hidden
      >
        {link.icon}
      </span>
      <span className="flex-1 text-left truncate">{link.label}</span>
      {link.extra}
    </Link>
  )
}

const NavItemMemo = memo(NavItem, (prev, next) => {
  // Solo re-renderiza si cambia el estado activo de ESTE item.
  return prev.active === next.active && prev.link.href === next.link.href
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
  const pathname = usePathname()
  const t: RoleTheme = themes[theme] ?? themes.SUPER_ADMIN

  // Calculamos qué items están activos una sola vez por pathname.
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
    <aside className="hidden w-56 shrink-0 md:block">
      <nav
        aria-label={label}
        className="h-[calc(100dvh-3.5rem)] sticky top-14 flex flex-col gap-0.5 p-4"
      >
        <p
          className={`px-4 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-widest ${t.sidebar.labelColor}`}
        >
          {label}
        </p>
        {links.map((link) => (
          <NavItemMemo
            key={link.href}
            link={link}
            active={!!activeMap.get(link.href)}
            isFirst={false}
            labelColor={t.sidebar.labelColor}
          />
        ))}
      </nav>
    </aside>
  )
}