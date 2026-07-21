"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Table } from "@heroui/react"
import Select from "@/components/Select"
import { motion } from "framer-motion"
import { getIcon } from "@/components/premium/iconRegistry"

interface Student {
  id: number
  firstName: string
  lastName: string
}

interface CourseTeacher {
  id: number
  courseId: number
  gradeId: number | null
  sectionId: number | null
  course: { id: number; name: string }
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

type Status = "PRESENT" | "ABSENT" | "LATE"

const statusOptions: { value: Status; label: string; emoji: string; active: string; idle: string }[] = [
  { value: "PRESENT", label: "Presente", emoji: "🟢", active: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700", idle: "border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500" },
  { value: "ABSENT", label: "Ausente", emoji: "🔴", active: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700", idle: "border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500" },
  { value: "LATE", label: "Tardanza", emoji: "🟡", active: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700", idle: "border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500" },
]

function formatDate(d: Date) {
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function TomarAsistenciaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<CourseTeacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [status, setStatus] = useState<Record<number, Status>>({})
  const [minutesLate, setMinutesLate] = useState<Record<number, number>>({})
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const courseId = searchParams.get("courseId")
  const gradeId = searchParams.get("gradeId")
  const sectionId = searchParams.get("sectionId")

  const selected = useMemo(
    () => courses.find((c) => String(c.courseId) === courseId && String(c.gradeId ?? "") === (gradeId ?? "") && String(c.sectionId ?? "") === (sectionId ?? "")),
    [courses, courseId, gradeId, sectionId],
  )

  useEffect(() => {
    fetch("/api/teacher/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data)
      })
  }, [])

  useEffect(() => {
    setStudents([])
    setStatus({})
    setMinutesLate({})
    setMessage(null)
    if (!gradeId || !sectionId) return
    setLoadingStudents(true)
    const params = new URLSearchParams({ gradeId, sectionId })
    fetch(`/api/teacher/courses/students?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setStudents(list)
        const initStatus: Record<number, Status> = {}
        const initMin: Record<number, number> = {}
        list.forEach((s: Student) => {
          initStatus[s.id] = "PRESENT"
          initMin[s.id] = 0
        })
        setStatus(initStatus)
        setMinutesLate(initMin)
      })
      .catch(() => {
        setStudents([])
      })
      .finally(() => setLoadingStudents(false))
  }, [gradeId, sectionId])

  function onCourseChange(value: string) {
    const ct = courses.find((c) => c.courseId === Number(value))
    if (!ct) return
    const params = new URLSearchParams({
      courseId: String(ct.courseId),
      gradeId: String(ct.gradeId ?? ""),
      sectionId: String(ct.sectionId ?? ""),
    })
    router.replace(`/dashboard/teacher/asistencia/tomar?${params}`)
  }

  function setStatusFor(studentId: number, value: Status) {
    setStatus((prev) => ({ ...prev, [studentId]: value }))
    if (value !== "LATE") {
      setMinutesLate((prev) => ({ ...prev, [studentId]: 0 }))
    } else if ((minutesLate[studentId] ?? 0) === 0) {
      setMinutesLate((prev) => ({ ...prev, [studentId]: 5 }))
    }
  }

  function markAllPresent() {
    const next: Record<number, Status> = {}
    students.forEach((s) => { next[s.id] = "PRESENT" })
    setStatus(next)
    setMinutesLate({})
  }

  async function handleSubmit() {
    if (!selected || students.length === 0) return
    setSubmitting(true)
    setMessage(null)
    const records = students.map((s) => ({
      studentId: s.id,
      status: status[s.id] ?? "ABSENT",
      minutesLate: status[s.id] === "LATE" ? Math.max(1, Number(minutesLate[s.id] ?? 0)) : 0,
    }))
    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selected.courseId,
          gradeId: selected.gradeId,
          sectionId: selected.sectionId,
          date: new Date().toISOString(),
          records,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setMessage({ type: "ok", text: `Asistencia guardada: ${json.count ?? records.length} registros.` })
      } else {
        setMessage({ type: "err", text: json.message || json.error || "Error al guardar." })
      }
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Error de red." })
    } finally {
      setSubmitting(false)
    }
  }

  const counts = useMemo(() => {
    const c = { PRESENT: 0, ABSENT: 0, LATE: 0 }
    Object.values(status).forEach((v) => { c[v]++ })
    return c
  }, [status])

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6 max-w-4xl mx-auto">
      <header>
        <Link href="/dashboard/teacher/asistencia" className="text-xs hover:underline" style={{ color: "var(--muted-foreground)" }}>
          ← Volver a Asistencia
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Tomar asistencia</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {selected ? (
            <>
              <span className="font-medium" style={{ color: "var(--foreground)" }}>{selected.course.name}</span>
              {" — "}
              {selected.grade?.name ?? "—"} {selected.section?.name ?? ""}
              {" · "}
              Fecha: {formatDate(new Date())}
            </>
          ) : (
            "Selecciona un curso para comenzar."
          )}
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        className="sa-surface p-4 space-y-3"
      >
        <div>
          <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Curso</label>
          <Select
            value={courseId ?? ""}
            onChange={onCourseChange}
            options={[
              { value: "", label: "Selecciona un curso..." },
              ...courses.map((ct) => ({
                value: String(ct.courseId),
                label: `${ct.course.name} — ${ct.grade?.name ?? ""} / ${ct.section?.name ?? ""}`,
              })),
            ]}
            placeholder="Selecciona un curso..."
          />
        </div>

        {selected && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={markAllPresent}
              disabled={students.length === 0}
              className="sa-btn sa-btn-primary text-xs"
            >
              ✓ Marcar todos presentes
            </button>
            <div className="flex items-center gap-3 text-xs ml-auto" style={{ color: "var(--muted-foreground)" }}>
              <span><span className="font-semibold" style={{ color: "var(--accent)" }}>{counts.PRESENT}</span> presentes</span>
              <span><span className="font-semibold" style={{ color: "#ef4444" }}>{counts.ABSENT}</span> ausentes</span>
              <span><span className="font-semibold" style={{ color: "#d97706" }}>{counts.LATE}</span> tardanzas</span>
            </div>
          </div>
        )}
      </motion.div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm rounded-2xl p-4 border"
          style={message.type === "ok" ? { background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)", borderColor: "var(--surface-border)" } : { background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", borderColor: "var(--surface-border)" }}
        >
          {message.text}
        </motion.p>
      )}

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          className="sa-surface overflow-hidden"
        >
          {loadingStudents ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--muted-foreground)" }}>Cargando estudiantes…</p>
          ) : students.length === 0 ? (
            <div className="sa-surface py-14 md:py-16 text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
                {getIcon("school", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Este curso no tiene estudiantes matriculados.</p>
              <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>
                Verifica que el grado y sección tengan alumnos activos en la base de datos.
              </p>
            </div>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content className="min-w-[600px]">
                  <Table.Header>
                    <Table.Column isRowHeader>Alumno</Table.Column>
                    <Table.Column>Estado</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {students.map((s) => {
                      const current = status[s.id] ?? "PRESENT"
                      return (
                        <Table.Row key={s.id}>
                          <Table.Cell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full text-[11px] font-medium flex items-center justify-center shrink-0" style={{ background: "var(--surface-3)", color: "var(--muted-foreground)" }}>
                                {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                              </div>
                              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                                {s.lastName}, {s.firstName}
                              </span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex flex-wrap items-center gap-2">
                              {statusOptions.map((opt) => {
                                const isActive = current === opt.value
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setStatusFor(s.id, opt.value)}
                                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                                      isActive ? opt.active : `bg-transparent ${opt.idle} hover:bg-gray-50 dark:hover:bg-zinc-800/50`
                                    }`}
                                    aria-pressed={isActive}
                                  >
                                    <span aria-hidden>{isActive ? opt.emoji : "⚪"}</span>
                                    <span>{opt.label}</span>
                                  </button>
                                )
                              })}
                              {current === "LATE" && (
                                <div className="flex items-center gap-1.5 ml-2">
                                  <input
                                    type="number"
                                    min={1}
                                    value={minutesLate[s.id] ?? 5}
                                    onChange={(e) => setMinutesLate((prev) => ({ ...prev, [s.id]: Number(e.target.value) }))}
                                    className="sa-input w-16 text-xs text-center"
                                    style={{ color: "var(--foreground)", background: "var(--surface)" }}
                                  />
                                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>min tarde</span>
                                </div>
                              )}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          )}
        </motion.div>
      )}

      {selected && students.length > 0 && (
        <div className="flex gap-3 sticky bottom-3">
          <Link
            href="/dashboard/teacher/asistencia"
            className="sa-btn sa-btn-ghost flex-1 text-sm py-2.5 text-center"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="sa-btn sa-btn-primary flex-1 text-sm py-2.5 disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar asistencia"}
          </button>
        </div>
      )}
    </div>
  )
}
