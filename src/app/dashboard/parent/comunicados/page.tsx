import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getInstitutionCommunications } from "@/lib/parent-data"
import CommunicationsList from "./CommunicationsList"

export default async function ComunicadosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

  const institutionId = session.user.institutionId!
  const communications = await getInstitutionCommunications(institutionId)

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Comunicados</h1>
      <p className="mt-1 text-sm text-gray-500">
        Comunicaciones de la institución y docentes
      </p>

      <CommunicationsList communications={communications} />
    </div>
  )
}
