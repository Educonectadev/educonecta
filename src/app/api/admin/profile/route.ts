import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, findOne } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId = Number(session.user.id)
  const institutionId = session.user.institutionId!

  const user = await query<any[]>(
    "SELECT id, email, name, role, createdAt FROM User WHERE id = ?",
    [userId]
  )

  const institution = await findOne("Institution", { id: institutionId })

  const stats = await query<any[]>(
    `SELECT
       (SELECT COUNT(*) FROM Student WHERE institutionId = ? AND isActive = 1) AS totalStudents,
       (SELECT COUNT(*) FROM Teacher WHERE institutionId = ?) AS totalTeachers,
       (SELECT COUNT(*) FROM Course WHERE institutionId = ?) AS totalCourses,
       (SELECT COUNT(*) FROM Schedule WHERE institutionId = ?) AS totalSchedules`,
    [institutionId, institutionId, institutionId, institutionId]
  )

  return NextResponse.json({
    user: user[0] ?? null,
    institution,
    stats: stats[0] ?? { totalStudents: 0, totalTeachers: 0, totalCourses: 0, totalSchedules: 0 },
  })
}
