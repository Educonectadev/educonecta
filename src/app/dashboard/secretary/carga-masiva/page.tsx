import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import BulkImportPage from "@/components/admin/BulkImportPage"

export default async function SecretaryCargaMasivaPage() {
  const session = await getServerSession()
  if (!session || (session.user.role !== "SECRETARY" && session.user.role !== "INSTITUTIONAL_ADMIN") || !session.user.institutionId) redirect("/login")

  return <BulkImportPage />
}
