"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Modal from "@/components/Modal"
import Select from "@/components/Select"
import { motion } from "framer-motion"

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
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Registra una incidencia de un estudiante</p>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm sa-surface p-4"
            style={{ color: "#ef4444" }}
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Curso</label>
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
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Estudiante *</label>
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
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Tipo *</label>
            <Select
              value={type}
              onChange={setType}
              options={disciplineTypes}
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="sa-input w-full"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Fecha *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="sa-input w-full"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={close} className="sa-btn sa-btn-ghost flex-1 text-sm py-2.5">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="sa-btn sa-btn-primary flex-1 text-sm py-2.5"
            >
              {submitting ? "Guardando..." : "Guardar Registro"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
