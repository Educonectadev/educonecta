import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Cuenta global de la plataforma para todos los docentes.
    // El flujo real es por institución, así que filtramos por la del docente.
    const teacherId = session.user.teacherId
    let institutionId: number | null = null
    if (teacherId) {
      const rows = await query<any[]>(
        `SELECT "institutionId" FROM "Teacher" WHERE id = ?`,
        [teacherId]
      )
      institutionId = (rows as any[])[0]?.institutionId ?? null
    }

    let count = 0
    if (institutionId != null) {
      const rows = await query<any[]>(
        `SELECT COUNT(*)::int AS c
         FROM Attendance a
         JOIN Student s ON s.id = a."studentId"
         WHERE a.source = 'qr' AND a."confirmedByTeacher" = FALSE
           AND s."institutionId" = ?`,
        [institutionId]
      )
      count = Number((rows as any[])[0]?.c ?? 0)
    } else {
      const rows = await query<any[]>(
        `SELECT COUNT(*)::int AS c
         FROM Attendance
         WHERE source = 'qr' AND "confirmedByTeacher" = FALSE`
      )
      count = Number((rows as any[])[0]?.c ?? 0)
    }

    return NextResponse.json({ count })
  } catch (e: any) {
    console.error("[pending-count]", e?.message ?? e)
    return NextResponse.json({ count: 0 })
  }
}