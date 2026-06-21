import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) redirect("/login")

  const role = session.user.role

  if (role === "SUPER_ADMIN") redirect("/super-admin")
  if (role === "INSTITUTIONAL_ADMIN") redirect("/admin")
  if (role === "TEACHER") redirect("/profesor")
  if (role === "PARENT") redirect("/padre")

  redirect("/unauthorized")
}
