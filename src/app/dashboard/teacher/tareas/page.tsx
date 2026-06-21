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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
        <Link
          href="/dashboard/teacher/tareas/nueva"
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-[30px] text-sm font-medium hover:bg-emerald-700 transition-all text-center"
        >
          + Nueva Tarea
        </Link>
      </div>

      {homework.length === 0 ? (
        <p className="text-sm text-gray-500">No hay tareas publicadas.</p>
      ) : (
        <div className="grid gap-3">
          {homework.map((h: { id: number; title: string; description: string | null; dueDate: Date; course: { name: string }; grade: { name: string } | null; section: { name: string } | null }) => (
            <div key={h.id} className="bg-gray-50 border border-gray-200 rounded-[25px] p-6">
              <p className="font-medium">{h.title}</p>
              <p className="text-sm text-gray-500 mt-1.5">
                {h.course.name} — {h.grade?.name ?? "—"} / {h.section?.name ?? "—"}
              </p>
              <p className="text-xs text-gray-300 mt-1.5">
                Vence: {h.dueDate.toLocaleDateString("es-ES")}
              </p>
              {h.description && (
                <p className="text-sm mt-3 text-gray-500 leading-relaxed">{h.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
