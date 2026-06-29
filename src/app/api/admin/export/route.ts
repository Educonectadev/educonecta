import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { exportStudents, exportGrades, exportAttendance } from "@/lib/export"

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "students"
    const gradeId = searchParams.get("gradeId") ? Number(searchParams.get("gradeId")) : undefined
    const courseId = searchParams.get("courseId") ? Number(searchParams.get("courseId")) : undefined
    const periodId = searchParams.get("periodId") ? Number(searchParams.get("periodId")) : undefined
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    let buffer: Buffer
    let filename: string

    switch (type) {
      case "grades":
        if (!courseId) {
          return NextResponse.json({ error: "courseId requerido" }, { status: 400 })
        }
        buffer = await exportGrades(session.user.institutionId, courseId, periodId)
        filename = "notas.xlsx"
        break
      case "attendance":
        if (!startDate || !endDate) {
          return NextResponse.json({ error: "startDate y endDate requeridos" }, { status: 400 })
        }
        buffer = await exportAttendance(session.user.institutionId, startDate, endDate, gradeId)
        filename = "asistencia.xlsx"
        break
      default:
        buffer = await exportStudents(session.user.institutionId, gradeId)
        filename = "estudiantes.xlsx"
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("[export] error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
