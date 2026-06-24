import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findMany } from "@/lib/prisma"
import AulasList from "./AulasList"

export default async function AulasPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const aulas = await findMany("Classroom", {
    where: { institutionId },
    orderBy: "name",
    orderDir: "ASC",
  })

  return <AulasList aulas={aulas as any} />
}
