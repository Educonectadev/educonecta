import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import SidebarNav from "@/components/SidebarNav"
import DashboardContent from "@/components/DashboardContent"
import TourDashboardShell from "@/lib/tour/TourDashboardShell"

const sidebarLinks = [
  { href: "/dashboard/student", label: "Inicio", icon: "dashboard" },
  { href: "/dashboard/student/cursos", label: "Mis cursos", icon: "menu_book" },
  { href: "/dashboard/student/tareas", label: "Mis tareas", icon: "assignment" },
  { href: "/dashboard/student/calificaciones", label: "Calificaciones", icon: "grade" },
  { href: "/dashboard/student/asistencia", label: "Asistencia", icon: "fact_check" },
  { href: "/dashboard/student/comunicados", label: "Comunicados", icon: "mail" },
  { href: "/dashboard/student/perfil", label: "Mi perfil", icon: "person" },
]

const bottomNavItems = [
  { href: "/dashboard/student", label: "Inicio", icon: "home" },
  { href: "/dashboard/student/tareas", label: "Tareas", icon: "assignment" },
  { href: "/dashboard/student/calificaciones", label: "Notas", icon: "grade" },
  { href: "/dashboard/student/comunicados", label: "Avisos", icon: "mail" },
  { href: "/dashboard/student/cursos", label: "Cursos", icon: "book", overflow: true },
  { href: "/dashboard/student/perfil", label: "Perfil", icon: "person", overflow: true },
  { href: "/dashboard/student/asistencia", label: "Asistencia", icon: "fact_check", overflow: true },
]

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session || session.user.role !== "STUDENT") redirect("/login")

  return (
    <TourDashboardShell role="STUDENT">
      <div className="h-dvh overflow-hidden bg-white dark:bg-black">
        <Navbar />
        <div className="flex h-dvh pt-14 md:pt-16">
          <SidebarNav links={sidebarLinks as any} label="Estudiante" theme="STUDENT" />
          <DashboardContent>
            <main className="p-4 pb-20 md:p-8 md:pb-8">{children}</main>
          </DashboardContent>
        </div>
        <BottomNav items={bottomNavItems} />
      </div>
    </TourDashboardShell>
  )
}
