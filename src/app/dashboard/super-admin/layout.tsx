import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import SuperAdminSidebar from "@/components/SuperAdminSidebar"
import SolicitudesBadge from "@/components/SolicitudesBadge"
import TourDashboardShell from "@/lib/tour/TourDashboardShell"

const sidebarLinks = [
  { href: "/dashboard/super-admin", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/super-admin/solicitudes", label: "Solicitudes", icon: "mail", extra: <SolicitudesBadge /> },
  { href: "/dashboard/super-admin/instituciones", label: "Instituciones", icon: "building" },
  { href: "/dashboard/super-admin/partner-instituciones", label: "Partners", icon: "users" },
  { href: "/dashboard/super-admin/planes", label: "Planes", icon: "credit_card" },
  { href: "/dashboard/super-admin/versiones", label: "Versiones", icon: "history" },
]

const bottomNavItems = [
  { href: "/dashboard/super-admin", label: "Inicio", icon: "home" },
  { href: "/dashboard/super-admin/solicitudes", icon: "mail", label: "Solicitudes", overflow: false },
  { href: "/dashboard/super-admin/instituciones", label: "Colegios", icon: "building" },
  { href: "/dashboard/super-admin/partner-instituciones", label: "Partners", icon: "users", overflow: true },
  { href: "/dashboard/super-admin/planes", label: "Planes", icon: "credit_card", overflow: true },
  { href: "/dashboard/super-admin/versiones", label: "Versiones", icon: "history", overflow: true },
  { href: "/dashboard/super-admin/configuracion", label: "Ajustes", icon: "settings", overflow: true },
]

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  return (
    <TourDashboardShell role="SUPER_ADMIN">
      <div className="sa-shell">
        <Navbar />
        <SuperAdminSidebar links={sidebarLinks as any} label="Super Admin" />
        <main className="sa-main">
          <div className="sa-main-inner">
            {children}
          </div>
        </main>
        <BottomNav items={bottomNavItems} />
      </div>
    </TourDashboardShell>
  )
}