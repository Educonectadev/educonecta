import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import TeacherDashboard from "./TeacherDashboard"

export const dynamic = "force-dynamic"

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
  const institutionName = session.user.institutionName ?? ""
  let error: string | null = null

  try {
    if (!teacherId || !institutionId) {
      throw new Error("No se encontraron datos del profesor")
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [ctData, hwData, schedData] = await Promise.all([
      query<any[]>(
        "SELECT ct.id, ct.\"courseId\", ct.\"gradeId\", ct.\"sectionId\", c.name AS \"courseName\", g.name AS \"gradeName\", sec.name AS \"sectionName\" FROM \"CourseTeacher\" ct LEFT JOIN \"Course\" c ON c.id = ct.\"courseId\" LEFT JOIN \"Grade\" g ON g.id = ct.\"gradeId\" LEFT JOIN \"Section\" sec ON sec.id = ct.\"sectionId\" WHERE ct.\"teacherId\" = ?",
        [teacherId]
      ),
      query<any[]>(
        "SELECT h.id, h.title, h.\"dueDate\", c.name AS \"courseName\", g.name AS \"gradeName\", sec.name AS \"sectionName\" FROM \"Homework\" h LEFT JOIN \"Course\" c ON c.id = h.\"courseId\" LEFT JOIN \"Grade\" g ON g.id = h.\"gradeId\" LEFT JOIN \"Section\" sec ON sec.id = h.\"sectionId\" WHERE h.\"teacherId\" = ? ORDER BY h.\"createdAt\" DESC LIMIT 5",
        [teacherId]
      ),
      query<any[]>(
        `SELECT s.id, s.\"dayOfWeek\", s.\"startTime\", s.\"endTime\", s.\"courseId\", s.\"classroom\",
                c.name AS \"courseName\"
         FROM "Schedule" s
         LEFT JOIN "Course" c ON c.id = s."courseId"
         WHERE s."teacherId" = ? AND s."dayOfWeek" >= ?
         ORDER BY s."dayOfWeek" ASC, s."startTime" ASC
         LIMIT 8`,
        [teacherId, today.getDay() || 7]
      ),
    ])

    courseTeachers = (ctData as any[]).map((ct) => ({
      id: ct.id,
      courseId: ct.courseId,
      gradeId: ct.gradeId,
      sectionId: ct.sectionId,
      course: { id: ct.courseId, name: ct.courseName },
      grade: ct.gradeName ? { name: ct.gradeName } : null,
      section: ct.sectionName ? { name: ct.sectionName } : null,
    }))

    recentHomework = (hwData as any[]).map((h) => ({
      id: h.id,
      title: h.title,
      dueDate: h.dueDate,
      course: { name: h.courseName },
      grade: h.gradeName ? { name: h.gradeName } : null,
      section: h.sectionName ? { name: h.sectionName } : null,
    }))

    upcomingClasses = (schedData as any[]).map((s) => ({
      id: s.id,
      courseId: s.courseId,
      dayOfWeek: s.dayOfWeek,
      startTime: typeof s.startTime === "string" ? s.startTime.slice(0, 5) : s.startTime,
      endTime: typeof s.endTime === "string" ? s.endTime.slice(0, 5) : s.endTime,
      course: { id: s.courseId, name: s.courseName },
      grade: null,
      section: null,
      classroom: s.classroom ?? null,
    }))

    // Stats agregadas en una sola query.
    const gradeIds = courseTeachers
      .map((ct) => ct.gradeId)
      .filter((x): x is number => x != null)
    const today0 = today.toISOString().substring(0, 10)

    let statsSql = `
      SELECT
        (SELECT COUNT(*)::int FROM "Homework" WHERE "teacherId" = ? AND "dueDate" >= ?) AS "activeHomework",
        (SELECT COUNT(*)::int FROM "Schedule" WHERE "teacherId" = ? AND "dayOfWeek" = ?) AS "classesToday"
    `
    const statsParams: any[] = [teacherId, today, today.getDay() || 7]

    if (gradeIds.length > 0) {
      const placeholders = gradeIds.map((_, i) => `$${i + 4}`).join(",")
      statsSql = `
        SELECT
          (SELECT COUNT(*)::int FROM "Homework" WHERE "teacherId" = ? AND "dueDate" >= ?) AS "activeHomework",
          (SELECT COUNT(*)::int FROM "Schedule" WHERE "teacherId" = ? AND "dayOfWeek" = ?) AS "classesToday",
          (SELECT COUNT(DISTINCT s.id)::int
             FROM "Student" s
             WHERE s."institutionId" = ? AND s."isActive" = TRUE
               AND s."gradeId" IN (${placeholders})) AS "totalStudents"
      `
      statsParams.push(...gradeIds)
    } else {
      statsSql = `
        SELECT
          (SELECT COUNT(*)::int FROM "Homework" WHERE "teacherId" = ? AND "dueDate" >= ?) AS "activeHomework",
          (SELECT COUNT(*)::int FROM "Schedule" WHERE "teacherId" = ? AND "dayOfWeek" = ?) AS "classesToday",
          (SELECT COUNT(*)::int FROM "Student" WHERE "institutionId" = ? AND "isActive" = TRUE) AS "totalStudents"
      `
    }

    const statsRows = await query<any[]>(statsSql, statsParams).catch(() => [])
    const srow = (statsRows as any[])[0] ?? {}
    activeHomework = Number(srow.activeHomework ?? 0)
    classesToday = Number(srow.classesToday ?? 0)
    totalStudents = Number(srow.totalStudents ?? 0)
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