"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

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

export default function RegistrarCalificacionesPage() {
  const router = useRouter()

  const [courses, setCourses] = useState<CourseTeacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courseId, setCourseId] = useState("")
  const [evaluationName, setEvaluationName] = useState("")
  const [evaluationDate, setEvaluationDate] = useState("")
  const [grades, setGrades] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/teacher/courses")
      .then((r) => r.json())
      .then(setCourses)
  }, [])

  useEffect(() => {
    if (!courseId) return
    const ct = courses.find((c) => c.courseId === Number(courseId))
    if (!ct) return
    const params = new URLSearchParams()
    if (ct.gradeId) params.set("gradeId", String(ct.gradeId))
    if (ct.sectionId) params.set("sectionId", String(ct.sectionId))
    fetch(`/api/teacher/courses/students?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setStudents(data)
        const init: Record<number, string> = {}
        data.forEach((s: Student) => { init[s.id] = "" })
        setGrades(init)
      })
  }, [courseId, courses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !evaluationName) {
      setError("Completa los campos obligatorios.")
      return
    }
    setSubmitting(true)
    setError("")

    const records = Object.entries(grades)
      .filter(([, grade]) => grade !== "")
      .map(([studentId, grade]) => ({
        studentId: Number(studentId),
        grade: Number(grade),
      }))

    if (records.length === 0) {
      setError("Ingresa al menos una nota.")
      setSubmitting(false)
      return
    }

    const res = await fetch("/api/teacher/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: Number(courseId),
        evaluationName,
        evaluationDate: evaluationDate ? new Date(evaluationDate).toISOString() : null,
        records,
      }),
    })

    const result = await res.json()
    setSubmitting(false)
    if (result.success) {
      router.push("/dashboard/teacher/calificaciones")
    } else {
      setError("Error al registrar calificaciones.")
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Registrar Calificaciones</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Ingresa las notas de tus estudiantes</p>
        </div>
        <Link
          href="/dashboard/teacher/calificaciones"
          className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancelar
        </Link>
      </div>

      {error && (
        <p className="text-sm border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Curso *</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            required
          >
            <option value="">Seleccionar curso</option>
            {courses.map((ct) => (
              <option key={ct.id} value={ct.courseId}>
                {ct.course.name} — {ct.grade?.name ?? ""} / {ct.section?.name ?? ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Nombre de la Evaluación *</label>
          <input
            type="text"
            value={evaluationName}
            onChange={(e) => setEvaluationName(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            placeholder="Ej: Examen Parcial 1"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Fecha</label>
          <input
            type="date"
            value={evaluationDate}
            onChange={(e) => setEvaluationDate(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
          />
        </div>

        {students.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-3">Notas por estudiante</p>
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-zinc-400 shrink-0">
                        {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white/90 truncate">
                        {s.firstName} {s.lastName}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={20}
                      value={grades[s.id] ?? ""}
                      onChange={(e) =>
                        setGrades((prev) => ({ ...prev, [s.id]: e.target.value }))
                      }
                      className="w-24 rounded-[30px] border border-gray-200 dark:border-zinc-800 px-3 py-1.5 text-sm bg-white dark:bg-black text-gray-900 dark:text-white text-center focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
                      placeholder="0-20"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary rounded-[30px] px-8 py-3 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Guardar Calificaciones"}
        </button>
      </form>
    </div>
  )
}