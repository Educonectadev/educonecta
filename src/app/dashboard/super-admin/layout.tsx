import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import SidebarNav from "@/components/SidebarNav"
import SolicitudesBadge from "@/components/SolicitudesBadge"
import TourDashboardShell from "@/lib/tour/TourDashboardShell"

const sidebarLinks = [
  { href: "/dashboard/super-admin", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/super-admin/solicitudes", label: "Solicitudes", icon: "mail", extra: <SolicitudesBadge /> },
  { href: "/dashboard/super-admin/instituciones", label: "Instituciones", icon: "account_balance" },
  { href: "/dashboard/super-admin/partner-instituciones", label: "Partners", icon: "groups" },
  { href: "/dashboard/super-admin/planes", label: "Planes", icon: "card_membership" },
  { href: "/dashboard/super-admin/versiones", label: "Versiones", icon: "history" },
]

const bottomNavItems = [
  { href: "/dashboard/super-admin", label: "Inicio", icon: "home" },
  { href: "/dashboard/super-admin/solicitudes", label: "Solicitudes", icon: "mail" },
  { href: "/dashboard/super-admin/instituciones", label: "Colegios", icon: "account_balance" },
  { href: "/dashboard/super-admin/partner-instituciones", label: "Partners", icon: "groups", overflow: true },
  { href: "/dashboard/super-admin/planes", label: "Planes", icon: "card_membership", overflow: true },
  { href: "/dashboard/super-admin/versiones", label: "Versiones", icon: "history", overflow: true },
  { href: "/dashboard/super-admin/configuracion", label: "Configuración", icon: "settings", overflow: true },
]

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  return (
    <TourDashboardShell role="SUPER_ADMIN">
      <div className="min-h-screen flex flex-col bg-white dark:bg-black">
        <Navbar />
        <div className="flex flex-1 pt-14 md:pt-16">
          <SidebarNav links={sidebarLinks as any} label="Super Admin" theme="SUPER_ADMIN" />
          <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">{children}</main>
        </div>
        <BottomNav items={bottomNavItems} />
      </div>
    </TourDashboardShell>
  )
}
