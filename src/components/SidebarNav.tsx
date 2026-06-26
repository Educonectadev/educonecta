"use client"

import { useRouter, usePathname } from "next/navigation"
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
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="flex items-center gap-3 rounded-[30px] px-4 py-2.5 text-sm font-medium transition-all duration-200 text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white/90 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              style={active ? { backgroundColor: "var(--brand-color)", color: "#fff" } : undefined}
            >
              <span className={`material-icons text-lg ${active ? "opacity-100" : "opacity-40"}`}>{link.icon}</span>
              <span>{link.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
