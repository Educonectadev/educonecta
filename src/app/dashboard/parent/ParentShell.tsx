"use client"

import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import { useRouter, usePathname } from "next/navigation"
import { ToggleButton } from "@heroui/react"
import TourDashboardShell from "@/lib/tour/TourDashboardShell"

const bottomLinks = [
  { href: "/dashboard/parent", label: "Inicio", icon: "home" },
  { href: "/dashboard/parent/tareas", label: "Tareas", icon: "assignment" },
  { href: "/dashboard/parent/calificaciones", label: "Notas", icon: "grade" },
  { href: "/dashboard/parent/mensajes", label: "Chat", icon: "chat" },
  { href: "/dashboard/parent/horarios", label: "Horarios", icon: "calendar_month", overflow: true },
  { href: "/dashboard/parent/asistencia", label: "Asistencia", icon: "fact_check", overflow: true },
  { href: "/dashboard/parent/perfil", label: "Perfil", icon: "person", overflow: true },
  { href: "/dashboard/parent/disciplina", label: "Disciplina", icon: "gavel", overflow: true },
  { href: "/dashboard/parent/comunicados", label: "Comunicados", icon: "mail", overflow: true },
  { href: "/dashboard/parent/notificaciones", label: "Notificaciones", icon: "notifications", overflow: true },
  { href: "/dashboard/parent/configuracion", label: "Configuración", icon: "settings", overflow: true },
]

const sidebarLinks = [
  { href: "/dashboard/parent", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/parent/perfil", label: "Perfil", icon: "person" },
  { href: "/dashboard/parent/tareas", label: "Tareas", icon: "assignment" },
  { href: "/dashboard/parent/calificaciones", label: "Calificaciones", icon: "grade" },
  { href: "/dashboard/parent/asistencia", label: "Asistencia", icon: "fact_check" },
  { href: "/dashboard/parent/horarios", label: "Horarios", icon: "calendar_month" },
  { href: "/dashboard/parent/disciplina", label: "Disciplina", icon: "gavel" },
  { href: "/dashboard/parent/mensajes", label: "Chat con docentes", icon: "chat" },
  { href: "/dashboard/parent/comunicados", label: "Comunicados", icon: "mail" },
  { href: "/dashboard/parent/notificaciones", label: "Notificaciones", icon: "notifications" },
]

export default function ParentShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <TourDashboardShell role="PARENT">
      <Navbar />
      <div className="flex min-h-screen pt-14 md:pt-16 bg-white dark:bg-black">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="h-[calc(100dvh-3.5rem)] sticky top-14 flex flex-col gap-0.5 p-4">
            <p className="px-4 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-amber-500">
              Padre
            </p>
            {sidebarLinks.map((link) => {
              const segments = link.href.split("/").filter(Boolean)
              const active = pathname === link.href || (segments.length > 2 && pathname.startsWith(link.href + "/"))
              return (
                <ToggleButton
                  key={link.href}
                  isSelected={active}
                  onPress={() => router.push(link.href)}
                  variant="ghost"
                  className="justify-start gap-3 rounded-[30px] px-4 py-2.5 text-sm font-medium"
                  style={active ? { backgroundColor: "var(--brand-color)", color: "var(--brand-text-color)" } : undefined}
                >
                  <span className={`material-icons text-lg ${active ? "opacity-100" : "opacity-40"}`} aria-hidden>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </ToggleButton>
              )
            })}
          </nav>
        </aside>
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">{children}</main>
      </div>
      <BottomNav items={bottomLinks} />
    </TourDashboardShell>
  )
}
