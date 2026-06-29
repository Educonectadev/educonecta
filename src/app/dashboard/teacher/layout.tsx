import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import SidebarNav from "@/components/SidebarNav"
import DashboardContent from "@/components/DashboardContent"
import TourDashboardShell from "@/lib/tour/TourDashboardShell"

const sidebarLinks = [
  { href: "/dashboard/teacher", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/teacher/perfil", label: "Perfil", icon: "person" },
  { href: "/dashboard/teacher/horarios", label: "Horarios", icon: "calendar_month" },
  { href: "/dashboard/teacher/asistencia", label: "Asistencia", icon: "fact_check" },
  { href: "/dashboard/teacher/asistencia/qr", label: "QR pendientes", icon: "qr_code_scanner" },
  { href: "/dashboard/teacher/tareas", label: "Tareas", icon: "assignment" },
  { href: "/dashboard/teacher/calificaciones", label: "Calificaciones", icon: "grade" },
  { href: "/dashboard/teacher/disciplina", label: "Disciplina", icon: "gavel" },
  { href: "/dashboard/teacher/mensajes", label: "Mensajes", icon: "chat" },
  { href: "/dashboard/teacher/comunicados", label: "Comunicados", icon: "mail" },
]

const bottomNavItems = [
  { href: "/dashboard/teacher", label: "Inicio", icon: "home" },
  { href: "/dashboard/teacher/tareas", label: "Tareas", icon: "assignment" },
  { href: "/dashboard/teacher/calificaciones", label: "Notas", icon: "grade" },
  { href: "/dashboard/teacher/comunicados", label: "Mensajes", icon: "mail" },
  { href: "/dashboard/teacher/perfil", label: "Perfil", icon: "person", overflow: true },
  { href: "/dashboard/teacher/horarios", label: "Horarios", icon: "calendar_month", overflow: true },
  { href: "/dashboard/teacher/asistencia", label: "Asistencia", icon: "fact_check", overflow: true },
  { href: "/dashboard/teacher/disciplina", label: "Disciplina", icon: "gavel", overflow: true },
  { href: "/dashboard/teacher/courses", label: "Cursos", icon: "book", overflow: true },
  { href: "/dashboard/teacher/configuracion", label: "Configuración", icon: "settings", overflow: true },
]

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session || session.user.role !== "TEACHER") redirect("/login")

  return (
    <TourDashboardShell role="TEACHER">
      <div className="h-dvh overflow-hidden bg-white dark:bg-black">
        <Navbar />
        <div className="flex h-dvh pt-14 md:pt-16">
          <SidebarNav links={sidebarLinks} label="Profesor" theme="TEACHER" />
          <DashboardContent>
            <main className="p-4 pb-20 md:p-8 md:pb-8">{children}</main>
          </DashboardContent>
        </div>
        <BottomNav items={bottomNavItems} />
      </div>
    </TourDashboardShell>
  )
}
