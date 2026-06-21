import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query, create, findOne } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
    const rows = await query<any[]>(
      `SELECT h.*, c.id AS course__id, c.name AS course__name, c.code AS course__code,
              g.id AS grade__id, g.name AS grade__name, g.level AS grade__level,
              s.id AS section__id, s.name AS section__name, s.capacity AS section__capacity
       FROM Homework h
       LEFT JOIN Course c ON c.id = h.courseId
       LEFT JOIN Grade g ON g.id = h.gradeId
       LEFT JOIN Section s ON s.id = h.sectionId
       WHERE h.teacherId = ?
       ORDER BY h.createdAt DESC`,
      [teacherId]
    )

    const homework = rows.map((r) => {
      const { course__id, course__name, course__code, grade__id, grade__name, grade__level, section__id, section__name, section__capacity, ...rest } = r
      return {
        ...rest,
        course: course__id ? { id: course__id, name: course__name, code: course__code } : null,
        grade: grade__id ? { id: grade__id, name: grade__name, level: grade__level } : null,
        section: section__id ? { id: section__id, name: section__name, capacity: section__capacity } : null,
      }
    })

    return NextResponse.json({ success: true, data: homework })
  } catch (error) {
    console.error("Error fetching homework:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
    const { title, description, dueDate, courseId, gradeId, sectionId } = await req.json()

    if (!title || !dueDate || !courseId) {
      return NextResponse.json({ success: false, message: "Datos incompletos" }, { status: 400 })
    }

    const insertId = await create("Homework", {
      title,
      description,
      dueDate: new Date(dueDate),
      courseId,
      teacherId,
      gradeId: gradeId ?? null,
      sectionId: sectionId ?? null,
    })

    const homework = await findOne("Homework", { id: insertId })

    return NextResponse.json({ success: true, data: homework })
  } catch (error) {
    console.error("Error creating homework:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}
