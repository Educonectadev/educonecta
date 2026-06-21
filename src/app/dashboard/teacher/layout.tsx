import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import SidebarNav from "@/components/SidebarNav"

const sidebarLinks = [
  { href: "/profesor", label: "Dashboard", icon: "dashboard" },
  { href: "/profesor/perfil", label: "Perfil", icon: "person" },
  { href: "/profesor/horarios", label: "Horarios", icon: "calendar_month" },
  { href: "/profesor/asistencia", label: "Asistencia", icon: "fact_check" },
  { href: "/profesor/tareas", label: "Tareas", icon: "assignment" },
  { href: "/profesor/calificaciones", label: "Calificaciones", icon: "grade" },
  { href: "/profesor/disciplina", label: "Disciplina", icon: "gavel" },
  { href: "/profesor/comunicados", label: "Comunicados", icon: "mail" },
]

const bottomNavItems = [
  { href: "/profesor", label: "Inicio", icon: "home" },
  { href: "/profesor/perfil", label: "Perfil", icon: "person" },
  { href: "/profesor/horarios", label: "Horarios", icon: "calendar_month" },
  { href: "/profesor/asistencia", label: "Asistencia", icon: "fact_check" },
  { href: "/profesor/tareas", label: "Tareas", icon: "assignment" },
  { href: "/profesor/calificaciones", label: "Notas", icon: "grade" },
  { href: "/profesor/comunicados", label: "Mensajes", icon: "mail" },
]

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") redirect("/login")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-14 md:pt-16">
        <SidebarNav links={sidebarLinks} label="Profesor" theme="TEACHER" />
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">{children}</main>
      </div>
      <BottomNav items={bottomNavItems} />
    </div>
  )
}
