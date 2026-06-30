import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import { motion } from "framer-motion"

export default async function StudentAsistenciaPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) redirect("/login")

  const studentId = session.user.studentId
  const attendance = await query<any[]>(
    `SELECT a.id, a.date, a."isPresent", a.note
     FROM Attendance a
     WHERE a."studentId" = ?
     ORDER BY a.date DESC
     LIMIT 60`,
    [studentId]
  )

  const total = attendance.length
  const presentes = attendance.filter((a) => a.isPresent).length
  const faltas = total - presentes
  const pct = total > 0 ? Math.round((presentes / total) * 100) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5 md:space-y-6 pt-3 md:pt-6"
      data-tour="attendance"
    >
      <header>
        <p className="sa-eyebrow" style={{ color: "#8b5cf6" }}>Control</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mi asistencia</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Últimos 60 registros.</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Asistencia" value={pct !== null ? `${pct}%` : "—"} accent="#10b981" />
        <Stat label="Presentes" value={presentes} accent="#06b6d4" />
        <Stat label="Faltas" value={faltas} accent="#ef4444" />
      </div>

      {attendance.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Sin registros</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Aún no hay registros de asistencia.</p>
        </div>
      ) : (
        <div className="sa-surface overflow-hidden">
          <ul className="divide-y sa-divider">
            {attendance.map((a, idx) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.02, ease: [0.16, 1, 0.3, 1] }}
                className="p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {new Date(a.date).toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" })}
                  </p>
                  {a.note && <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.note}</p>}
                </div>
                {a.isPresent ? (
                  <span className="sa-chip" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.14)" }}>Presente</span>
                ) : (
                  <span className="sa-chip" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.12)" }}>Falta</span>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sa-tile"
    >
      <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      <p className="mt-2 sa-num text-2xl md:text-3xl" style={{ color: accent }}>{value}</p>
    </motion.div>
  )
}
