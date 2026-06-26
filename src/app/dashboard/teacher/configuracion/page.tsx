import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsPage from "@/components/settings/SettingsPage"

export default async function TeacherConfiguracionPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  return (
    <SettingsPage
      title="Configuración"
      subtitle="Personaliza el tema, color y revisa tu cuenta"
      accent="text-emerald-500"
      userName={session.user.name}
      userEmail={session.user.email}
      userRoleLabel="Profesor"
    />
  )
}