import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"
import { getIcon } from "@/components/premium/iconRegistry"

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
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Docente / Tareas</p>
          <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Tareas</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{homework.length} publicadas</p>
        </div>
        <Link
          href="/dashboard/teacher/tareas/nueva"
          className="sa-btn sa-btn-primary text-sm"
        >
          + Nueva Tarea
        </Link>
      </header>

      {homework.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            {getIcon("assignment", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No hay tareas publicadas.</p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>Las tareas que publiques para tus estudiantes aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {homework.map((h: { id: number; title: string; description: string | null; dueDate: Date; course: { name: string }; grade: { name: string } | null; section: { name: string } | null }) => (
            <div key={h.id} className="sa-surface">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-semibold" style={{ color: "var(--foreground)" }}>{h.title}</p>
                <span className="sa-chip shrink-0" style={{ color: "var(--muted-foreground)", background: "var(--surface-3)" }}>
                  Vence {h.dueDate.toLocaleDateString("es-ES")}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {h.course.name} — {h.grade?.name ?? "—"} / {h.section?.name ?? "—"}
              </p>
              {h.description && (
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{h.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
