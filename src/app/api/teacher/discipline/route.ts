import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { query, create, findOne } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
    const rows = await query<any[]>(
      `SELECT d.*, s.id AS student__id, s.firstName AS student__firstName, s.lastName AS student__lastName, s.documentId AS student__documentId
       FROM Discipline d INNER JOIN Student s ON s.id = d.studentId
       WHERE d.teacherId = ?
       ORDER BY d.createdAt DESC
       LIMIT 100`,
      [teacherId]
    )

    const records = rows.map((r) => {
      const { student__id, student__firstName, student__lastName, student__documentId, ...rest } = r
      return {
        ...rest,
        student: { id: student__id, firstName: student__firstName, lastName: student__lastName, documentId: student__documentId },
      }
    })

    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error("Error fetching discipline:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
    const { studentId, type, description, date } = await req.json()

    if (!studentId || !type || !description) {
      return NextResponse.json({ success: false, message: "Datos incompletos" }, { status: 400 })
    }

    const insertId = await create("Discipline", {
      studentId,
      teacherId,
      type,
      description,
      date: date ? new Date(date) : new Date(),
    })

    const record = await findOne("Discipline", { id: insertId })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error("Error creating discipline record:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}
