import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsPage from "@/components/settings/SettingsPage"

export default async function AdminConfiguracionPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  return (
    <SettingsPage
      title="Configuración"
      subtitle="Personaliza el tema, color institucional y revisa tu cuenta"
      accent="text-blue-500"
      userName={session.user.name}
      userEmail={session.user.email}
      userRoleLabel="Administrador Institucional"
    />
  )
}