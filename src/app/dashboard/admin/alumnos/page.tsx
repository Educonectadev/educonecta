import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import AlumnosList from "./AlumnosList"

export default async function AlumnosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!

  const [students, grades, sections] = await Promise.all([
    query(
      `SELECT s.id,
              s.firstName AS "firstName",
              s.lastName AS "lastName",
              s.documentId AS "documentId",
              s.email,
              s.phone,
              jsonb_build_object('id', g.id, 'name', g.name) AS grade,
              jsonb_build_object('id', sec.id, 'name', sec.name) AS section
       FROM Student s
       LEFT JOIN Grade g ON s.gradeId = g.id
       LEFT JOIN Section sec ON s.sectionId = sec.id
       WHERE s.institutionId = ?
       ORDER BY s.createdAt DESC`,
      [institutionId]
    ),
    query('SELECT id, name FROM Grade WHERE institutionid = ? ORDER BY name', [institutionId]),
    query('SELECT id, name, gradeid FROM Section WHERE gradeid IN (SELECT id FROM Grade WHERE institutionid = ?) ORDER BY name', [institutionId]),
  ])

  return <AlumnosList students={students as any} grades={grades as any[]} sections={sections as any[]} />
}
