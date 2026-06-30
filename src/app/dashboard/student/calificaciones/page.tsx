import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import { motion } from "framer-motion"

export default async function StudentCalificacionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) redirect("/login")

  const studentId = session.user.studentId
  const grades = await query<any[]>(
    `SELECT gr.id, gr."evaluationName", gr.grade, gr."evaluationDate",
            c.name AS "courseName"
     FROM "GradeRecord" gr
     JOIN Course c ON c.id = gr."courseId"
     WHERE gr."studentId" = ?
     ORDER BY gr."evaluationDate" DESC NULLS LAST, gr.id DESC`,
    [studentId]
  )

  const byCourse = new Map<string, { course: string; items: any[] }>()
  for (const g of grades) {
    if (!byCourse.has(g.courseName)) byCourse.set(g.courseName, { course: g.courseName, items: [] })
    byCourse.get(g.courseName)!.items.push(g)
  }

  const courses = Array.from(byCourse.values()).map((b) => {
    const items = b.items.filter((i) => i.grade != null)
    const promedio = items.length > 0 ? items.reduce((acc, i) => acc + Number(i.grade), 0) / items.length : null
    return { ...b, promedio }
  })

  const promedioGeneral = courses.filter((c) => c.promedio !== null).length > 0
    ? courses.filter((c) => c.promedio !== null).reduce((acc, c) => acc + (c.promedio ?? 0), 0) /
      courses.filter((c) => c.promedio !== null).length
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5 md:space-y-6 pt-3 md:pt-6"
      data-tour="grades"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="sa-eyebrow" style={{ color: "#8b5cf6" }}>Académico</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mis calificaciones</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
            {courses.length} cursos · Promedio general: <span className="font-semibold" style={{ color: "var(--foreground)" }}>{promedioGeneral !== null ? promedioGeneral.toFixed(2) : "—"}</span>
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Sin calificaciones</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Aún no tienes calificaciones registradas.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {courses.map((c, idx) => (
            <motion.section
              key={c.course}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="sa-surface p-5 md:p-6"
            >
              <header className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>{c.course}</h2>
                <span className="sa-chip" style={{ color: "#8b5cf6", background: "color-mix(in srgb, #8b5cf6 14%, transparent)" }}>
                  Prom. {c.promedio !== null ? c.promedio.toFixed(2) : "—"}
                </span>
              </header>
              <ul className="divide-y sa-divider">
                {c.items.map((i: any) => (
                  <li key={i.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate" style={{ color: "var(--foreground)" }}>{i.evaluationName}</p>
                      {i.evaluationDate && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{new Date(i.evaluationDate).toLocaleDateString("es-PE")}</p>
                      )}
                    </div>
                    <span className="shrink-0 font-semibold" style={{ color: Number(i.grade) >= 11 ? "#10b981" : "#ef4444" }}>
                      {Number(i.grade).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>
      )}
    </motion.div>
  )
}
