import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth"
import { getInstallRoleBySlug } from "@/lib/install-roles"
import RoleInstallPage from "@/components/RoleInstallPage"

export const dynamic = "force-dynamic"

export default async function SuperAdminInstallPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")
  if (session.user.role !== "SUPER_ADMIN") redirect("/unauthorized")

  const config = getInstallRoleBySlug("super-admin")!
  return <RoleInstallPage config={config} />
}
