import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"
import { getIcon } from "@/components/premium/iconRegistry"
import GradesTable from "./GradesTable"

export default async function CalificacionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const data = await query<any[]>(
    "SELECT gr.*, s.firstName as s_firstName, s.lastName as s_lastName, c.id as c_id, c.name as c_name FROM GradeRecord gr LEFT JOIN Student s ON s.id = gr.studentId LEFT JOIN Course c ON c.id = gr.courseId WHERE gr.teacherId = ? ORDER BY gr.createdAt DESC LIMIT 50",
    [teacherId]
  )

  const grades = data.map((g) => ({
    id: g.id,
    evaluationName: g.evaluationName,
    grade: g.grade,
    evaluationDate: g.evaluationDate,
    createdAt: g.createdAt,
    student: { firstName: g.s_firstName, lastName: g.s_lastName },
    course: { id: g.c_id, name: g.c_name },
  }))

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="grades">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Docente / Calificaciones</p>
          <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Calificaciones</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{grades.length} registradas</p>
        </div>
        <Link
          href="/dashboard/teacher/calificaciones/registrar"
          className="sa-btn sa-btn-primary text-sm"
        >
          + Registrar Notas
        </Link>
      </header>

      {grades.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            {getIcon("grade", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No hay calificaciones registradas.</p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>Las calificaciones aparecerán aquí cuando registres notas de tus estudiantes.</p>
        </div>
      ) : (
        <div className="sa-surface">
          <GradesTable grades={grades} />
        </div>
      )}
    </div>
  )
}
