import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findMany } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"
import AlumnosList from "./AlumnosList"

export default async function AlumnosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()

  const [studentsRaw, grades, sectionsRaw] = await Promise.all([
    supabase.from("Student").select("*, grade:Grade(id, name), section:Section(id, name)").eq("institutionId", institutionId).order("createdAt", { ascending: false }),
    findMany("Grade", { where: { institutionId } }),
    supabase.from("Section").select("id, name, gradeId").in("gradeId", [] as number[]),
  ])

  const allGradeIds = (grades as any[]).map((g) => g.id)
  const sections = allGradeIds.length > 0
    ? (await supabase.from("Section").select("id, name, gradeId").in("gradeId", allGradeIds)).data ?? []
    : []

  const students = (studentsRaw.data ?? []).map((s: any) => ({ ...s, grade: s.grade ?? null, section: s.section ?? null }))

  return <AlumnosList students={students as any} grades={grades as any[]} sections={sections as any[]} />
}
