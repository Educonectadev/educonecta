import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) redirect("/login")

  const role = session.user.role

  if (role === "SUPER_ADMIN") redirect("/dashboard/super-admin")
  if (role === "INSTITUTIONAL_ADMIN") redirect("/dashboard/admin")
  if (role === "TEACHER") redirect("/dashboard/teacher")
  if (role === "PARENT") redirect("/dashboard/parent")

  redirect("/unauthorized")
}
