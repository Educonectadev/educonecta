import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"

export default async function StudentCalificacionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) redirect("/login")

  const studentId = session.user.studentId
  const grades = await query<any[]>(
    `SELECT gr.id, gr."evaluationName", gr.grade, gr."evaluationDate",
            c.name AS "courseName"
     FROM "GradeRecord" gr
     JOIN Course c ON c.id = gr."courseId"
     WHERE gr."studentId" = ?
     ORDER BY gr."evaluationDate" DESC NULLS LAST, gr.id DESC`,
    [studentId]
  )

  const byCourse = new Map<string, { course: string; items: any[] }>()
  for (const g of grades) {
    if (!byCourse.has(g.courseName)) byCourse.set(g.courseName, { course: g.courseName, items: [] })
    byCourse.get(g.courseName)!.items.push(g)
  }

  const courses = Array.from(byCourse.values()).map((b) => {
    const items = b.items.filter((i) => i.grade != null)
    const promedio = items.length > 0 ? items.reduce((acc, i) => acc + Number(i.grade), 0) / items.length : null
    return { ...b, promedio }
  })

  const promedioGeneral = courses.filter((c) => c.promedio !== null).length > 0
    ? courses.filter((c) => c.promedio !== null).reduce((acc, c) => acc + (c.promedio ?? 0), 0) /
      courses.filter((c) => c.promedio !== null).length
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mis calificaciones</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            {courses.length} cursos · Promedio general: <span className="font-semibold text-gray-800 dark:text-zinc-200">{promedioGeneral !== null ? promedioGeneral.toFixed(2) : "—"}</span>
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-gray-400">
          Aún no tienes calificaciones registradas.
        </div>
      ) : (
        <div className="space-y-5">
          {courses.map((c) => (
            <section key={c.course} className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <header className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">{c.course}</h2>
                <span className="text-xs rounded-full px-2.5 py-0.5 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300 font-semibold">
                  Prom. {c.promedio !== null ? c.promedio.toFixed(2) : "—"}
                </span>
              </header>
              <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                {c.items.map((i) => (
                  <li key={i.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-zinc-200 truncate">{i.evaluationName}</p>
                      {i.evaluationDate && (
                        <p className="text-xs text-gray-400">{new Date(i.evaluationDate).toLocaleDateString("es-PE")}</p>
                      )}
                    </div>
                    <span className={
                      "shrink-0 font-semibold " +
                      (Number(i.grade) >= 11
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400")
                    }>
                      {Number(i.grade).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}