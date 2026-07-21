import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import QrAttendanceClient from "./QrAttendanceClient"

export const dynamic = "force-dynamic"

export default async function QrAttendancePage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER" || !session.user.institutionId) redirect("/login")

  const pending = await query<any[]>(
    `SELECT a.id, a."isPresent", a.note, a."registeredByName", a."createdAt", a.date,
            s.id AS "studentId", s."firstName", s."lastName", s."documentId",
            g.name AS "gradeName", sec.name AS "sectionName"
     FROM Attendance a
     JOIN Student s ON s.id = a."studentId"
     LEFT JOIN Grade g ON g."id" = s."gradeId"
     LEFT JOIN Section sec ON sec."id" = s."sectionId"
     WHERE a.source = 'qr' AND a."confirmedByTeacher" = FALSE
       AND s."institutionId" = ?
     ORDER BY a."createdAt" DESC
     LIMIT 200`,
    [session.user.institutionId]
  )

  return <QrAttendanceClient pending={pending as any} />
}