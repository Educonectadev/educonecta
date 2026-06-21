import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import SidebarNav from "@/components/SidebarNav"

const sidebarLinks = [
  { href: "/super-admin", label: "Dashboard", icon: "dashboard" },
  { href: "/super-admin/instituciones", label: "Instituciones", icon: "account_balance" },
]

const bottomNavItems = [
  { href: "/super-admin", label: "Inicio", icon: "home" },
  { href: "/super-admin/instituciones", label: "Instituciones", icon: "account_balance" },
]

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-14 md:pt-16">
        <SidebarNav links={sidebarLinks} label="Super Admin" theme="SUPER_ADMIN" />
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">{children}</main>
      </div>
      <BottomNav items={bottomNavItems} />
    </div>
  )
}
