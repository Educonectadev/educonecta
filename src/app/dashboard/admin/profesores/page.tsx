import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import { findMany } from "@/lib/prisma"
import ProfesoresList from "./ProfesoresList"

export default async function ProfesoresPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()
  const [{ data, error }, courses, grades] = await Promise.all([
    supabase
      .from("Teacher")
      .select("*, user:User(id, name, email, phone)")
      .eq("institutionId", institutionId)
      .order("createdAt", { ascending: false }),
    findMany("Course", { where: { institutionId }, orderBy: "name", orderDir: "ASC" }),
    findMany("Grade", { where: { institutionId }, orderBy: "name" }),
  ])

  if (error) throw error

  const sections = grades.length
    ? (await supabase.from("Section").select("id, name, gradeId").in(
        "gradeId",
        grades.map((g: any) => g.id),
      )).data ?? []
    : []

  const teachers = (data ?? []).map((t: any) => ({
    id: t.id,
    speciality: t.speciality,
    documentId: t.documentId,
    professionalTitle: t.title,
    educationLevel: t.educationLevel,
    hireDate: t.hireDate,
    contractType: t.contractType,
    address: t.address,
    emergencyContactName: t.emergencyContact,
    emergencyContactPhone: t.emergencyPhone,
    user: t.user,
  }))

  return (
    <ProfesoresList
      teachers={teachers as any}
      courses={courses as any}
      grades={grades as any}
      sections={sections as any}
    />
  )
}
