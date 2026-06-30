import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"
import { getIcon } from "@/components/premium/iconRegistry"

export default async function ComunicadosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const data = await query<any[]>(
    "SELECT comm.*, u.name as authorName FROM Communication comm LEFT JOIN User u ON u.id = comm.authorId WHERE comm.teacherId = ? ORDER BY comm.createdAt DESC LIMIT 50",
    [teacherId]
  )

  const communications = data.map((c) => ({
    id: c.id,
    title: c.title,
    content: c.content,
    priority: c.priority,
    type: c.type,
    createdAt: c.createdAt,
    author: { name: c.authorName },
  }))

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6" data-tour="announcements">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Docente / Comunicados</p>
          <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Comunicados</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{communications.length} comunicados</p>
        </div>
        <Link
          href="/dashboard/teacher/comunicados/nuevo"
          className="sa-btn sa-btn-primary text-sm"
        >
          + Nuevo Comunicado
        </Link>
      </header>

      {communications.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            {getIcon("bell", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No hay comunicados.</p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>Los comunicados que recibas o publiques aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {communications.map((c: { id: number; title: string; content: string; priority: string; type: string; createdAt: Date; author: { name: string } }) => (
            <div key={c.id} className="sa-surface">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-semibold" style={{ color: "var(--foreground)" }}>{c.title}</p>
                <div className="flex gap-2 shrink-0">
                  <span
                    className="sa-chip"
                    style={
                      c.priority === "high"
                        ? { color: "var(--foreground)", background: "var(--surface-3)" }
                        : { color: "var(--muted-foreground)", background: "var(--surface-3)" }
                    }
                  >
                    {c.priority === "high" ? "Importante" : "Normal"}
                  </span>
                  <span className="sa-chip" style={{ color: "var(--muted-foreground)", background: "var(--surface-3)" }}>
                    {c.type === "general" ? "General" : "Importante"}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{c.content}</p>
              <p className="text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
                {c.author.name} — {new Date(c.createdAt).toLocaleDateString("es-ES")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
