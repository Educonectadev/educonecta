import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsPage from "@/components/settings/SettingsPage"

export default async function SuperAdminConfiguracionPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  return (
    <SettingsPage
      title="Configuración"
      subtitle="Personaliza el tema y revisa tu cuenta"
      showBrandColor={false}
      accent="text-black dark:text-white"
      userName={session.user.name}
      userEmail={session.user.email}
      userRoleLabel="Super Admin"
    />
  )
}