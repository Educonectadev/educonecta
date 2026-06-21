import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const gradeId = searchParams.get("gradeId")
    const sectionId = searchParams.get("sectionId")

    if (!gradeId) {
      return NextResponse.json([])
    }

    const params: number[] = [Number(gradeId)]
    let sectionClause = ""
    if (sectionId) {
      sectionClause = "AND sectionId = ?"
      params.push(Number(sectionId))
    }

    const students = await query<any[]>(
      `SELECT id, firstName, lastName FROM Student
       WHERE gradeId = ? AND isActive = 1 ${sectionClause}
       ORDER BY lastName ASC, firstName ASC`,
      params
    )

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 })
  }
}
