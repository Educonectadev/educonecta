import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"

export default async function TareasPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const data = await query<any[]>(
    "SELECT h.*, c.id as c_id, c.name as c_name, g.id as g_id, g.name as g_name, sec.id as sec_id, sec.name as sec_name FROM Homework h LEFT JOIN Course c ON c.id = h.courseId LEFT JOIN Grade g ON g.id = h.gradeId LEFT JOIN Section sec ON sec.id = h.sectionId WHERE h.teacherId = ? ORDER BY h.createdAt DESC",
    [teacherId]
  )

  const homework = data.map((h) => ({
    id: h.id,
    title: h.title,
    description: h.description,
    dueDate: h.dueDate,
    createdAt: h.createdAt,
    course: { id: h.c_id, name: h.c_name },
    grade: h.g_id ? { id: h.g_id, name: h.g_name } : null,
    section: h.sec_id ? { id: h.sec_id, name: h.sec_name } : null,
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Tareas</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{homework.length} publicadas</p>
        </div>
        <Link
          href="/dashboard/teacher/tareas/nueva"
          className="btn-primary rounded-[30px] px-6 py-2.5 text-sm font-medium text-center"
        >
          + Nueva Tarea
        </Link>
      </div>

      {homework.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-12 text-center text-gray-400 dark:text-zinc-500 text-sm">
          No hay tareas publicadas.
        </div>
      ) : (
        <div className="grid gap-3">
          {homework.map((h: { id: number; title: string; description: string | null; dueDate: Date; course: { name: string }; grade: { name: string } | null; section: { name: string } | null }) => (
            <div key={h.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-black/20 transition-all duration-200">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-semibold text-gray-900 dark:text-white/90">{h.title}</p>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400 border border-gray-100 dark:border-zinc-700 shrink-0">
                  Vence {h.dueDate.toLocaleDateString("es-ES")}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                {h.course.name} — {h.grade?.name ?? "—"} / {h.section?.name ?? "—"}
              </p>
              {h.description && (
                <p className="text-sm mt-3 text-gray-500 dark:text-zinc-400 leading-relaxed">{h.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}