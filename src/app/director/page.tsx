import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth"
import { getInstallRoleBySlug } from "@/lib/install-roles"
import RoleInstallPage from "@/components/RoleInstallPage"

export default async function DirectorPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")
  if (session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/unauthorized")

  const config = getInstallRoleBySlug("director")!
  return <RoleInstallPage config={config} />
}
