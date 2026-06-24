"use client"

import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import Link from "next/link"
import { usePathname } from "next/navigation"

const bottomLinks = [
  { href: "/dashboard/parent", label: "Inicio", icon: "home" },
  { href: "/dashboard/parent/horarios", label: "Horarios", icon: "calendar_month" },
  { href: "/dashboard/parent/tareas", label: "Tareas", icon: "assignment" },
  { href: "/dashboard/parent/calificaciones", label: "Notas", icon: "grade" },
  { href: "/dashboard/parent/asistencia", label: "Asistencia", icon: "fact_check" },
  { href: "/dashboard/parent/comunicados", label: "Mensajes", icon: "mail" },
]

const sidebarLinks = [
  { href: "/dashboard/parent", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/parent/perfil", label: "Perfil", icon: "person" },
  { href: "/dashboard/parent/tareas", label: "Tareas", icon: "assignment" },
  { href: "/dashboard/parent/calificaciones", label: "Calificaciones", icon: "grade" },
  { href: "/dashboard/parent/asistencia", label: "Asistencia", icon: "fact_check" },
  { href: "/dashboard/parent/horarios", label: "Horarios", icon: "calendar_month" },
  { href: "/dashboard/parent/disciplina", label: "Disciplina", icon: "gavel" },
  { href: "/dashboard/parent/comunicados", label: "Comunicados", icon: "mail" },
  { href: "/dashboard/parent/notificaciones", label: "Notificaciones", icon: "notifications" },
]

export default function ParentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen pt-14 md:pt-16">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="h-[calc(100dvh-3.5rem)] sticky top-14 flex flex-col gap-0.5 p-4">
            <p className="px-4 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-amber-500">
              Padre
            </p>
            {sidebarLinks.map((link) => {
              const segments = link.href.split("/").filter(Boolean)
              const isActive = pathname === link.href || (segments.length > 2 && pathname.startsWith(link.href + "/"))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-[30px] px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-amber-500 text-white"
                      : "text-gray-400 hover:bg-amber-500 hover:text-white"
                  }`}
                >
                  <span className={`material-icons ${isActive ? "opacity-100" : "opacity-40"}`}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">{children}</main>
      </div>
      <BottomNav items={bottomLinks} />
    </>
  )
}
