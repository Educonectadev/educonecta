import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"

const typeLabels: Record<string, string> = {
  attention_call: "Llamado de Atención",
  warning: "Amonestación",
  suspension: "Suspensión",
}

export default async function DisciplinaPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const data = await query<any[]>(
    "SELECT d.*, s.firstName as s_firstName, s.lastName as s_lastName FROM Discipline d LEFT JOIN Student s ON s.id = d.studentId WHERE d.teacherId = ? ORDER BY d.createdAt DESC LIMIT 50",
    [teacherId]
  )

  const records = data.map((r) => ({
    id: r.id,
    type: r.type,
    description: r.description,
    date: r.date,
    isResolved: !!r.isResolved,
    student: { firstName: r.s_firstName, lastName: r.s_lastName },
  }))

  return (
    <div className="space-y-8" data-tour="discipline">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Disciplina</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{records.length} registros</p>
        </div>
        <Link
          href="/dashboard/teacher/disciplina/nuevo"
          className="btn-primary rounded-[30px] px-6 py-2.5 text-sm font-medium text-center"
        >
          + Nuevo Registro
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-12 text-center text-gray-400 dark:text-zinc-500 text-sm">
          No hay registros disciplinarios.
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r: { id: number; type: string; description: string; date: Date; isResolved: boolean; student: { firstName: string; lastName: string } }) => (
            <div key={r.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-black/20 transition-all duration-200">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-semibold text-gray-900 dark:text-white/90">
                  {r.student.firstName} {r.student.lastName}
                </p>
                <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                  r.type === "suspension"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                    : r.type === "warning"
                    ? "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                    : "bg-gray-50 text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400 border border-gray-100 dark:border-zinc-700"
                }`}>
                  {typeLabels[r.type] ?? r.type}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{r.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 dark:text-zinc-500">
                <span>{r.date.toLocaleDateString("es-ES")}</span>
                {r.isResolved && <span className="text-gray-900 dark:text-white/90 font-medium">Resuelto</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}