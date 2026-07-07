import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findMany } from "@/lib/prisma"
import AulasList from "../../admin/aulas/AulasList"

export default async function SecretaryAulasPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY") redirect("/login")

  const institutionId = session.user.institutionId!

  const aulas = await findMany("Classroom", {
    where: { institutionId },
    orderBy: "name",
    orderDir: "ASC",
  })

  return <AulasList aulas={aulas as any} />
}
