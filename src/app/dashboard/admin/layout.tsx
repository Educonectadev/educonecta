import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import AdminSidebar from "./AdminSidebar"
import AdminBottomNav from "./AdminBottomNav"
import DashboardContent from "@/components/DashboardContent"
import TourDashboardShell from "@/lib/tour/TourDashboardShell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    redirect("/login")
  }

  return (
    <TourDashboardShell role="INSTITUTIONAL_ADMIN">
      <div className="h-dvh overflow-hidden bg-white dark:bg-black">
        <Navbar />
        <div className="flex h-dvh pt-14 md:pt-16">
          <AdminSidebar />
          <DashboardContent>
            <main className="p-4 pb-20 md:p-8 md:pb-8">{children}</main>
          </DashboardContent>
        </div>
        <AdminBottomNav />
      </div>
    </TourDashboardShell>
  )
}
