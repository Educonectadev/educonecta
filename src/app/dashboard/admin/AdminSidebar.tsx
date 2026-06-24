"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/dashboard/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/admin/perfil", label: "Perfil", icon: "person" },
  { href: "/dashboard/admin/alumnos", label: "Alumnos", icon: "school" },
  { href: "/dashboard/admin/profesores", label: "Profesores", icon: "badge" },
  { href: "/dashboard/admin/padres", label: "Padres", icon: "group" },
  { href: "/dashboard/admin/cursos", label: "Cursos", icon: "menu_book" },
  { href: "/dashboard/admin/grados", label: "Grados", icon: "layers" },
  { href: "/dashboard/admin/horarios", label: "Horarios", icon: "calendar_month" },
  { href: "/dashboard/admin/aulas", label: "Aulas", icon: "meeting_room" },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="h-[calc(100dvh-3.5rem)] sticky top-14 flex flex-col gap-0.5 p-4">
        <p className="px-4 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-blue-500">
          Admin
        </p>
        {links.map((link) => {
          const segments = link.href.split("/").filter(Boolean)
          const active = pathname === link.href || (segments.length > 2 && pathname.startsWith(link.href + "/"))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-[30px] px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <span className={`material-icons ${active ? "opacity-100" : "opacity-40"}`}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
