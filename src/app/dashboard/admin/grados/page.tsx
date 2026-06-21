import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/prisma"
import GradosList from "./GradosList"

export default async function GradosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const raw = await query<any[]>(
    "SELECT g.*, s.id as s_id, s.name as s_name, s.gradeId as s_gradeId, s.capacity as s_capacity FROM Grade g LEFT JOIN Section s ON s.gradeId = g.id WHERE g.institutionId = ? ORDER BY g.name ASC, s.name ASC",
    [institutionId]
  )

  const gradeMap = new Map<number, any>()
  for (const row of raw) {
    if (!gradeMap.has(row.id)) {
      gradeMap.set(row.id, { id: row.id, name: row.name, level: row.level, sections: [] })
    }
    const grade = gradeMap.get(row.id)!
    if (row.s_id && !grade.sections.some((s: any) => s.id === row.s_id)) {
      grade.sections.push({ id: row.s_id, name: row.s_name, gradeId: row.s_gradeId, capacity: row.s_capacity })
    }
  }
  const grades = Array.from(gradeMap.values())

  return <GradosList grades={grades} />
}
