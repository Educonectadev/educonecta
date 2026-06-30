"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import Modal from "@/components/Modal"
import Select from "@/components/Select"
import { motion } from "framer-motion"

interface Grade { id: number; name: string }
interface Section { id: number; name: string; gradeId: number }
interface Course { id: number; name: string }

export default function NuevaTareaPage() {
  const router = useRouter()

  const [open, setOpen] = useState(true)
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

  function close() {
    setOpen(false)
    router.push("/dashboard/teacher/tareas")
  }

  async function handleSubmit(e: React.FormEvent) {
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
    <Modal open={open} onClose={close} title="Nueva Tarea" size="lg" scroll="inside">
      <div className="space-y-4">
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Publica una tarea para tus estudiantes</p>

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
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="sa-input w-full"
              required
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="sa-input w-full"
              rows={3}
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Curso *</label>
            <Select
              value={courseId}
              onChange={setCourseId}
              options={courses.map((c) => ({ value: String(c.id), label: c.name }))}
              placeholder="Seleccionar curso"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Grado</label>
              <Select
                value={gradeId}
                onChange={(value) => { setGradeId(value); setSectionId("") }}
                options={grades.map((g) => ({ value: String(g.id), label: g.name }))}
                placeholder="Todos los grados"
              />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Sección</label>
              <Select
                value={sectionId}
                onChange={setSectionId}
                options={filteredSections.map((s) => ({ value: String(s.id), label: s.name }))}
                placeholder="Todas las secciones"
              />
            </div>
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Fecha de Entrega *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
              {submitting ? "Guardando..." : "Publicar Tarea"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
