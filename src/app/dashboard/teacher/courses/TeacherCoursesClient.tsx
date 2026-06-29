"use client"

import Link from "next/link"
import DataTable from "@/components/DataTable"

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
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link href="/dashboard/teacher" className="text-xs text-gray-500 dark:text-zinc-400 hover:underline">
            ← Volver al panel
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mis Cursos</h1>
          <p className="text-xs text-gray-400 mt-1">
            {rows.length} curso{rows.length === 1 ? "" : "s"} asignado{rows.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

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
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{r.course.name}</p>
                {r.course.code && <p className="text-[11px] text-gray-400">Código: {r.course.code}</p>}
              </div>
            ),
          },
          {
            key: "grade",
            label: "Grado",
            sortable: false,
            render: (r) => <span className="text-sm text-gray-600 dark:text-zinc-300">{r.grade?.name ?? "—"}</span>,
          },
          {
            key: "section",
            label: "Sección",
            sortable: false,
            render: (r) => <span className="text-sm text-gray-600 dark:text-zinc-300">{r.section?.name ?? "—"}</span>,
          },
          {
            key: "students",
            label: "Estudiantes",
            sortable: false,
            render: (r) => (
              <span className="text-[11px] bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5">
                {r.studentCount}
              </span>
            ),
          },
          {
            key: "scheduleCount",
            label: "Horarios",
            sortable: false,
            render: (r) => (
              <span className="text-[11px] bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5">
                {r.scheduleCount}
              </span>
            ),
          },
          {
            key: "homeworkCount",
            label: "Tareas",
            sortable: false,
            render: (r) => (
              <span className="text-[11px] bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5">
                {r.homeworkCount}
              </span>
            ),
          },
          {
            key: "schedules",
            label: "Horario",
            sortable: false,
            render: (r) => (
              <div className="text-xs text-gray-500 dark:text-zinc-400 space-y-0.5 max-w-[220px]">
                {r.schedules.length === 0 ? (
                  <span className="text-gray-300">—</span>
                ) : (
                  r.schedules.slice(0, 2).map((s, i) => (
                    <p key={i} className="truncate">
                      {DAY_LABELS[s.dayOfWeek] ?? `Día ${s.dayOfWeek}`} {s.startTime}–{s.endTime}
                      {s.classroom ? ` · ${s.classroom}` : ""}
                    </p>
                  )).concat(
                    r.schedules.length > 2
                      ? [<p key="more" className="text-gray-400">+{r.schedules.length - 2} más</p>]
                      : [],
                  )
                )}
              </div>
            ),
          },
        ]}
      />

      {rows.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Detalle por curso</h2>
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white/90">{r.course.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {r.grade?.name ?? "—"} · {r.section?.name ?? "—"} · {r.studentCount} estudiante{r.studentCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/teacher/asistencia/tomar?courseId=${r.courseId}&gradeId=${r.gradeId ?? ""}&sectionId=${r.sectionId ?? ""}`}
                    className="rounded-[30px] border border-gray-200 dark:border-zinc-700 px-4 py-2 text-xs font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    Tomar asistencia
                  </Link>
                  <Link
                    href={`/dashboard/teacher/calificaciones/registrar?courseId=${r.courseId}&gradeId=${r.gradeId ?? ""}&sectionId=${r.sectionId ?? ""}`}
                    className="rounded-[30px] border border-gray-200 dark:border-zinc-700 px-4 py-2 text-xs font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    Registrar notas
                  </Link>
                </div>
              </header>

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-3">
                    Horario ({r.scheduleCount})
                  </h4>
                  {r.schedules.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-zinc-500">Sin horario asignado.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {r.schedules.map((s, i) => (
                        <li key={i} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-zinc-800/50 px-4 py-2.5">
                          <span className="font-medium text-gray-700 dark:text-zinc-200">
                            {DAY_LABELS[s.dayOfWeek] ?? `Día ${s.dayOfWeek}`}
                          </span>
                          <span className="text-gray-500 dark:text-zinc-400">
                            {s.startTime} – {s.endTime}
                            {s.classroom ? ` · ${s.classroom}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-3">
                    Tareas ({r.homeworkCount})
                  </h4>
                  {r.homework.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-zinc-500">No hay tareas registradas.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {r.homework.map((h) => (
                        <li key={h.id} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-zinc-800/50 px-4 py-2.5">
                          <span className="font-medium text-gray-700 dark:text-zinc-200 truncate pr-3">{h.title}</span>
                          <span className="text-xs text-gray-500 dark:text-zinc-400 shrink-0">Vence {formatDate(h.dueDate)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
