import { query } from "@/lib/prisma"
import EstudiantePublicCard from "./EstudiantePublicCard"

export const dynamic = "force-dynamic"

export default async function EstudiantePublicPage({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = await params

  const rows = await query<any[]>(
    `SELECT s.id, s."firstName", s."lastName", s."documentId", s."qrToken",
            g.name AS "gradeName", g.level AS "gradeLevel",
            sec.name AS "sectionName",
            i.name AS "institutionName", i.address, i.district, i.city
     FROM Student s
     LEFT JOIN Grade g ON s."gradeId" = g.id
     LEFT JOIN Section sec ON s."sectionId" = sec.id
     LEFT JOIN Institution i ON i.id = s."institutionId"
     WHERE s."qrToken" = ?`,
    [qrToken]
  )

  if (rows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="inline-flex size-14 items-center justify-center rounded-full bg-gray-100">
            <svg className="size-7 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Carnet no encontrado</h1>
          <p className="text-sm text-gray-500">El código QR no es válido o el carnet fue revocado.</p>
        </div>
      </div>
    )
  }

  const student = rows[0]

  const today = await query<any[]>(
    `SELECT id, "isPresent", note, "createdAt", source, "confirmedByTeacher"
     FROM Attendance
     WHERE "studentId" = ? AND date = CURRENT_DATE
     ORDER BY "createdAt" DESC LIMIT 5`,
    [student.id]
  )

  return <EstudiantePublicCard student={student} todayAttendance={today} />
}