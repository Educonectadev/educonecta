import { NextResponse } from "next/server"
import { query, create } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const qrToken = String(body?.qrToken ?? "")
    const isPresent = body?.isPresent === true
    const registeredByName = String(body?.registeredByName ?? "").trim().slice(0, 120)

    if (!qrToken || !registeredByName) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const students = await query<any[]>(
      `SELECT id, "institutionId", "gradeId", "sectionId" FROM Student WHERE "qrToken" = ?`,
      [qrToken]
    )
    if (students.length === 0) return NextResponse.json({ error: "QR inválido" }, { status: 404 })

    const student = students[0]
    const today = new Date().toISOString().substring(0, 10)

    const existing = await query<any[]>(
      `SELECT id, "isPresent" FROM Attendance WHERE "studentId" = ? AND date = ?`,
      [student.id, today]
    )

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        pendingConfirm: false,
      })
    }

    await create("Attendance", {
      studentId: student.id,
      teacherId: null,
      date: today,
      isPresent,
      note: null,
      source: "qr",
      confirmedByTeacher: false,
      confirmedAt: null,
      registeredByName,
    })

    return NextResponse.json({
      success: true,
      pendingConfirm: true,
    })
  } catch (e) {
    console.error("[public/asistencia]", e)
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 })
  }
}