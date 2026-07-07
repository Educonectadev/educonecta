import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import SecretarySidebar from "./SecretarySidebar"
import SecretaryBottomNav from "./SecretaryBottomNav"
import DashboardContent from "@/components/DashboardContent"
import TourDashboardShell from "@/lib/tour/TourDashboardShell"

export default async function SecretaryLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session || session.user.role !== "SECRETARY") {
    redirect("/login")
  }

  return (
    <TourDashboardShell role="SECRETARY">
      <div className="h-dvh overflow-hidden bg-white dark:bg-black">
        <Navbar />
        <div className="flex h-full pt-14 md:pt-16">
          <SecretarySidebar />
          <DashboardContent>
            <main className="px-4 pb-24 md:px-8 md:pb-8">{children}</main>
          </DashboardContent>
        </div>
        <SecretaryBottomNav />
      </div>
    </TourDashboardShell>
  )
}
