import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, execute } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId
    if (!teacherId) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const rows = await query<any[]>(
      `SELECT gr.*,
              s.id AS student__id, s.firstName AS student__firstName, s.lastName AS student__lastName, s.documentId AS student__documentId,
              c.id AS course__id, c.name AS course__name, c.code AS course__code
       FROM GradeRecord gr
       INNER JOIN Student s ON s.id = gr.studentId
       INNER JOIN Course c ON c.id = gr.courseId
       WHERE gr.teacherId = ?
       ORDER BY gr.createdAt DESC
       LIMIT 100`,
      [teacherId]
    )

    const grades = rows.map((r) => {
      const { student__id, student__firstName, student__lastName, student__documentId, course__id, course__name, course__code, ...rest } = r
      return {
        ...rest,
        student: { id: student__id, firstName: student__firstName, lastName: student__lastName, documentId: student__documentId },
        course: { id: course__id, name: course__name, code: course__code },
      }
    })

    return NextResponse.json({ success: true, data: grades })
  } catch (error) {
    console.error("Error fetching grades:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId
    if (!teacherId) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const { courseId, evaluationName, evaluationDate, records } = await req.json()

    if (!courseId || !evaluationName || !records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, message: "Datos incompletos" }, { status: 400 })
    }

    let count = 0
    for (const r of records) {
      await execute(
        `INSERT INTO GradeRecord (studentId, courseId, teacherId, grade, evaluationName, evaluationDate) VALUES (?, ?, ?, ?, ?, ?)`,
        [r.studentId, courseId, teacherId, r.grade, evaluationName, evaluationDate || null]
      )
      count++
    }

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error("Error creating grades:", error)
    return NextResponse.json({ success: false, message: "Error al registrar calificaciones" }, { status: 500 })
  }
}
