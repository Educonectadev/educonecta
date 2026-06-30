"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import Select from "@/components/Select"
import DataTable from "@/components/DataTable"

interface CourseTeacher {
  id: number
  teacher: { id: number; user: { name: string }; speciality?: string | null }
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

interface Course {
  id: number
  name: string
  code: string | null
  description: string | null
  teachers: CourseTeacher[]
  scheduleCount?: number
}

interface TeacherOpt { id: number; user: { name: string }; speciality?: string | null }
interface Grade { id: number; name: string }
interface Section { id: number; name: string; gradeId: number }

interface CourseForm {
  name: string
  code: string
  description: string
  initialTeacherId: string
  initialGradeId: string
  initialSectionId: string
}

const emptyCourseForm: CourseForm = {
  name: "", code: "", description: "",
  initialTeacherId: "", initialGradeId: "", initialSectionId: "",
}

function generateCode(name: string): string {
  const norm = name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
  const words = norm.split(/\s+/).filter(Boolean)
  let base = ""
  if (words.length === 1) {
    base = words[0].substring(0, 4)
  } else {
    base = words.slice(0, 3).map((w) => w.charAt(0)).join("") + (words[0].length > 1 ? words[0].charAt(1) : "")
  }
  return base.replace(/[^A-Z0-9]/g, "").substring(0, 6) || "CUR"
}

export default function CursosList({
  courses,
  teachers,
  grades,
  sections,
}: {
  courses: Course[]
  teachers: TeacherOpt[]
  grades: Grade[]
  sections: Section[]
}) {
  const router = useRouter()

  const [editing, setEditing] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState<Course | null>(null)
  const [assigning, setAssigning] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<CourseForm>({ ...emptyCourseForm })
  const [assignForm, setAssignForm] = useState({ teacherId: "", gradeId: "", sectionId: "" })
  const [autoCode, setAutoCode] = useState(true)

  const nameError = useMemo(() => {
    if (!form.name.trim()) return null
    const dup = courses.find(
      (c) => c.name.trim().toLowerCase() === form.name.trim().toLowerCase() && (!editing || c.id !== editing.id),
    )
    return dup ? "Ya existe un curso con ese nombre" : null
  }, [form.name, courses, editing])

  const codeError = useMemo(() => {
    if (!form.code.trim()) return null
    const dup = courses.find(
      (c) => c.code && c.code.trim().toLowerCase() === form.code.trim().toLowerCase() && (!editing || c.id !== editing.id),
    )
    return dup ? "Ya existe un curso con ese código" : null
  }, [form.code, courses, editing])

  const filteredSectionsForCourse = useMemo(() => {
    if (!form.initialGradeId) return []
    return sections.filter((s) => String(s.gradeId) === form.initialGradeId)
  }, [form.initialGradeId, sections])

  const filteredSectionsForAssign = useMemo(() => {
    if (!assignForm.gradeId) return []
    return sections.filter((s) => String(s.gradeId) === assignForm.gradeId)
  }, [assignForm.gradeId, sections])

  function openCreate() {
    setShowCreate(true)
    setEditing(null)
    setForm({ ...emptyCourseForm })
    setAutoCode(true)
  }

  function openEdit(c: Course) {
    setEditing(c)
    setForm({
      name: c.name,
      code: c.code ?? "",
      description: c.description ?? "",
      initialTeacherId: "",
      initialGradeId: "",
      initialSectionId: "",
    })
    setAutoCode(false)
    setShowCreate(false)
  }

  const onNameChange = useCallback((val: string) => {
    setForm((prev) => {
      const next: CourseForm = { ...prev, name: val }
      if (autoCode) {
        next.code = val.trim() ? generateCode(val) : ""
      }
      return next
    })
  }, [autoCode])

  function onAssign(course: Course) {
    setAssigning(course)
    setAssignForm({ teacherId: "", gradeId: "", sectionId: "" })
  }

  function closeAssign() {
    setAssigning(null)
    setAssignForm({ teacherId: "", gradeId: "", sectionId: "" })
  }

  async function handleSave() {
    if (!editing) return
    if (!form.name.trim()) { toast.danger("El nombre es requerido"); return }
    if (nameError || codeError) return

    setLoading(true)
    const res = await fetch(`/api/admin/courses/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        code: form.code.trim() || null,
        description: form.description.trim() || null,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.danger(data.error || "Error al guardar")
      return
    }
    setEditing(null)
    router.refresh()
  }

  async function handleCreate() {
    if (!form.name.trim()) { toast.danger("El nombre es requerido"); return }
    if (form.name.trim().length < 2) { toast.danger("El nombre es muy corto"); return }
    if (nameError) { toast.danger(nameError); return }
    if (codeError) { toast.danger(codeError); return }
    if (form.code.trim() && form.code.trim().length < 2) { toast.danger("Código inválido"); return }

    setLoading(true)
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        code: form.code.trim() || null,
        description: form.description.trim() || null,
        initialAssignment:
          form.initialTeacherId
            ? {
                teacherId: Number(form.initialTeacherId),
                gradeId: form.initialGradeId ? Number(form.initialGradeId) : null,
                sectionId: form.initialSectionId ? Number(form.initialSectionId) : null,
              }
            : null,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.danger(data.error || "Error al crear curso")
      return
    }
    setShowCreate(false)
    setForm({ ...emptyCourseForm })
    router.refresh()
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    const res = await fetch(`/api/admin/courses/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.danger(data.error || "Error al eliminar")
      return
    }
    setDeleting(null)
    router.refresh()
  }

  async function handleAssign() {
    if (!assigning || !assignForm.teacherId) return
    setLoading(true)
    const res = await fetch("/api/admin/course-teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: assigning.id,
        teacherId: Number(assignForm.teacherId),
        gradeId: assignForm.gradeId ? Number(assignForm.gradeId) : null,
        sectionId: assignForm.sectionId ? Number(assignForm.sectionId) : null,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.danger(data.error || "Error al asignar")
      return
    }
    setAssignForm({ teacherId: "", gradeId: "", sectionId: "" })
    router.refresh()
  }

  async function handleRemoveAssignment(ctId: number) {
    const res = await fetch("/api/admin/course-teachers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ctId }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.danger(data.error || "Error al quitar")
      return
    }
    router.refresh()
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <p className="sa-eyebrow">Oferta académica</p>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Cursos</h1>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{courses.length} cursos registrados · {teachers.length} profesores disponibles</p>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={openCreate} className="sa-btn sa-btn-primary">
            + Nuevo Curso
          </motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}>
        <DataTable
          data={courses}
          emptyMessage="No hay cursos registrados."
          onEdit={openEdit}
          onDelete={(c) => setDeleting(c)}
          columns={[
            {
              key: "name",
              label: "Curso",
              sortable: true,
              render: (c) => (
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.name}</p>
                  {c.code && <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Código: {c.code}</p>}
                </div>
              ),
            },
            {
              key: "description",
              label: "Descripción",
              sortable: false,
              render: (c) => c.description ? <span className="text-sm line-clamp-1" style={{ color: "var(--foreground)" }}>{c.description}</span> : <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>—</span>,
            },
            {
              key: "scheduleCount",
              label: "Horarios",
              sortable: false,
              render: (c) => (
                <span className="sa-chip">
                  {c.scheduleCount ?? 0}
                </span>
              ),
            },
            {
              key: "teachers",
              label: "Profesores",
              sortable: false,
              render: (c) => (
                <div className="flex items-center gap-2">
                  {c.teachers.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.teachers.slice(0, 2).map((ct) => (
                        <span key={ct.id} className="sa-chip" style={{ color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 14%, transparent)", borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}>
                          {ct.teacher.user.name}
                          {(ct.grade || ct.section) && ` (${ct.grade?.name || ""}${ct.grade && ct.section ? " / " : ""}${ct.section?.name || ""})`}
                        </span>
                      ))}
                      {c.teachers.length > 2 && (
                        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>+{c.teachers.length - 2}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin asignar</span>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onAssign(c) }}
                    className="text-xs ml-1" style={{ color: "var(--accent)" }}
                  >
                    Asignar
                  </motion.button>
                </div>
              ),
            },
          ]}
        />
      </motion.div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Curso" size="lg" scroll="inside">
        <div className="space-y-5">
          <div>
            <p className="sa-eyebrow mb-3">Información del Curso</p>
            <div className="space-y-3">
              <div>
                <label className="block sa-eyebrow mb-1.5">Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => onNameChange(e.target.value)}
                  className={`sa-input w-full ${nameError ? "border-red-400" : ""}`}
                  placeholder="Ej. Matemática"
                  style={nameError ? { borderColor: "#f87171" } : {}}
                />
                {nameError && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{nameError}</p>}
              </div>
              <div>
                <label className="block sa-eyebrow mb-1.5">Código</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <input
                    value={form.code}
                    onChange={(e) => { setForm({ ...form, code: e.target.value }); setAutoCode(false) }}
                    className={`sa-input w-full sm:flex-1 ${codeError ? "border-red-400" : ""}`}
                    placeholder="MAT"
                    style={codeError ? { borderColor: "#f87171" } : {}}
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    role="switch"
                    aria-checked={autoCode}
                    onClick={() => {
                      const next = !autoCode
                      setAutoCode(next)
                      if (next && form.name.trim()) {
                        setForm({ ...form, code: generateCode(form.name) })
                      }
                    }}
                    className={"sa-chip text-xs cursor-pointer shrink-0 " + (autoCode ? "sa-accent sa-accent-border" : "")}
                    style={autoCode ? { background: "var(--accent)", color: "var(--background)", borderColor: "var(--accent)" } : {}}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`relative inline-block w-8 h-[18px] rounded-full transition-colors duration-200 ${autoCode ? "opacity-70" : ""}`}
                        style={{ background: autoCode ? "rgba(255,255,255,0.3)" : "var(--surface-border)" }}
                      >
                        <span
                          className={`absolute top-[2px] size-3.5 rounded-full bg-white shadow transition-all duration-200 ${autoCode ? "left-[16px]" : "left-[2px]"}`}
                        />
                      </span>
                      <span>Auto</span>
                    </span>
                  </motion.button>
                </div>
                {codeError && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{codeError}</p>}
              </div>
              <div>
                <label className="block sa-eyebrow mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="sa-input w-full"
                  rows={2}
                  placeholder="Breve descripción del curso (opcional)"
                  maxLength={255}
                />
              </div>
            </div>
          </div>

          <div>
            <p className="sa-eyebrow mb-3">Asignar Profesor (opcional)</p>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Si asignas un profesor ahora, podrá dictar este curso inmediatamente.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block sa-eyebrow mb-1.5">Profesor</label>
                <Select
                  value={form.initialTeacherId}
                  onChange={(val) => setForm({ ...form, initialTeacherId: val })}
                  options={teachers.map(t => ({ value: String(t.id), label: t.user.name + (t.speciality ? ` — ${t.speciality}` : "") }))}
                  placeholder="Seleccionar..."
                />
              </div>
              <div>
                <label className="block sa-eyebrow mb-1.5">Grado</label>
                <Select
                  value={form.initialGradeId}
                  onChange={(val) => setForm({ ...form, initialGradeId: val, initialSectionId: "" })}
                  options={grades.map(g => ({ value: String(g.id), label: g.name }))}
                  placeholder="Todos"
                />
              </div>
              <div className="col-span-2">
                <label className="block sa-eyebrow mb-1.5">Sección</label>
                <Select
                  key={`create-sec-${form.initialGradeId}`}
                  value={form.initialSectionId}
                  onChange={(val) => setForm({ ...form, initialSectionId: val })}
                  options={filteredSectionsForCourse.map(s => ({ value: String(s.id), label: s.name }))}
                  placeholder={form.initialGradeId ? "Todas" : "Primero selecciona grado"}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(false)} className="sa-btn sa-btn-ghost flex-1">Cancelar</motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            disabled={loading || !form.name.trim() || !!nameError || !!codeError}
            className="sa-btn sa-btn-primary flex-1"
          >
            {loading ? "Creando..." : "Crear Curso"}
          </motion.button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Curso" size="md" scroll="inside">
        <div className="space-y-4">
          <div>
            <label className="block sa-eyebrow mb-1.5">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`sa-input w-full ${nameError ? "border-red-400" : ""}`}
              style={nameError ? { borderColor: "#f87171" } : {}}
            />
            {nameError && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{nameError}</p>}
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Código</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className={`sa-input w-full ${codeError ? "border-red-400" : ""}`}
              style={codeError ? { borderColor: "#f87171" } : {}}
            />
            {codeError && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{codeError}</p>}
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="sa-input w-full"
              rows={3}
              maxLength={255}
            />
          </div>
          {editing && editing.teachers.length > 0 && (
            <div>
              <label className="block sa-eyebrow mb-2">Profesores actualmente asignados</label>
              <div className="space-y-1.5">
                {editing.teachers.map((ct) => (
                  <div key={ct.id} className="text-xs flex items-center justify-between px-3 py-2 rounded-[var(--radius-tile)]" style={{ background: "var(--surface-2)" }}>
                    <span style={{ color: "var(--foreground)" }}>
                      {ct.teacher.user.name}
                      {(ct.grade || ct.section) && ` (${ct.grade?.name ?? ""}${ct.grade && ct.section ? " / " : ""}${ct.section?.name ?? ""})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-8">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditing(null)} className="sa-btn sa-btn-ghost flex-1">Cancelar</motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={loading || !form.name.trim() || !!nameError || !!codeError}
            className="sa-btn sa-btn-primary flex-1"
          >
            {loading ? "Guardando..." : "Guardar"}
          </motion.button>
        </div>
      </Modal>

      <Modal open={!!assigning} onClose={closeAssign} title="Asignar Profesor" size="md" scroll="inside">
        <p className="text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>Curso: <strong style={{ color: "var(--foreground)" }}>{assigning?.name}</strong></p>
        {assigning && assigning.scheduleCount && assigning.scheduleCount > 0 && (
          <p className="text-xs mb-4" style={{ color: "#d97706" }}>⚠ Este curso tiene {assigning.scheduleCount} horario(s) creado(s)</p>
        )}

        {assigning && assigning.teachers.length > 0 && (
          <div className="mb-4">
            <p className="sa-eyebrow mb-2">Asignados actualmente</p>
            <div className="space-y-1.5">
              {assigning.teachers.map((ct) => (
                <div key={ct.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-[var(--radius-tile)]" style={{ background: "var(--surface-2)" }}>
                  <span style={{ color: "var(--foreground)" }}>
                    {ct.teacher.user.name} {ct.grade ? `(${ct.grade.name}${ct.section ? ` / ${ct.section.name}` : ""})` : "(Todos los grados)"}
                  </span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRemoveAssignment(ct.id)} className="text-xs" style={{ color: "#ef4444" }}>Quitar</motion.button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 space-y-4" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <div>
            <label className="block sa-eyebrow mb-1.5">Profesor *</label>
            <Select
              value={assignForm.teacherId}
              onChange={(val) => setAssignForm({ ...assignForm, teacherId: val })}
              options={teachers.filter((t) => assigning && !assigning.teachers.some((ct) => ct.teacher.id === t.id)).map(t => ({ value: String(t.id), label: t.user.name + (t.speciality ? ` — ${t.speciality}` : "") }))}
              placeholder={teachers.filter((t) => assigning && !assigning.teachers.some((ct) => ct.teacher.id === t.id)).length === 0 ? "Todos asignados" : "Seleccionar..."}
            />
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Grado</label>
            <Select
              value={assignForm.gradeId}
              onChange={(val) => setAssignForm({ ...assignForm, gradeId: val, sectionId: "" })}
              options={grades.map(g => ({ value: String(g.id), label: g.name }))}
              placeholder="Todos los grados"
            />
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Sección</label>
            <Select
              key={`assign-sec-${assignForm.gradeId}`}
              value={assignForm.sectionId}
              onChange={(val) => setAssignForm({ ...assignForm, sectionId: val })}
              options={filteredSectionsForAssign.map(s => ({ value: String(s.id), label: s.name }))}
              placeholder={assignForm.gradeId ? "Todas las secciones" : "Primero selecciona grado"}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <motion.button whileTap={{ scale: 0.97 }} onClick={closeAssign} className="sa-btn sa-btn-ghost flex-1">Cerrar</motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAssign}
            disabled={loading || !assignForm.teacherId}
            className="sa-btn sa-btn-primary flex-1"
          >
            {loading ? "Asignando..." : "Asignar"}
          </motion.button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar curso" size="sm">
        <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
          Se eliminará <strong style={{ color: "var(--foreground)" }}>{deleting?.name}</strong>.
        </p>
        {deleting && deleting.scheduleCount && deleting.scheduleCount > 0 && (
          <p className="text-xs text-center mt-2" style={{ color: "#d97706" }}>
            ⚠ Este curso tiene {deleting.scheduleCount} horario(s) que también se eliminarán.
          </p>
        )}
        {deleting && deleting.teachers.length > 0 && (
          <p className="text-xs text-center mt-2" style={{ color: "#d97706" }}>
            ⚠ Tiene {deleting.teachers.length} asignación(es) de profesor que se eliminarán.
          </p>
        )}
        <p className="text-xs text-center mt-2" style={{ color: "var(--muted-foreground)" }}>Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 mt-8">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setDeleting(null)} className="sa-btn sa-btn-ghost flex-1">Cancelar</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete} disabled={loading} className="sa-btn flex-1" style={{ background: "#ef4444", color: "white", border: "1px solid #ef4444" }}>
            {loading ? "Eliminando..." : "Eliminar"}
          </motion.button>
        </div>
      </Modal>
    </>
  )
}
