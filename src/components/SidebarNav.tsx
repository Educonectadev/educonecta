"use client"

import { useRouter, usePathname } from "next/navigation"
import { ToggleButton } from "@heroui/react"
import { themes, type RoleTheme } from "@/lib/themes"

interface NavLink {
  href: string
  label: string
  icon: string
}

export default function SidebarNav({ links, label, theme = "SUPER_ADMIN" }: { links: NavLink[]; label: string; theme?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const t: RoleTheme = themes[theme] ?? themes.SUPER_ADMIN

  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="h-[calc(100dvh-3.5rem)] sticky top-14 flex flex-col gap-0.5 p-4">
        <p className={`px-4 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-widest ${t.sidebar.labelColor}`}>
          {label}
        </p>
        {links.map((link) => {
          const segments = link.href.split("/").filter(Boolean)
          const active = pathname === link.href || (segments.length > 2 && pathname.startsWith(link.href + "/"))

          return (
            <ToggleButton
              key={link.href}
              isSelected={active}
              onPress={() => router.push(link.href)}
              variant="ghost"
              className="justify-start gap-3 rounded-[30px] px-4 py-2.5 text-sm font-medium"
            >
              <span className="material-icons text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </ToggleButton>
          )
        })}
      </nav>
    </aside>
  )
}
