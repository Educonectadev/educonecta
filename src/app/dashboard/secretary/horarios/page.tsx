import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import { findMany } from "@/lib/prisma"
import HorariosList from "../../admin/horarios/HorariosList"

export default async function SecretaryHorariosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY") redirect("/login")

  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()

  const [schedulesData, courses, classrooms, teachersData, grades] = await Promise.all([
    supabase
      .from("Schedule")
      .select("*, course:Course(id, name), teacher:Teacher(id, user:User(name), speciality), grade:Grade(id, name), section:Section(id, name)")
      .eq("institutionId", institutionId)
      .order("dayOfWeek")
      .order("startTime"),
    findMany("Course", { where: { institutionId }, orderBy: "name" }),
    findMany("Classroom", { where: { institutionId }, orderBy: "name" }),
    supabase.from("Teacher").select("id, userId, user:User(name), speciality").eq("institutionId", institutionId).order("name", { foreignTable: "User" }),
    findMany("Grade", { where: { institutionId }, orderBy: "name" }),
  ])

  const gradeIds = (grades as any[]).map((g: any) => g.id)
  const [{ data: sectionsData }, { data: studentsWithParents }] = await Promise.all([
    gradeIds.length
      ? supabase.from("Section").select("id, name, gradeId").in("gradeId", gradeIds).order("name")
      : Promise.resolve({ data: [] }),
    supabase
      .from("Student")
      .select("id, firstName, lastName, gradeId, sectionId, parent:Parent(id, user:User(name))")
      .eq("institutionId", institutionId)
      .eq("isActive", true)
      .order("lastName")
      .order("firstName"),
  ])

  const teachersList = (teachersData.data ?? []).map((t: any) => ({
    id: t.id,
    name: t.user?.name ?? "—",
    speciality: t.speciality,
  }))

  return (
    <HorariosList
      schedules={(schedulesData.data ?? []) as any}
      courses={courses as any}
      classrooms={classrooms as any}
      teachers={teachersList as any}
      grades={grades as any}
      sections={(sectionsData || []) as any}
      studentsWithParents={(studentsWithParents || []) as any}
    />
  )
}
