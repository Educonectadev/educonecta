import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"

export default async function StudentTareasPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) redirect("/login")

  const studentId = session.user.studentId
  const tareas = await query<any[]>(
    `SELECT h.id, h.title, h.description, h."dueDate", h."createdAt",
            c.name AS "courseName",
            (h."dueDate" < NOW()) AS "isOverdue"
     FROM Homework h
     JOIN Course c ON c.id = h."courseId"
     WHERE (h."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
            OR h."gradeId" IS NULL)
       AND (h."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
            OR h."sectionId" IS NULL)
     ORDER BY h."dueDate" ASC`,
    [studentId, studentId]
  )

  const ahora = new Date()
  const pendientes = tareas.filter((t) => new Date(t.dueDate) >= ahora)
  const vencidas = tareas.filter((t) => new Date(t.dueDate) < ahora)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mis tareas</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {pendientes.length} pendientes · {vencidas.length} vencidas
        </p>
      </div>

      {tareas.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-gray-400">
          No tienes tareas asignadas.
        </div>
      ) : (
        <div className="space-y-3">
          {tareas.map((t) => {
            const overdue = new Date(t.dueDate) < ahora
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">{t.title}</h3>
                    {overdue && (
                      <span className="text-[10px] uppercase tracking-wider rounded-full bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 font-semibold">Vencida</span>
                    )}
                  </div>
                  {t.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400 line-clamp-2">{t.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">{t.courseName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-zinc-500">Vence</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                    {new Date(t.dueDate).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}