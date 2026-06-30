"use client"

import Link from "next/link"
import DataTable from "@/components/DataTable"
import { motion } from "framer-motion"
import { getIcon } from "@/components/premium/iconRegistry"

interface CourseTeacherRow {
  id: number
  courseId: number
  teacherId: number
  gradeId: number | null
  sectionId: number | null
  course: { id: number; name: string; code: string | null } | null
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

interface ScheduleRow {
  id: number
  courseId: number
  gradeId: number | null
  sectionId: number | null
  dayOfWeek: number
  startTime: string
  endTime: string
  classroom: string | null
}

interface HomeworkRow {
  id: number
  title: string
  courseId: number
  gradeId: number | null
  sectionId: number | null
  dueDate: string
  createdAt: string
}

const DAY_LABELS: Record<number, string> = {
  1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })
}

export interface TeacherCourseSummary {
  id: number
  courseId: number
  gradeId: number | null
  sectionId: number | null
  course: { id: number; name: string; code: string | null }
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
  studentCount: number
  scheduleCount: number
  homeworkCount: number
  schedules: { dayOfWeek: number; startTime: string; endTime: string; classroom: string | null }[]
  homework: { id: number; title: string; dueDate: string }[]
}

export default function TeacherCoursesClient({
  items,
  schedules,
  homework,
  studentCountByKey,
}: {
  items: CourseTeacherRow[]
  schedules: ScheduleRow[]
  homework: HomeworkRow[]
  studentCountByKey: Record<string, number>
}) {
  function studentCount(item: CourseTeacherRow): number {
    const key = `${item.gradeId ?? "x"}-${item.sectionId ?? "x"}`
    return studentCountByKey[key] ?? 0
  }

  const rows: TeacherCourseSummary[] = items.map((item) => {
    const sched = schedules.filter(
      (s) =>
        s.courseId === item.courseId &&
        (s.gradeId ?? null) === (item.gradeId ?? null) &&
        (s.sectionId ?? null) === (item.sectionId ?? null),
    )
    const hw = homework.filter(
      (h) =>
        h.courseId === item.courseId &&
        (h.gradeId ?? null) === (item.gradeId ?? null) &&
        (h.sectionId ?? null) === (item.sectionId ?? null),
    )
    return {
      id: item.id,
      courseId: item.courseId,
      gradeId: item.gradeId,
      sectionId: item.sectionId,
      course: item.course ?? { id: item.courseId, name: "—", code: null },
      grade: item.grade,
      section: item.section,
      studentCount: studentCount(item),
      scheduleCount: sched.length,
      homeworkCount: hw.length,
      schedules: sched.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: typeof s.startTime === "string" ? s.startTime.slice(0, 5) : s.startTime,
        endTime: typeof s.endTime === "string" ? s.endTime.slice(0, 5) : s.endTime,
        classroom: s.classroom,
      })),
      homework: hw.map((h) => ({ id: h.id, title: h.title, dueDate: h.dueDate })),
    }
  })

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link href="/dashboard/teacher" className="text-xs hover:underline" style={{ color: "var(--muted-foreground)" }}>
            ← Volver al panel
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mis Cursos</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            {rows.length} curso{rows.length === 1 ? "" : "s"} asignado{rows.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
      >
        <DataTable
          data={rows}
          emptyMessage="No tienes cursos asignados."
          columns={[
            {
              key: "course",
              label: "Curso",
              sortable: true,
              render: (r) => (
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{r.course.name}</p>
                  {r.course.code && <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Código: {r.course.code}</p>}
                </div>
              ),
            },
            {
              key: "grade",
              label: "Grado",
              sortable: false,
              render: (r) => <span className="text-sm" style={{ color: "var(--foreground)" }}>{r.grade?.name ?? "—"}</span>,
            },
            {
              key: "section",
              label: "Sección",
              sortable: false,
              render: (r) => <span className="text-sm" style={{ color: "var(--foreground)" }}>{r.section?.name ?? "—"}</span>,
            },
            {
              key: "students",
              label: "Estudiantes",
              sortable: false,
              render: (r) => (
                <span className="sa-chip text-[11px]" style={{ color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}>
                  {r.studentCount}
                </span>
              ),
            },
            {
              key: "scheduleCount",
              label: "Horarios",
              sortable: false,
              render: (r) => (
                <span className="sa-chip text-[11px]" style={{ color: "var(--muted-foreground)", background: "var(--surface-3)" }}>
                  {r.scheduleCount}
                </span>
              ),
            },
            {
              key: "homeworkCount",
              label: "Tareas",
              sortable: false,
              render: (r) => (
                <span className="sa-chip text-[11px]" style={{ color: "#d97706", background: "rgba(217, 119, 6, 0.14)" }}>
                  {r.homeworkCount}
                </span>
              ),
            },
            {
              key: "schedules",
              label: "Horario",
              sortable: false,
              render: (r) => (
                <div className="text-xs space-y-0.5 max-w-[220px]" style={{ color: "var(--foreground)" }}>
                  {r.schedules.length === 0 ? (
                    <span style={{ color: "var(--muted-foreground)" }}>—</span>
                  ) : (
                    r.schedules.slice(0, 2).map((s, i) => (
                      <p key={i} className="truncate">
                        {DAY_LABELS[s.dayOfWeek] ?? `Día ${s.dayOfWeek}`} {s.startTime}–{s.endTime}
                        {s.classroom ? ` · ${s.classroom}` : ""}
                      </p>
                    )).concat(
                      r.schedules.length > 2
                        ? [<p key="more" style={{ color: "var(--muted-foreground)" }}>+{r.schedules.length - 2} más</p>]
                        : [],
                    )
                  )}
                </div>
              ),
            },
          ]}
        />
      </motion.div>

      {rows.length > 0 && (
        <section className="space-y-4">
          <h2 className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Detalle por curso</h2>
          {rows.map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: idx * 0.025 }}
              className="sa-surface p-6 space-y-5"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold" style={{ color: "var(--foreground)" }}>{r.course.name}</h3>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {r.grade?.name ?? "—"} · {r.section?.name ?? "—"} · {r.studentCount} estudiante{r.studentCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/teacher/asistencia/tomar?courseId=${r.courseId}&gradeId=${r.gradeId ?? ""}&sectionId=${r.sectionId ?? ""}`}
                    className="sa-btn sa-btn-ghost text-xs px-4 py-2"
                  >
                    Tomar asistencia
                  </Link>
                  <Link
                    href={`/dashboard/teacher/calificaciones/registrar?courseId=${r.courseId}&gradeId=${r.gradeId ?? ""}&sectionId=${r.sectionId ?? ""}`}
                    className="sa-btn sa-btn-ghost text-xs px-4 py-2"
                  >
                    Registrar notas
                  </Link>
                </div>
              </header>

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="sa-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
                    Horario ({r.scheduleCount})
                  </h4>
                  {r.schedules.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin horario asignado.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {r.schedules.map((s, i) => (
                        <li key={i} className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: "var(--surface-2)" }}>
                          <span className="font-medium" style={{ color: "var(--foreground)" }}>
                            {DAY_LABELS[s.dayOfWeek] ?? `Día ${s.dayOfWeek}`}
                          </span>
                          <span style={{ color: "var(--muted-foreground)" }}>
                            {s.startTime} – {s.endTime}
                            {s.classroom ? ` · ${s.classroom}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="sa-eyebrow mb-3" style={{ color: "var(--muted-foreground)" }}>
                    Tareas ({r.homeworkCount})
                  </h4>
                  {r.homework.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No hay tareas registradas.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {r.homework.map((h) => (
                        <li key={h.id} className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: "var(--surface-2)" }}>
                          <span className="font-medium truncate pr-3" style={{ color: "var(--foreground)" }}>{h.title}</span>
                          <span className="text-xs shrink-0" style={{ color: "var(--muted-foreground)" }}>Vence {formatDate(h.dueDate)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      )}
    </div>
  )
}
