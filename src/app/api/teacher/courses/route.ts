import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!

    const rows = await query<any[]>(
      `SELECT ct.*,
              c.id AS course__id, c.name AS course__name, c.code AS course__code, c.description AS course__description, c.institutionId AS course__institutionId,
              g.id AS grade__id, g.name AS grade__name, g.level AS grade__level,
              s.id AS section__id, s.name AS section__name, s.capacity AS section__capacity
       FROM CourseTeacher ct
       INNER JOIN Course c ON c.id = ct.courseId
       LEFT JOIN Grade g ON g.id = ct.gradeId
       LEFT JOIN Section s ON s.id = ct.sectionId
       WHERE ct.teacherId = ?`,
      [teacherId]
    )

    const courseTeachers = rows.map((r) => {
      const { course__id, course__name, course__code, course__description, course__institutionId, grade__id, grade__name, grade__level, section__id, section__name, section__capacity, ...rest } = r
      return {
        ...rest,
        course: { id: course__id, name: course__name, code: course__code, description: course__description, institutionId: course__institutionId },
        grade: grade__id ? { id: grade__id, name: grade__name, level: grade__level } : null,
        section: section__id ? { id: section__id, name: section__name, capacity: section__capacity } : null,
      }
    })

    return NextResponse.json(courseTeachers)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}
