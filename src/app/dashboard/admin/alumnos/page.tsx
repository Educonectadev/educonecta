import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query, findMany } from "@/lib/prisma"
import AlumnosList from "./AlumnosList"

export default async function AlumnosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const [studentsData, grades, sections] = await Promise.all([
    query<any[]>(
      "SELECT s.*, g.id as g_id, g.name as g_name, sec.id as sec_id, sec.name as sec_name FROM Student s LEFT JOIN Grade g ON g.id = s.gradeId LEFT JOIN Section sec ON sec.id = s.sectionId WHERE s.institutionId = ? ORDER BY s.createdAt DESC",
      [institutionId]
    ),
    findMany("Grade", { where: { institutionId } }) as Promise<{ id: number; name: string }[]>,
    query<any[]>(
      "SELECT sec.* FROM Section sec JOIN Grade g ON g.id = sec.gradeId WHERE g.institutionId = ?",
      [institutionId]
    ),
  ])

  const students = studentsData.map((s) => ({
    ...s,
    grade: s.g_id ? { id: s.g_id, name: s.g_name } : null,
    section: s.sec_id ? { id: s.sec_id, name: s.sec_name } : null,
  }))

  return <AlumnosList students={students} grades={grades} sections={sections} />
}
