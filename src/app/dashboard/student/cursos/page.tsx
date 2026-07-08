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
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="courses">
      <header>
        <p className="sa-eyebrow" style={{ color: "#8b5cf6" }}>Académico</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mis cursos</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>{courses.length} cursos este periodo.</p>
      </header>
      {courses.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Sin cursos</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Aún no tienes cursos asignados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="sa-surface p-5">
              <p className="sa-chip" style={{ color: "#8b5cf6", background: "color-mix(in srgb, #8b5cf6 14%, transparent)" }}>
                {c.courseCode ?? "—"}
              </p>
              <h3 className="mt-2 text-base font-semibold font-display" style={{ color: "var(--foreground)" }}>{c.courseName}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
