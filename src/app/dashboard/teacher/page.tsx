import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query, findOne } from "@/lib/prisma"
import TeacherDashboard from "./TeacherDashboard"

export default async function TeacherDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId
  const institutionId = session.user.institutionId

  let courseTeachers: any[] = []
  let recentHomework: any[] = []
  let upcomingClasses: any[] = []
  let totalStudents = 0
  let activeHomework = 0
  let classesToday = 0
  let institutionName = ""
  let error: string | null = null

  try {
    if (!teacherId || !institutionId) {
      throw new Error("No se encontraron datos del profesor")
    }

    const institution = await findOne("Institution", { id: institutionId })
    institutionName = (institution as any)?.name ?? ""

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [ctData, hwData, schedData, gradeCountResult] = await Promise.all([
      query<any[]>(
        "SELECT ct.*, c.id as c_id, c.name as c_name, g.id as g_id, g.name as g_name, sec.id as sec_id, sec.name as sec_name FROM CourseTeacher ct LEFT JOIN Course c ON c.id = ct.courseId LEFT JOIN Grade g ON g.id = ct.gradeId LEFT JOIN Section sec ON sec.id = ct.sectionId WHERE ct.teacherId = ?",
        [teacherId]
      ),
      query<any[]>(
        "SELECT h.*, c.id as c_id, c.name as c_name, g.id as g_id, g.name as g_name, sec.id as sec_id, sec.name as sec_name FROM Homework h LEFT JOIN Course c ON c.id = h.courseId LEFT JOIN Grade g ON g.id = h.gradeId LEFT JOIN Section sec ON sec.id = h.sectionId WHERE h.teacherId = ? ORDER BY h.createdAt DESC LIMIT 5",
        [teacherId]
      ),
      query<any[]>(
        `SELECT s.*, c.id as c_id, c.name as c_name, g.id as g_id, g.name as g_name, sec.id as sec_id, sec.name as sec_name
         FROM Schedule s
         LEFT JOIN Course c ON c.id = s.courseId
         LEFT JOIN Grade g ON g.id = s.gradeId
         LEFT JOIN Section sec ON sec.id = s.sectionId
         WHERE s.teacherId = ? AND s.dayOfWeek >= ?
         ORDER BY s.dayOfWeek ASC, s.startTime ASC
         LIMIT 8`,
        [teacherId, today.getDay() || 7]
      ),
      query<any[]>("SELECT COUNT(DISTINCT courseId) AS total FROM CourseTeacher WHERE teacherId = ?", [teacherId]),
    ])

    courseTeachers = ctData.map((ct: any) => ({
      id: ct.id,
      courseId: ct.courseId,
      gradeId: ct.gradeId,
      sectionId: ct.sectionId,
      course: { id: ct.c_id, name: ct.c_name },
      grade: ct.g_id ? { id: ct.g_id, name: ct.g_name } : null,
      section: ct.sec_id ? { id: ct.sec_id, name: ct.sec_name } : null,
    }))

    recentHomework = hwData.map((h: any) => ({
      id: h.id,
      title: h.title,
      dueDate: h.dueDate,
      course: { name: h.c_name },
      grade: h.g_id ? { name: h.g_name } : null,
      section: h.sec_id ? { name: h.sec_name } : null,
    }))

    upcomingClasses = schedData.map((s: any) => ({
      id: s.id,
      courseId: s.courseId,
      dayOfWeek: s.dayOfWeek,
      startTime: typeof s.startTime === "string" ? s.startTime.slice(0, 5) : s.startTime,
      endTime: typeof s.endTime === "string" ? s.endTime.slice(0, 5) : s.endTime,
      course: { id: s.c_id, name: s.c_name },
      grade: s.g_id ? { id: s.g_id, name: s.g_name } : null,
      section: s.sec_id ? { id: s.sec_id, name: s.sec_name } : null,
      classroom: s.classroom ?? null,
    }))

    const gradeIds: number[] = []
    for (const ct of courseTeachers) {
      if (ct.gradeId != null) gradeIds.push(ct.gradeId)
    }

    if (gradeIds.length > 0) {
      const placeholders = gradeIds.map(() => "?").join(",")
      const r = await query<any[]>(`SELECT COUNT(*) as total FROM Student WHERE institutionId = ? AND isActive = true AND gradeId IN (${placeholders})`, [institutionId, ...gradeIds])
      totalStudents = r[0]?.total ?? 0
    } else {
      const r = await query<any[]>("SELECT COUNT(*) as total FROM Student WHERE institutionId = ? AND isActive = true", [institutionId])
      totalStudents = r[0]?.total ?? 0
    }

    const activeHw = await query<any[]>("SELECT COUNT(*) as total FROM Homework WHERE teacherId = ? AND dueDate >= ?", [teacherId, today])
    activeHomework = activeHw[0]?.total ?? 0

    if (courseTeachers.length > 0) {
      const courseIds = courseTeachers.map((ct: any) => ct.courseId)
      const placeholders = courseIds.map(() => "?").join(",")
      const dow = today.getDay()
      const result = await query<any[]>(
        `SELECT COUNT(*) as total FROM Schedule WHERE institutionId = ? AND dayOfWeek = ? AND courseId IN (${placeholders})`,
        [institutionId, dow === 0 ? 7 : dow, ...courseIds]
      )
      classesToday = result[0]?.total ?? 0
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      error = e.message
    } else if (e && typeof e === "object" && "message" in e) {
      error = String((e as { message: unknown }).message)
    } else {
      error = "Error inesperado"
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-8">
        <span className="material-icons text-5xl text-red-400">error_outline</span>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">Error al cargar el panel</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md">{error}</p>
        <a href="/dashboard/teacher" className="btn-primary px-6 py-2.5 rounded-[30px] text-sm font-medium">
          Reintentar
        </a>
      </div>
    )
  }

  return (
    <TeacherDashboard
      teacherName={session.user.name}
      institutionName={institutionName}
      stats={{
        totalStudents,
        activeHomework,
        classesToday,
        totalCourses: courseTeachers.length,
      }}
      courseTeachers={courseTeachers}
      recentHomework={recentHomework}
      upcomingClasses={upcomingClasses}
    />
  )
}