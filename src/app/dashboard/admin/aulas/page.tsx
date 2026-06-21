import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/prisma"
import AulasList from "./AulasList"

export default async function AulasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const aulas = await query<any[]>(
    "SELECT * FROM Classroom WHERE institutionId = ? ORDER BY name ASC",
    [institutionId]
  )

  return <AulasList aulas={aulas} />
}
