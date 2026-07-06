import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth"
import { getInstallRoleBySlug } from "@/lib/install-roles"
import RoleInstallPage from "@/components/RoleInstallPage"

export const dynamic = "force-dynamic"

export default async function AlumnosPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")
  if (session.user.role !== "STUDENT") redirect("/unauthorized")

  const config = getInstallRoleBySlug("alumnos")!
  return <RoleInstallPage config={config} />
}
