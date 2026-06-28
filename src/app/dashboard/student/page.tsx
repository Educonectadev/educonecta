import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { query } from "@/lib/prisma"

export default async function StudentHome() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT") redirect("/login")

  const studentId = session.user.studentId
  if (!studentId) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mi cuenta aún no está vinculada</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          Tu administrador aún no ha asociado esta cuenta a un alumno. Pídele que complete el registro.
        </p>
      </div>
    )
  }

  const [student, courses, homework, grades, attendance, communications] = await Promise.all([
    query(
      `SELECT s.id, s."firstName", s."lastName", s.email,
              CASE WHEN s."gradeId" IS NOT NULL THEN jsonb_build_object('id', g.id, 'name', g.name) ELSE NULL END AS grade,
              CASE WHEN s."sectionId" IS NOT NULL THEN jsonb_build_object('id', sec.id, 'name', sec.name) ELSE NULL END AS section
       FROM Student s
       LEFT JOIN Grade g ON s."gradeId" = g.id
       LEFT JOIN Section sec ON s."sectionId" = sec.id
       WHERE s.id = ?`,
      [studentId]
    ),
    query<any[]>(
      `SELECT ct.id, ct."courseId", ct."gradeId", ct."sectionId",
              c.name AS "courseName", c.code AS "courseCode"
       FROM "CourseTeacher" ct
       JOIN Course c ON c.id = ct."courseId"
       WHERE (ct."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
              OR ct."gradeId" IS NULL)
         AND (ct."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
              OR ct."sectionId" IS NULL)
       ORDER BY c.name`,
      [studentId, studentId]
    ),
    query<any[]>(
      `SELECT h.id, h.title, h."dueDate", h."courseId",
              c.name AS "courseName"
       FROM Homework h
       JOIN Course c ON c.id = h."courseId"
       WHERE (h."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
              OR h."gradeId" IS NULL)
         AND (h."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
              OR h."sectionId" IS NULL)
       ORDER BY h."dueDate" ASC
       LIMIT 8`,
      [studentId, studentId]
    ),
    query<any[]>(
      `SELECT gr.id, gr."evaluationName", gr.grade, gr."evaluationDate",
              c.name AS "courseName"
       FROM "GradeRecord" gr
       JOIN Course c ON c.id = gr."courseId"
       WHERE gr."studentId" = ?
       ORDER BY gr."evaluationDate" DESC NULLS LAST, gr.id DESC
       LIMIT 8`,
      [studentId]
    ),
    query<any[]>(
      `SELECT a.id, a.date, a."isPresent", a.note, c.name AS "courseName"
       FROM Attendance a
       LEFT JOIN Course c ON c.id = (
         SELECT ct."courseId" FROM "CourseTeacher" ct
         WHERE ct."teacherId" = a."teacherId" LIMIT 1
       )
       WHERE a."studentId" = ?
       ORDER BY a.date DESC
       LIMIT 10`,
      [studentId]
    ),
    query<any[]>(
      `SELECT id, title, content, type, priority, "createdAt"
       FROM Communication
       WHERE "institutionId" = ?
         AND ("teacherId" IS NULL OR "teacherId" IN (
           SELECT DISTINCT ct."teacherId" FROM "CourseTeacher" ct
           WHERE (ct."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
                  OR ct."gradeId" IS NULL)
             AND (ct."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
                  OR ct."sectionId" IS NULL)
         ))
       ORDER BY "createdAt" DESC
       LIMIT 5`,
      [session.user.institutionId ?? 0, studentId, studentId]
    ),
  ])

  const s = (student as any[])[0] ?? {}
  const fullName = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || session.user.name

  const totalAttendance = (attendance as any[]).length
  const presentes = (attendance as any[]).filter((a) => a.isPresent).length
  const asistenciaPct = totalAttendance > 0 ? Math.round((presentes / totalAttendance) * 100) : null

  const calificaciones = (grades as any[]).filter((g) => g.grade != null)
  const promedio = calificaciones.length > 0
    ? calificaciones.reduce((acc, g) => acc + Number(g.grade), 0) / calificaciones.length
    : null

  const tareasPendientes = (homework as any[]).filter((h) => new Date(h.dueDate) >= new Date())

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">Bienvenido</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white/90">{fullName}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {s.grade?.name ?? "Sin grado"}{s.section?.name ? ` · Sección ${s.section.name}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cursos" value={(courses as any[]).length} accent="violet" />
        <StatCard label="Tareas pendientes" value={tareasPendientes.length} accent="amber" />
        <StatCard label="Promedio" value={promedio !== null ? promedio.toFixed(2) : "—"} accent="emerald" />
        <StatCard label="Asistencia" value={asistenciaPct !== null ? `${asistenciaPct}%` : "—"} accent="sky" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">Próximas tareas</h2>
            <Link href="/dashboard/student/tareas" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">Ver todas →</Link>
          </header>
          {tareasPendientes.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No tienes tareas pendientes.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
              {tareasPendientes.slice(0, 5).map((h: any) => (
                <li key={h.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white/90 truncate">{h.title}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{h.courseName}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-zinc-400">
                    {new Date(h.dueDate).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">Avisos</h2>
            <Link href="/dashboard/student/comunicados" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">Ver todos →</Link>
          </header>
          {(communications as any[]).length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Sin avisos recientes.</p>
          ) : (
            <ul className="space-y-3">
              {(communications as any[]).slice(0, 4).map((c: any) => (
                <li key={c.id} className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white/90">{c.title}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2">{c.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: "violet" | "amber" | "emerald" | "sky" }) {
  const tones: Record<string, string> = {
    violet: "text-violet-700 dark:text-violet-400",
    amber: "text-amber-700 dark:text-amber-400",
    emerald: "text-emerald-700 dark:text-emerald-400",
    sky: "text-sky-700 dark:text-sky-400",
  }
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">{label}</p>
      <p className={"mt-2 text-2xl font-bold tracking-tight " + (tones[accent] ?? "text-gray-900 dark:text-white/90")}>{value}</p>
    </div>
  )
}