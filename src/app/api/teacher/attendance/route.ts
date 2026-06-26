import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

type Status = "PRESENT" | "ABSENT" | "LATE"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const teacherId = session.user.teacherId!
    const { records, date } = await req.json()

    if (!date || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, message: "Datos incompletos" }, { status: 400 })
    }

    const dateOnly = String(date).slice(0, 10)

    const supabase = getSupabaseAdmin()

    const attendanceRows = records
      .filter((r: { status: Status }) => r.status === "PRESENT" || r.status === "ABSENT")
      .map((r: { studentId: number; status: Status }) => ({
        studentId: Number(r.studentId),
        teacherId,
        date: dateOnly,
        isPresent: r.status === "PRESENT",
      }))

    const tardyRows = records
      .filter((r: { status: Status; minutesLate?: number }) => r.status === "LATE")
      .map((r: { studentId: number; minutesLate?: number }) => ({
        studentId: Number(r.studentId),
        teacherId,
        date: dateOnly,
        minutesLate: Math.max(1, Number(r.minutesLate ?? 5)),
      }))

    let attendanceCount = 0
    if (attendanceRows.length > 0) {
      const { error, count } = await supabase
        .from("Attendance")
        .upsert(attendanceRows, { onConflict: "studentId,date", count: "exact" })
      if (error) {
        console.error("[attendance] upsert error:", error)
        return NextResponse.json(
          { success: false, message: error.message, code: error.code, details: error.details },
          { status: 500 },
        )
      }
      attendanceCount = count ?? attendanceRows.length
    }

    if (tardyRows.length > 0) {
      const { error, count } = await supabase
        .from("Tardiness")
        .upsert(tardyRows, { onConflict: "studentId,date", count: "exact" })
      if (error) {
        console.error("[attendance] tardiness upsert error:", error)
        return NextResponse.json(
          { success: false, message: error.message, code: error.code, details: error.details },
          { status: 500 },
        )
      }
      attendanceCount += count ?? tardyRows.length
    }

    return NextResponse.json({ success: true, count: attendanceCount })
  } catch (error) {
    console.error("[attendance] POST error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}