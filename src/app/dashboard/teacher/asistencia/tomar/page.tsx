"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Select from "@/components/Select"

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
    console.log("[TomarAsistencia] Cargando estudiantes:", { gradeId, sectionId, url: `/api/teacher/courses/students?${params}` })
    fetch(`/api/teacher/courses/students?${params}`)
      .then((r) => {
        console.log("[TomarAsistencia] Response status:", r.status)
        return r.json()
      })
      .then((data) => {
        console.log("[TomarAsistencia] Estudiantes encontrados:", Array.isArray(data) ? data.length : 0)
        console.log("[TomarAsistencia] Estudiantes:", data)
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
      .catch((err) => {
        console.error("[TomarAsistencia] Error cargando estudiantes:", err)
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
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <Link href="/dashboard/teacher/asistencia" className="text-xs text-gray-500 dark:text-zinc-400 hover:underline">
          ← Volver a Asistencia
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Tomar asistencia</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          {selected ? (
            <>
              <span className="font-medium text-gray-700 dark:text-zinc-200">{selected.course.name}</span>
              {" — "}
              {selected.grade?.name ?? "—"} {selected.section?.name ?? ""}
              {" · "}
              Fecha: {formatDate(new Date())}
            </>
          ) : (
            "Selecciona un curso para comenzar."
          )}
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Curso</label>
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
              className="rounded-[30px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-5 py-2 text-xs font-semibold transition-all shadow-sm disabled:shadow-none"
            >
              ✓ Marcar todos presentes
            </button>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400 ml-auto">
              <span><span className="font-semibold text-emerald-600">{counts.PRESENT}</span> presentes</span>
              <span><span className="font-semibold text-red-600">{counts.ABSENT}</span> ausentes</span>
              <span><span className="font-semibold text-amber-600">{counts.LATE}</span> tardanzas</span>
            </div>
          </div>
        )}
      </div>

      {message && (
        <p className={`text-sm rounded-2xl p-4 border ${message.type === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800" : "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800"}`}>
          {message.text}
        </p>
      )}

      {selected && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          {loadingStudents ? (
            <p className="text-sm text-center text-gray-500 dark:text-zinc-500 py-8">Cargando estudiantes…</p>
          ) : students.length === 0 ? (
            <div className="text-center py-10 px-4">
              <span className="material-icons text-4xl text-gray-300 dark:text-zinc-600 mb-2">school</span>
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Este curso no tiene estudiantes matriculados.</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                Verifica que el grado y sección tengan alumnos activos en la base de datos.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Alumno</th>
                  <th className="px-4 py-3 text-left font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const current = status[s.id] ?? "PRESENT"
                  return (
                    <tr key={s.id} className="border-t border-gray-100 dark:border-zinc-800">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-[11px] font-medium text-gray-500 dark:text-zinc-400 flex items-center justify-center shrink-0">
                            {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white/90">
                            {s.lastName}, {s.firstName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
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
                                className="w-16 rounded-[30px] border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-center bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none transition-all"
                              />
                              <span className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">min tarde</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selected && students.length > 0 && (
        <div className="flex gap-3 sticky bottom-3">
          <Link
            href="/dashboard/teacher/asistencia"
            className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-center text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar asistencia"}
          </button>
        </div>
      )}
    </div>
  )
}
