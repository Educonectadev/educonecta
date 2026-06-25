import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 })
  }

  const id = Number(req.nextUrl.searchParams.get("id"))
  if (!id) {
    return NextResponse.json({ message: "ID requerido" }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const [adminsRes, teachersRes, parentsRes, studentsRes, coursesRes, gradesRes] = await Promise.all([
      supabase.from("User").select("id", { count: "exact", head: true }).eq("institutionid", id).eq("role", "INSTITUTIONAL_ADMIN"),
      supabase.from("User").select("id", { count: "exact", head: true }).eq("institutionid", id).eq("role", "TEACHER"),
      supabase.from("User").select("id", { count: "exact", head: true }).eq("institutionid", id).eq("role", "PARENT"),
      supabase.from("Student").select("id", { count: "exact", head: true }).eq("institutionid", id),
      supabase.from("Course").select("id", { count: "exact", head: true }).eq("institutionid", id),
      supabase.from("Grade").select("id", { count: "exact", head: true }).eq("institutionid", id),
    ])

    const admins = adminsRes.count ?? 0
    const teachers = teachersRes.count ?? 0
    const parents = parentsRes.count ?? 0
    const students = studentsRes.count ?? 0
    const courses = coursesRes.count ?? 0
    const grades = gradesRes.count ?? 0

    return NextResponse.json({
      total: admins + teachers + parents + students,
      admins,
      teachers,
      parents,
      students,
      courses,
      grades,
    })
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 })
  }
}
