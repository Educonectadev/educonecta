import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"

export default async function StudentComunicadosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) redirect("/login")

  const items = await query<any[]>(
    `SELECT c.id, c.title, c.content, c.type, c.priority, c."createdAt",
            u.name AS "authorName"
     FROM Communication c
     LEFT JOIN "User" u ON u.id = c."authorId"
     WHERE c."institutionId" = ?
       AND (c."teacherId" IS NULL OR c."teacherId" IN (
         SELECT DISTINCT ct."teacherId" FROM "CourseTeacher" ct
         WHERE (ct."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
                OR ct."gradeId" IS NULL)
           AND (ct."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
                OR ct."sectionId" IS NULL)
       ))
     ORDER BY c."createdAt" DESC
     LIMIT 50`,
    [session.user.institutionId ?? 0, session.user.studentId, session.user.studentId]
  )

  const priorityTone = (p: string) => {
    if (p === "urgente" || p === "high") return { color: "#ef4444", background: "rgba(239, 68, 68, 0.12)" }
    if (p === "normal") return { color: "#06b6d4", background: "rgba(6, 182, 212, 0.12)" }
    return { color: "var(--muted-foreground)", background: "var(--surface-3)" }
  }

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="announcements">
      <header>
        <p className="sa-eyebrow" style={{ color: "#8b5cf6" }}>Comunicación</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Comunicados</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Avisos de tu institución y de tus docentes.</p>
      </header>

      {items.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Sin comunicados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Sin comunicados por ahora.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <article key={c.id} className="sa-surface p-5 md:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>{c.title}</h2>
                  <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {c.authorName ?? "Institución"} · {new Date(c.createdAt).toLocaleString("es-PE")}
                  </p>
                </div>
                <span className="sa-chip shrink-0" style={priorityTone(c.priority)}>
                  {c.priority ?? "normal"}
                </span>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap" style={{ color: "var(--foreground)" }}>{c.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
