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

export default function RegistrarCalificacionesPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)

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

  function close() {
    setOpen(false)
    router.push("/dashboard/teacher/calificaciones")
  }

  async function handleSubmit(e: React.FormEvent) {
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
    <Modal open={open} onClose={close} title="Registrar Calificaciones" size="lg" scroll="inside">
      <div className="space-y-4">
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Ingresa las notas de tus estudiantes</p>

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
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Curso *</label>
            <Select
              value={courseId}
              onChange={setCourseId}
              options={courses.map((ct) => ({
                value: String(ct.courseId),
                label: `${ct.course.name} — ${ct.grade?.name ?? ""} / ${ct.section?.name ?? ""}`,
              }))}
              placeholder="Seleccionar curso"
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Nombre de la Evaluación *</label>
            <input
              type="text"
              value={evaluationName}
              onChange={(e) => setEvaluationName(e.target.value)}
              className="sa-input w-full"
              placeholder="Ej: Examen Parcial 1"
              required
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Fecha</label>
            <input
              type="date"
              value={evaluationDate}
              onChange={(e) => setEvaluationDate(e.target.value)}
              className="sa-input w-full"
            />
          </div>

          {students.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <p className="sa-eyebrow mb-2" style={{ color: "var(--muted-foreground)" }}>Notas por estudiante</p>
              <div className="sa-surface overflow-hidden max-h-64 overflow-y-auto scrollbar-hide">
                <div className="divide-y" style={{ borderColor: "var(--surface-border)" }}>
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors" style={{ borderColor: "var(--surface-border)" }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "var(--surface-3)", color: "var(--muted-foreground)" }}>
                          {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                        </div>
                        <span className="text-sm truncate" style={{ color: "var(--foreground)" }}>
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
                        className="sa-input w-24 text-sm text-center"
                        style={{ color: "var(--foreground)", background: "var(--surface)" }}
                        placeholder="0-20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={close} className="sa-btn sa-btn-ghost flex-1 text-sm py-2.5">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="sa-btn sa-btn-primary flex-1 text-sm py-2.5"
            >
              {submitting ? "Guardando..." : "Guardar Calificaciones"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
