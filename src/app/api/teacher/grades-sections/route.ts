import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const institutionId = session.user.institutionId!

    const [grades, sections] = await Promise.all([
      query("SELECT id, name, level FROM Grade WHERE institutionId = ? ORDER BY name", [institutionId]),
      query("SELECT id, name, gradeId FROM Section WHERE gradeId IN (SELECT id FROM Grade WHERE institutionId = ?) ORDER BY name", [institutionId]),
    ])

    return NextResponse.json({ grades, sections })
  } catch {
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}
