import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const teacherId = session.user.teacherId!
  const userId = Number(session.user.id)

  const user = await query<any[]>(
    "SELECT id, email, name, role, createdAt FROM User WHERE id = ?",
    [userId]
  )

  const teacher = await query<any[]>(
    `SELECT t.*, i.name AS institutionName
     FROM Teacher t
     LEFT JOIN Institution i ON t.institutionId = i.id
     WHERE t.id = ?`,
    [teacherId]
  )

  const courses = await query<any[]>(
    `SELECT ct.id, c.name AS courseName, g.name AS gradeName, g.level, sec.name AS sectionName
     FROM CourseTeacher ct
     LEFT JOIN Course c ON ct.courseId = c.id
     LEFT JOIN Grade g ON ct.gradeId = g.id
     LEFT JOIN Section sec ON ct.sectionId = sec.id
     WHERE ct.teacherId = ?
     ORDER BY c.name`,
    [teacherId]
  )

  const stats = await query<any[]>(
    `SELECT
       (SELECT COUNT(*) FROM CourseTeacher WHERE teacherId = ?) AS totalCourses,
       (SELECT COUNT(DISTINCT s.id) FROM Student s
        INNER JOIN CourseTeacher ct ON ct.gradeId = s.gradeId AND ct.sectionId = s.sectionId
        WHERE ct.teacherId = ? AND s.isActive = 1) AS totalStudents`,
    [teacherId, teacherId]
  )

  return NextResponse.json({
    user: user[0] ?? null,
    teacher: teacher[0] ?? null,
    courses,
    stats: stats[0] ?? { totalCourses: 0, totalStudents: 0 },
  })
}
