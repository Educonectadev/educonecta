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
    <div data-tour="announcements" className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Comunicados</p>
        <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Comunicados</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Comunicaciones de la instituci&oacute;n y docentes
        </p>
      </header>

      <CommunicationsList communications={communications} />
    </div>
  )
}
