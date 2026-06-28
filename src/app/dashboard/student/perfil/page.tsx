import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import StudentPerfilClient from "./StudentPerfilClient"

export default async function StudentPerfilPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) redirect("/login")

  const rows = await query<any[]>(
    `SELECT s.id, s."firstName", s."lastName", s."documentId", s.email,
            CASE WHEN s."gradeId" IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name) ELSE NULL END AS grade,
            CASE WHEN s."sectionId" IS NOT NULL THEN jsonb_build_object('id', sec.id, 'name', sec.name) ELSE NULL END AS section
     FROM Student s
     LEFT JOIN Grade g ON s."gradeId" = g.id
     LEFT JOIN Section sec ON s."sectionId" = sec.id
     WHERE s.id = ?`,
    [session.user.studentId]
  )

  const student = rows[0] ?? {}
  return <StudentPerfilClient student={student} email={session.user.email} />
}