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

const disciplineTypes = [
  { value: "attention_call", label: "Llamado de Atención" },
  { value: "warning", label: "Amonestación" },
  { value: "suspension", label: "Suspensión" },
]

export default function NuevoDisciplinaPage() {
  const router = useRouter()

  const [courses, setCourses] = useState<CourseTeacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [studentId, setStudentId] = useState("")
  const [type, setType] = useState("attention_call")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/teacher/courses")
      .then((r) => r.json())
      .then(setCourses)
  }, [])

  useEffect(() => {
    if (!selectedCourse) return
    const ct = courses.find((c) => c.courseId === Number(selectedCourse))
    if (!ct) return
    const params = new URLSearchParams()
    if (ct.gradeId) params.set("gradeId", String(ct.gradeId))
    if (ct.sectionId) params.set("sectionId", String(ct.sectionId))
    fetch(`/api/teacher/courses/students?${params}`)
      .then((r) => r.json())
      .then(setStudents)
  }, [selectedCourse, courses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !description) {
      setError("Completa los campos obligatorios.")
      return
    }
    setSubmitting(true)
    setError("")

    const res = await fetch("/api/teacher/discipline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: Number(studentId),
        type,
        description,
        date: new Date(date).toISOString(),
      }),
    })

    const result = await res.json()
    setSubmitting(false)
    if (result.success) {
      router.push("/dashboard/teacher/disciplina")
    } else {
      setError("Error al crear el registro.")
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Nuevo Registro Disciplinario</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Registra una incidencia de un estudiante</p>
        </div>
        <Link
          href="/dashboard/teacher/disciplina"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Curso</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Estudiante *</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            required
          >
            <option value="">Seleccionar estudiante</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Tipo *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
          >
            {disciplineTypes.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Descripción *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-[25px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Fecha *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary rounded-[30px] px-8 py-3 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Guardar Registro"}
        </button>
      </form>
    </div>
  )
}