"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface Props {
  fullName: string
  gradeName: string | null
  sectionName: string | null
  courseCount: number
  pendingHomeworkCount: number
  promedio: number | null
  asistenciaPct: number | null
  tareasPendientes: any[]
  communications: any[]
}

export default function StudentDashboardClient({
  fullName,
  gradeName,
  sectionName,
  courseCount,
  pendingHomeworkCount,
  promedio,
  asistenciaPct,
  tareasPendientes,
  communications,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5 md:space-y-6 pt-3 md:pt-6"
    >
      <header>
        <p className="sa-eyebrow" style={{ color: "#8b5cf6" }}>Bienvenido</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>{fullName}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {gradeName ?? "Sin grado"}{sectionName ? ` · Sección ${sectionName}` : ""}
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cursos" value={courseCount} accent="#8b5cf6" />
        <StatCard label="Tareas pendientes" value={pendingHomeworkCount} accent="#d97706" />
        <StatCard label="Promedio" value={promedio !== null ? promedio.toFixed(2) : "—"} accent="#10b981" />
        <StatCard label="Asistencia" value={asistenciaPct !== null ? `${asistenciaPct}%` : "—"} accent="#06b6d4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="sa-surface lg:col-span-2 p-5 md:p-6"
        >
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Próximas tareas</h2>
            <Link href="/dashboard/student/tareas" className="text-xs hover:underline" style={{ color: "#8b5cf6" }}>Ver todas →</Link>
          </header>
          {tareasPendientes.length === 0 ? (
            <div className="sa-surface py-14 md:py-16 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
              <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Sin tareas pendientes</p>
              <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>No tienes tareas pendientes.</p>
            </div>
          ) : (
            <ul className="divide-y sa-divider">
              {tareasPendientes.slice(0, 5).map((h: any) => (
                <li key={h.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{h.title}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{h.courseName}</p>
                  </div>
                  <span className="shrink-0 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(h.dueDate).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="sa-surface p-5 md:p-6"
        >
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Avisos</h2>
            <Link href="/dashboard/student/comunicados" className="text-xs hover:underline" style={{ color: "#8b5cf6" }}>Ver todos →</Link>
          </header>
          {(communications).length === 0 ? (
            <div className="sa-surface py-14 md:py-16 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                <svg className="size-6" style={{ color: "var(--muted-foreground)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>Sin avisos</p>
              <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Sin avisos recientes.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {communications.slice(0, 4).map((c: any, idx: number) => (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  className="text-sm"
                >
                  <p className="font-medium" style={{ color: "var(--foreground)" }}>{c.title}</p>
                  <p className="text-xs line-clamp-2 mt-0.5" style={{ color: "var(--muted-foreground)" }}>{c.content}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
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
