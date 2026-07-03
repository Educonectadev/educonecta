"use client"

import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import DashboardContent from "@/components/DashboardContent"
import DownloadAppButton from "@/components/DownloadAppButton"
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
  { href: "/dashboard/parent/configuracion", label: "Configuraci&oacute;n", icon: "settings", overflow: true },
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
      <div className="h-dvh overflow-hidden" style={{ background: "var(--surface)" }}>
        <Navbar />
        <div className="flex h-dvh pt-14 md:pt-16">
          <aside className="hidden w-56 shrink-0 md:block">
            <nav className="h-full flex flex-col gap-0.5 p-4">
              <p className="px-4 pb-3 pt-1 sa-eyebrow" style={{ color: "#d97706" }}>
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
                    className="justify-start gap-3 sa-btn px-4 py-2.5 text-sm font-medium"
                    style={active ? { backgroundColor: "var(--accent)", color: "white" } : undefined}
                  >
                    <span className={`material-icons text-lg ${active ? "opacity-100" : "opacity-40"}`} aria-hidden>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </ToggleButton>
                )
              })}
              <div className="mt-auto pt-4 border-t border-default-200 dark:border-default-50">
                <DownloadAppButton icon="download" />
              </div>
            </nav>
          </aside>
          <DashboardContent>
            <main className="p-4 pb-20 md:p-8 md:pb-8">{children}</main>
          </DashboardContent>
        </div>
        <BottomNav items={bottomLinks} />
      </div>
    </TourDashboardShell>
  )
}
