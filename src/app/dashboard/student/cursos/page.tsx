import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"

export default async function StudentCursosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) redirect("/login")

  const studentId = session.user.studentId
  const courses = await query<any[]>(
    `SELECT DISTINCT ct.id, ct."courseId", ct."gradeId", ct."sectionId",
            c.name AS "courseName", c.code AS "courseCode"
     FROM "CourseTeacher" ct
     JOIN Course c ON c.id = ct."courseId"
     WHERE (ct."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
            OR ct."gradeId" IS NULL)
       AND (ct."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
            OR ct."sectionId" IS NULL)
     ORDER BY c.name`,
    [studentId, studentId]
  )

  return (
    <div className="space-y-6" data-tour="courses">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mis cursos</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{courses.length} cursos este periodo.</p>
      </div>
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-gray-400">
          Aún no tienes cursos asignados.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">{c.courseCode ?? "—"}</p>
              <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-white/90">{c.courseName}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}