"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"

interface Grade { id: number; name: string }
interface Section { id: number; name: string; gradeId: number }
interface Course { id: number; name: string }

export default function NuevaTareaPage() {
  const router = useRouter()

  const [grades, setGrades] = useState<Grade[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [courseId, setCourseId] = useState("")
  const [gradeId, setGradeId] = useState("")
  const [sectionId, setSectionId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/teacher/grades-sections").then((r) => r.json()),
      fetch("/api/teacher/courses").then((r) => r.json()),
    ]).then(([gsData, coursesData]) => {
      setGrades(gsData.grades ?? [])
      setSections(gsData.sections ?? [])
      const unique: Record<number, Course> = {}
      for (const ct of coursesData) {
        if (ct.course && !unique[ct.course.id]) {
          unique[ct.course.id] = { id: ct.course.id, name: ct.course.name }
        }
      }
      setCourses(Object.values(unique))
    })
  }, [])

  const filteredSections = useMemo(() => {
    if (!gradeId) return []
    return sections.filter((s) => s.gradeId === Number(gradeId))
  }, [gradeId, sections])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !dueDate || !courseId) {
      setError("Título, curso y fecha son obligatorios.")
      return
    }
    setSubmitting(true)
    setError("")

    const res = await fetch("/api/teacher/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        dueDate: new Date(dueDate).toISOString(),
        courseId: Number(courseId),
        gradeId: gradeId ? Number(gradeId) : null,
        sectionId: sectionId ? Number(sectionId) : null,
      }),
    })

    const result = await res.json()
    setSubmitting(false)
    if (result.success) {
      router.push("/dashboard/teacher/tareas")
    } else {
      setError("Error al crear la tarea.")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight dark:text-white">Nueva Tarea</h1>
        <Link
          href="/dashboard/teacher/tareas"
          className="text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          Cancelar
        </Link>
      </div>

      {error && (
        <p className="mb-6 text-sm border border-gray-100 dark:border-zinc-800 rounded-[30px] p-4 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1.5">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 dark:border-zinc-800 rounded-[30px] px-5 py-3 text-sm bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1.5">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 dark:border-zinc-800 rounded-[30px] px-5 py-3 text-sm bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1.5">Curso *</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full border border-gray-200 dark:border-zinc-800 rounded-[30px] px-5 py-3 text-sm bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            required
          >
            <option value="">Seleccionar curso</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1.5">Grado</label>
            <select
              value={gradeId}
              onChange={(e) => { setGradeId(e.target.value); setSectionId("") }}
              className="w-full border border-gray-200 dark:border-zinc-800 rounded-[30px] px-5 py-3 text-sm bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            >
              <option value="">Todos los grados</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1.5">Sección</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full border border-gray-200 dark:border-zinc-800 rounded-[30px] px-5 py-3 text-sm bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            >
              <option value="">Todas las secciones</option>
              {filteredSections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1.5">Fecha de Entrega *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-200 dark:border-zinc-800 rounded-[30px] px-5 py-3 text-sm bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary px-8 py-3 rounded-[25px] text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Publicar Tarea"}
        </button>
      </form>
    </div>
  )
}
