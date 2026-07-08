import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import AlumnosList from "../../admin/alumnos/AlumnosList"

export default async function SecretaryAlumnosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY") redirect("/login")

  const institutionId = session.user.institutionId!

  const [students, grades, sections] = await Promise.all([
    query(
      `SELECT s.id,
              s.firstName AS "firstName",
              s.lastName AS "lastName",
              s.documentId AS "documentId",
              s.email,
              s.phone,
              s.shift,
              jsonb_build_object('id', g.id, 'name', g.name, 'shift', g.shift) AS grade,
              jsonb_build_object('id', sec.id, 'name', sec.name) AS section
       FROM Student s
       LEFT JOIN Grade g ON s.gradeId = g.id
       LEFT JOIN Section sec ON s.sectionId = sec.id
       WHERE s.institutionId = ?
       ORDER BY s.createdAt DESC`,
      [institutionId]
    ),
    query('SELECT id, name, shift FROM Grade WHERE institutionId = ? ORDER BY name', [institutionId]),
    query('SELECT id, name, gradeId FROM Section WHERE gradeId IN (SELECT id FROM Grade WHERE institutionId = ?) ORDER BY name', [institutionId]),
  ])

  return <AlumnosList students={students as any} grades={grades as any[]} sections={sections as any[]} />
}
