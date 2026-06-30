import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"
import { getIcon } from "@/components/premium/iconRegistry"

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
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="discipline">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Docente / Disciplina</p>
          <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Disciplina</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{records.length} registros</p>
        </div>
        <Link
          href="/dashboard/teacher/disciplina/nuevo"
          className="sa-btn sa-btn-primary text-sm"
        >
          + Nuevo Registro
        </Link>
      </header>

      {records.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            {getIcon("gavel", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No hay registros disciplinarios.</p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>Los registros disciplinarios aparecerán aquí cuando sean creados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r: { id: number; type: string; description: string; date: Date; isResolved: boolean; student: { firstName: string; lastName: string } }) => (
            <div key={r.id} className="sa-surface">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                  {r.student.firstName} {r.student.lastName}
                </p>
                <span
                  className="sa-chip shrink-0"
                  style={
                    r.type === "suspension"
                      ? { color: "var(--foreground)", background: "var(--surface-3)" }
                      : r.type === "warning"
                      ? { color: "#d97706", background: "rgba(217, 119, 6, 0.14)" }
                      : { color: "var(--muted-foreground)", background: "var(--surface-3)" }
                  }
                >
                  {typeLabels[r.type] ?? r.type}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{r.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <span>{r.date.toLocaleDateString("es-ES")}</span>
                {r.isResolved && <span className="font-medium" style={{ color: "var(--foreground)" }}>Resuelto</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
