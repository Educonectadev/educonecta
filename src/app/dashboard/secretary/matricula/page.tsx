import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import MatriculaPage from "../../admin/matricula/page"

export default async function SecretaryMatriculaPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY") redirect("/login")

  return <MatriculaPage />
}
