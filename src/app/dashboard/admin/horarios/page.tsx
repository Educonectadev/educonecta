import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import { findMany } from "@/lib/prisma"
import HorariosList from "./HorariosList"

export default async function HorariosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()

  const [{ data: schedulesData }, courses, classrooms, { data: teachers }, grades] =
    await Promise.all([
      supabase
        .from("Schedule")
        .select(
          "*, course:Course(id, name), teacher:Teacher(id, user:User(name), speciality), grade:Grade(id, name), section:Section(id, name)",
        )
        .eq("institutionId", institutionId)
        .order("dayOfWeek")
        .order("startTime"),
      findMany("Course", { where: { institutionId }, orderBy: "name" }) as Promise<any[]>,
      findMany("Classroom", { where: { institutionId }, orderBy: "name" }) as Promise<any[]>,
      supabase
        .from("Teacher")
        .select("id, userId, user:User(name), speciality")
        .eq("institutionId", institutionId)
        .order("name", { foreignTable: "User" }),
      findMany("Grade", { where: { institutionId }, orderBy: "name" }) as Promise<any[]>,
    ])

  const gradeIds = (grades as any[]).map((g) => g.id)
  const [{ data: sectionsData }, { data: studentsWithParents }] = await Promise.all([
    supabase
      .from("Section")
      .select("id, name, gradeId")
      .in("gradeId", gradeIds)
      .order("name"),
    supabase
      .from("Student")
      .select("id, firstName, lastName, gradeId, sectionId, parent:Parent(id, user:User(name))")
      .eq("institutionId", institutionId)
      .eq("isActive", true)
      .order("lastName")
      .order("firstName"),
  ])

  const schedules = (schedulesData || []).map((s: any) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    classroom: s.classroom,
    shift: s.shift,
    course: s.course ? { id: s.course.id, name: s.course.name } : null,
    teacher: s.teacher
      ? { id: s.teacher.id, name: s.teacher.user?.name, speciality: s.teacher.speciality }
      : null,
    grade: s.grade ? { id: s.grade.id, name: s.grade.name } : null,
    section: s.section ? { id: s.section.id, name: s.section.name } : null,
  }))

  return (
    <HorariosList
      schedules={schedules}
      courses={courses}
      classrooms={classrooms}
      teachers={teachers || []}
      grades={grades}
      sections={sectionsData || []}
      studentsWithParents={studentsWithParents || []}
    />
  )
}
