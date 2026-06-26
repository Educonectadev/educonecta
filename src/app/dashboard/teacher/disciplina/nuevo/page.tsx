"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Modal from "@/components/Modal"
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

const disciplineTypes = [
  { value: "attention_call", label: "Llamado de Atención" },
  { value: "warning", label: "Amonestación" },
  { value: "suspension", label: "Suspensión" },
]

export default function NuevoDisciplinaPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)

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

  function close() {
    setOpen(false)
    router.push("/dashboard/teacher/disciplina")
  }

  async function handleSubmit(e: React.FormEvent) {
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
    <Modal open={open} onClose={close} title="Nuevo Registro Disciplinario" size="lg" scroll="inside">
      <div className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-zinc-500">Registra una incidencia de un estudiante</p>

        {error && (
          <p className="text-sm border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Curso</label>
            <Select
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={courses.map((ct) => ({
                value: String(ct.courseId),
                label: `${ct.course.name} — ${ct.grade?.name ?? ""} / ${ct.section?.name ?? ""}`,
              }))}
              placeholder="Seleccionar curso"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Estudiante *</label>
            <Select
              value={studentId}
              onChange={setStudentId}
              options={students.map((s) => ({
                value: String(s.id),
                label: `${s.firstName} ${s.lastName}`,
              }))}
              placeholder="Seleccionar estudiante"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Tipo *</label>
            <Select
              value={type}
              onChange={setType}
              options={disciplineTypes}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-[25px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
              rows={3}
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

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={close} className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium"
            >
              {submitting ? "Guardando..." : "Guardar Registro"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
