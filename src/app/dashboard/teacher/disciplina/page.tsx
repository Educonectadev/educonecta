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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight dark:text-white">Disciplina</h1>
        <Link
          href="/dashboard/teacher/disciplina/nuevo"
          className="btn-primary px-6 py-2.5 rounded-[30px] text-sm font-medium text-center"
        >
          + Nuevo Registro
        </Link>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-zinc-500">No hay registros disciplinarios.</p>
      ) : (
        <div className="grid gap-3">
          {records.map((r: { id: number; type: string; description: string; date: Date; isResolved: boolean; student: { firstName: string; lastName: string } }) => (
            <div key={r.id} className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-[25px] p-6">
              <div className="flex items-center justify-between">
                <p className="font-medium dark:text-white">
                  {r.student.firstName} {r.student.lastName}
                </p>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-[30px] border ${
                    r.type === "suspension"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : r.type === "warning"
                      ? "border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400"
                      : "border-gray-100 dark:border-zinc-700 text-gray-500 dark:text-zinc-400"
                  }`}
                >
                  {typeLabels[r.type] ?? r.type}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">{r.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-zinc-500">
                <span>{r.date.toLocaleDateString("es-ES")}</span>
                {r.isResolved && <span className="text-emerald-600 dark:text-emerald-400 font-medium">Resuelto</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
