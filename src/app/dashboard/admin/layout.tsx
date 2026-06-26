import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import Provider from "@/components/Provider"
import AdminSidebar from "./AdminSidebar"
import AdminBottomNav from "./AdminBottomNav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    redirect("/login")
  }

  return (
    <Provider>
      <Navbar />
      <div className="flex min-h-screen pt-14 md:pt-16 overflow-x-hidden bg-white dark:bg-black">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-4 pb-20 md:p-8 md:pb-8">{children}</main>
      </div>
      <AdminBottomNav />
    </Provider>
  )
}
