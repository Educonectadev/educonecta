import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query, transaction } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
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
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
    const { courseId, evaluationName, evaluationDate, records } = await req.json()

    if (!courseId || !evaluationName || !records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, message: "Datos incompletos" }, { status: 400 })
    }

    const created = await transaction(async (conn) => {
      const c = conn as any
      const out = []
      for (const r of records) {
        const [result] = await c.execute(
          `INSERT INTO GradeRecord (studentId, courseId, teacherId, grade, evaluationName, evaluationDate) VALUES (?, ?, ?, ?, ?, ?)`,
          [r.studentId, courseId, teacherId, r.grade, evaluationName, evaluationDate ? new Date(evaluationDate) : null]
        )
        out.push(result)
      }
      return out
    })

    return NextResponse.json({ success: true, count: created.length })
  } catch (error) {
    console.error("Error creating grades:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}
