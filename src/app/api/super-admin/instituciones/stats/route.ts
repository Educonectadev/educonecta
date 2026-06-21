import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 })
  }

  const id = Number(req.nextUrl.searchParams.get("id"))
  if (!id) {
    return NextResponse.json({ message: "ID requerido" }, { status: 400 })
  }

  try {
    const [admins] = await query<any[]>(
      "SELECT COUNT(*) as total FROM User WHERE institutionId = ? AND role = 'INSTITUTIONAL_ADMIN'", [id]
    )
    const [teachers] = await query<any[]>(
      "SELECT COUNT(*) as total FROM User WHERE institutionId = ? AND role = 'TEACHER'", [id]
    )
    const [parents] = await query<any[]>(
      "SELECT COUNT(*) as total FROM User WHERE institutionId = ? AND role = 'PARENT'", [id]
    )
    const [students] = await query<any[]>(
      "SELECT COUNT(*) as total FROM Student WHERE institutionId = ?", [id]
    )
    const [courses] = await query<any[]>(
      "SELECT COUNT(*) as total FROM Course WHERE institutionId = ?", [id]
    )
    const [grades] = await query<any[]>(
      "SELECT COUNT(*) as total FROM Grade WHERE institutionId = ?", [id]
    )

    const total = Number(admins.total) + Number(teachers.total) + Number(parents.total) + Number(students.total)

    return NextResponse.json({
      total,
      admins: Number(admins.total),
      teachers: Number(teachers.total),
      parents: Number(parents.total),
      students: Number(students.total),
      courses: Number(courses.total),
      grades: Number(grades.total),
    })
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 })
  }
}
