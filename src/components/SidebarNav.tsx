"use client"

import { memo, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ToggleButton } from "@heroui/react"
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
  router,
}: {
  link: NavLink
  active: boolean
  router: ReturnType<typeof useRouter>
}) {
  return (
    <ToggleButton
      isSelected={active}
      onPress={() => router.push(link.href)}
      variant="ghost"
      className="justify-start gap-3 rounded-[30px] px-4 py-2.5 text-sm font-medium"
      style={active ? { backgroundColor: "var(--brand-color)", color: "var(--brand-text-color)" } : undefined}
    >
      <span className={`material-icons text-lg ${active ? "opacity-100" : "opacity-40"}`} aria-hidden>
        {link.icon}
      </span>
      <span className="flex-1 text-left truncate">{link.label}</span>
      {link.extra}
    </ToggleButton>
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
        className="h-[calc(100dvh-3.5rem)] sticky top-14 flex flex-col gap-0.5 p-4"
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
            router={router}
          />
        ))}
      </nav>
    </aside>
  )
}