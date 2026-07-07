import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminProfilePage from "../../admin/perfil/page"

export default async function SecretaryPerfilPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY") redirect("/login")

  return <AdminProfilePage />
}
