import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { transaction } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
    const { courseId, date, records } = await req.json()

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, message: "Datos incompletos" }, { status: 400 })
    }

    const dateObj = new Date(date)

    const results = await transaction(async (conn) => {
      const c = conn as any
      const out = []
      for (const r of records) {
        const [result] = await c.execute(
          `INSERT INTO Attendance (studentId, teacherId, date, isPresent) VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE isPresent = VALUES(isPresent), teacherId = VALUES(teacherId)`,
          [r.studentId, teacherId, dateObj, r.isPresent]
        )
        out.push(result)
      }
      return out
    })

    const tardyRecords = records.filter((r: { minutesLate: number }) => r.minutesLate > 0)
    if (tardyRecords.length > 0) {
      await transaction(async (conn) => {
        const c = conn as any
        for (const r of tardyRecords) {
          await c.execute(
            `INSERT INTO Tardiness (studentId, teacherId, date, minutesLate) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE minutesLate = VALUES(minutesLate), teacherId = VALUES(teacherId)`,
            [r.studentId, teacherId, dateObj, r.minutesLate]
          )
        }
      })
    }

    return NextResponse.json({ success: true, count: results.length })
  } catch (error) {
    console.error("Error saving attendance:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}
