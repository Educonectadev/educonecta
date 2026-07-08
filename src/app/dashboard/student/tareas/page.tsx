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
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header>
        <p className="sa-eyebrow" style={{ color: "#8b5cf6" }}>Académico</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mis tareas</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {pendientes.length} pendientes · {vencidas.length} vencidas
        </p>
      </header>

      {tareas.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>
          <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Sin tareas</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No tienes tareas asignadas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tareas.map((t) => {
            const overdue = new Date(t.dueDate) < ahora
            return (
              <div key={t.id} className="sa-surface p-5 md:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold font-display" style={{ color: "var(--foreground)" }}>{t.title}</h3>
                    {overdue && (
                      <span className="sa-chip" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.12)" }}>Vencida</span>
                    )}
                  </div>
                  {t.description && (
                    <p className="mt-1 text-sm line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.description}</p>
                  )}
                  <p className="mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>{t.courseName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Vence</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
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
