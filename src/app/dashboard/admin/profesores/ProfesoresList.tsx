"use client"

import { useState, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import Select from "@/components/Select"
import DataTable from "@/components/DataTable"

interface Teacher {
  id: number
  speciality: string | null
  documentId: string | null
  professionalTitle: string | null
  educationLevel: string | null
  hireDate: string | null
  contractType: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  assignedLevels: string[]
  user: { id: number; name: string; email: string; phone: string | null }
}

interface CourseOpt { id: number; name: string }
interface GradeOpt { id: number; name: string }
interface SectionOpt { id: number; name: string; gradeId: number }

interface Assignment {
  courseId: string
  gradeId: string
  sectionId: string
}

interface FormState {
  firstName: string
  lastName: string
  password: string
  phone: string
  speciality: string
  documentId: string
  professionalTitle: string
  educationLevel: string
  hireDate: string
  contractType: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  assignedLevels: string[]
  assignments: Assignment[]
}

const emptyAssignment = (): Assignment => ({ courseId: "", gradeId: "", sectionId: "" })

const emptyForm: FormState = {
  firstName: "", lastName: "", password: "", phone: "", speciality: "",
  documentId: "", professionalTitle: "", educationLevel: "", hireDate: "",
  contractType: "", address: "", emergencyContactName: "", emergencyContactPhone: "",
  assignedLevels: [],
  assignments: [emptyAssignment()],
}

const educationLevels = ["Bachiller", "Titulado", "Magíster", "Doctor"]
const contractTypes = ["Tiempo completo", "Medio tiempo", "Por horas", "CAS"]
const assignedLevelOptions = [
  { value: "INICIAL", label: "Inicial" },
  { value: "PRIMARIA", label: "Primaria" },
  { value: "SECUNDARIA", label: "Secundaria" },
] as const

function previewEmail(firstName: string, lastName: string) {
  if (!firstName || !lastName) return ""
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return `${norm(firstName)}.${norm(lastName)}@colegio.edu.pe`
}

const TeacherFormFields = memo(function TeacherFormFields({
  form,
  setField,
  setAssignment,
  addAssignment,
  removeAssignment,
  courses,
  grades,
  sections,
  passwordRequired,
}: {
  form: FormState
  setField: (field: keyof FormState, value: string | string[]) => void
  setAssignment: (idx: number, key: keyof Assignment, value: string) => void
  addAssignment: () => void
  removeAssignment: (idx: number) => void
  courses: CourseOpt[]
  grades: GradeOpt[]
  sections: SectionOpt[]
  passwordRequired: boolean
}) {
  const email = previewEmail(form.firstName, form.lastName)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Datos Personales</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nombres *</label>
            <input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Juan" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Apellidos *</label>
            <input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Pérez" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">DNI / CE</label>
            <input value={form.documentId} onChange={(e) => setField("documentId", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="12345678" maxLength={20} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
            <input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="987654321" maxLength={15} />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
          <input value={form.address} onChange={(e) => setField("address", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Av. Principal 123" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Datos Profesionales</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Título Profesional</label>
            <input value={form.professionalTitle} onChange={(e) => setField("professionalTitle", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Lic. en Educación" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Especialidad</label>
            <input value={form.speciality} onChange={(e) => setField("speciality", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Matemáticas" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nivel de Estudios</label>
            <Select value={form.educationLevel} onChange={(val) => setField("educationLevel", val)} options={educationLevels.map(l => ({value: l, label: l}))} placeholder="Seleccionar" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Contrato</label>
            <Select value={form.contractType} onChange={(val) => setField("contractType", val)} options={contractTypes.map(c => ({value: c, label: c}))} placeholder="Seleccionar" />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Contratación</label>
          <input type="date" value={form.hireDate} onChange={(e) => setField("hireDate", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Niveles Asignados</p>
        <p className="text-xs text-gray-400 mb-3">Selecciona los niveles educativos en los que el profesor dicta clases.</p>
        <div className="flex flex-wrap gap-2">
          {assignedLevelOptions.map((opt) => {
            const selected = form.assignedLevels.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const next = selected
                    ? form.assignedLevels.filter((v) => v !== opt.value)
                    : [...form.assignedLevels, opt.value]
                  setField("assignedLevels", next)
                }}
                className={
                  "rounded-full px-4 py-1.5 text-xs font-medium border transition-all " +
                  (selected
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-gray-200 text-gray-500 hover:border-emerald-300")
                }
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Contacto de Emergencia</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
            <input value={form.emergencyContactName} onChange={(e) => setField("emergencyContactName", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="María López" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
            <input type="tel" value={form.emergencyContactPhone} onChange={(e) => setField("emergencyContactPhone", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="987654321" maxLength={15} />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Asignación de Cursos (opcional)</p>
        <p className="text-xs text-gray-400 mb-3">Si lo asignas ahora, el profesor ya podrá dictar clases sin pasos adicionales.</p>
        {form.assignments.map((a, idx) => {
          const filteredSections = a.gradeId
            ? sections.filter((s) => String(s.gradeId) === a.gradeId)
            : []
          return (
            <div key={idx} className="border border-gray-100 rounded-[20px] p-3 mb-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Curso</label>
                  <Select
                    value={a.courseId}
                    onChange={(val) => setAssignment(idx, "courseId", val)}
                    options={courses.map(c => ({ value: String(c.id), label: c.name }))}
                    placeholder="Seleccionar..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Grado</label>
                  <Select
                    value={a.gradeId}
                    onChange={(val) => { setAssignment(idx, "gradeId", val); setAssignment(idx, "sectionId", "") }}
                    options={grades.map(g => ({ value: String(g.id), label: g.name }))}
                    placeholder="Todos"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sección</label>
                  <Select
                    key={`assign-sec-${idx}-${a.gradeId}`}
                    value={a.sectionId}
                    onChange={(val) => setAssignment(idx, "sectionId", val)}
                    options={filteredSections.map(sec => ({ value: String(sec.id), label: sec.name }))}
                    placeholder={a.gradeId ? "Todas" : "Primero selecciona grado"}
                  />
                </div>
              </div>
              {form.assignments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAssignment(idx)}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  Quitar asignación
                </button>
              )}
            </div>
          )
        })}
        <button
          type="button"
          onClick={addAssignment}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          + Agregar otro curso
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Acceso al Sistema</p>
        {email && (
          <div className="bg-gray-50 rounded-[20px] px-4 py-2.5 mb-3">
            <p className="text-[11px] text-gray-400">Email generado automáticamente:</p>
            <p className="text-sm font-medium text-gray-700">{email}</p>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{passwordRequired ? "Contraseña *" : "Nueva contraseña (dejar vacío para mantener)"}</label>
          <input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" minLength={6} />
        </div>
      </div>
    </div>
  )
})

export default function ProfesoresList({
  teachers,
  courses,
  grades,
  sections,
}: {
  teachers: Teacher[]
  courses: CourseOpt[]
  grades: GradeOpt[]
  sections: SectionOpt[]
}) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [deleting, setDeleting] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>({ ...emptyForm, assignments: [emptyAssignment()] })

  const validAssignments = useMemo(
    () => form.assignments.filter((a) => a.courseId),
    [form.assignments],
  )
  const uniqueAssignmentKeys = useMemo(() => {
    const seen = new Set<string>()
    let unique = true
    for (const a of validAssignments) {
      const key = `${a.courseId}|${a.gradeId}|${a.sectionId}`
      if (seen.has(key)) { unique = false; break }
      seen.add(key)
    }
    return unique
  }, [validAssignments])

  function resetForm() {
    setForm({ ...emptyForm, assignments: [emptyAssignment()] })
  }

  function openEdit(t: Teacher) {
    const parts = t.user.name.split(" ")
    setEditing(t)
    setForm({
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
      password: "",
      phone: t.user.phone ?? "",
      speciality: t.speciality ?? "",
      documentId: t.documentId ?? "",
      professionalTitle: t.professionalTitle ?? "",
      educationLevel: t.educationLevel ?? "",
      hireDate: t.hireDate ?? "",
      contractType: t.contractType ?? "",
      address: t.address ?? "",
      emergencyContactName: t.emergencyContactName ?? "",
      emergencyContactPhone: t.emergencyContactPhone ?? "",
      assignedLevels: Array.isArray(t.assignedLevels) ? t.assignedLevels : [],
      assignments: [emptyAssignment()],
    })
  }

  const setField = useCallback((field: keyof FormState, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value as any }))
  }, [])

  const setAssignment = useCallback((idx: number, key: keyof Assignment, value: string) => {
    setForm((prev) => {
      const next = [...prev.assignments]
      next[idx] = { ...next[idx], [key]: value }
      return { ...prev, assignments: next }
    })
  }, [])

  const addAssignment = useCallback(() => {
    setForm((prev) => ({ ...prev, assignments: [...prev.assignments, emptyAssignment()] }))
  }, [])

  const removeAssignment = useCallback((idx: number) => {
    setForm((prev) => ({
      ...prev,
      assignments: prev.assignments.length > 1
        ? prev.assignments.filter((_, i) => i !== idx)
        : prev.assignments,
    }))
  }, [])

  async function handleCreate() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.danger("Nombres y apellidos son requeridos")
      return
    }
    if (form.password.length < 6) {
      toast.danger("La contraseña debe tener al menos 6 caracteres")
      return
    }
    if (!uniqueAssignmentKeys) {
      toast.danger("Hay asignaciones duplicadas")
      return
    }
    setLoading(true)
    const payload = {
      ...form,
      assignments: validAssignments.map((a) => ({
        courseId: Number(a.courseId),
        gradeId: a.gradeId ? Number(a.gradeId) : null,
        sectionId: a.sectionId ? Number(a.sectionId) : null,
      })),
    }
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setShowCreate(false)
      resetForm()
      router.refresh()
      const assigned = Array.isArray(data?.assignments) ? data.assignments.length : 0
      if (assigned > 0) toast.success(`Profesor creado y ${assigned} curso(s) asignado(s)`)
    } else {
      const data = await res.json()
      toast.danger(data.error || "Error al registrar profesor")
    }
  }

  async function handleSave() {
    if (!editing) return
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.danger("Nombres y apellidos son requeridos")
      return
    }
    if (form.password && form.password.length < 6) {
      toast.danger("La contraseña debe tener al menos 6 caracteres")
      return
    }
    setLoading(true)
    const res = await fetch(`/api/admin/teachers/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, password: form.password || undefined }),
    })
    setLoading(false)
    if (res.ok) {
      setEditing(null)
      router.refresh()
    } else {
      const data = await res.json()
      toast.danger(data.error || "Error al actualizar profesor")
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    const res = await fetch(`/api/admin/teachers/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    if (res.ok) {
      setDeleting(null)
      router.refresh()
    } else {
      toast.danger("Error al eliminar profesor")
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Profesores</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] btn-primary px-6 py-2.5 text-sm font-medium text-center">+ Contratar Profesor</button>
      </div>

      <DataTable
        data={teachers}
        emptyMessage="No hay profesores registrados."
        onEdit={openEdit}
        onDelete={(t) => setDeleting(t)}
        columns={[
          {
            key: "name",
            label: "Profesor",
            sortable: true,
            render: (t) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-zinc-200 shrink-0">
                  {t.user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">{t.user.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">{t.user.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "speciality",
            label: "Especialidad",
            sortable: true,
            render: (t) => t.speciality ? <span className="badge-blue text-xs rounded-full px-2.5 py-0.5 border">{t.speciality}</span> : <span className="text-xs text-gray-400 dark:text-zinc-500">—</span>,
          },
          {
            key: "contractType",
            label: "Contrato",
            sortable: true,
            render: (t) => t.contractType ? <span className="badge-gray text-xs rounded-full px-2.5 py-0.5 border">{t.contractType}</span> : <span className="text-xs text-gray-400 dark:text-zinc-500">—</span>,
          },
          {
            key: "educationLevel",
            label: "Estudios",
            render: (t) => (t.educationLevel || t.professionalTitle) ? <span className="badge-amber text-xs rounded-full px-2.5 py-0.5 border">{t.educationLevel || t.professionalTitle}</span> : <span className="text-xs text-gray-400 dark:text-zinc-500">—</span>,
          },
          {
            key: "assignedLevels",
            label: "Niveles",
            render: (t) => t.assignedLevels && t.assignedLevels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {t.assignedLevels.map((lvl) => {
                  const badgeClass: Record<string, string> = {
                    INICIAL: "badge-pink",
                    PRIMARIA: "badge-emerald",
                    SECUNDARIA: "badge-indigo",
                  }
                  const label = lvl.charAt(0) + lvl.slice(1).toLowerCase()
                  return <span key={lvl} className={`text-xs rounded-full px-2.5 py-0.5 border ${badgeClass[lvl] ?? "badge-gray"}`}>{label}</span>
                })}
              </div>
            ) : <span className="text-xs text-gray-400 dark:text-zinc-500">—</span>,
          },
        ]}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Contratar Profesor" size="lg">
        <TeacherFormFields
          form={form}
          setField={setField}
          setAssignment={setAssignment}
          addAssignment={addAssignment}
          removeAssignment={removeAssignment}
          courses={courses}
          grades={grades}
          sections={sections}
          passwordRequired
        />
        <div className="flex gap-3 mt-8">
          <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleCreate} disabled={loading} className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : "Contratar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Profesor" size="lg">
        <TeacherFormFields
          form={form}
          setField={setField}
          setAssignment={setAssignment}
          addAssignment={addAssignment}
          removeAssignment={removeAssignment}
          courses={courses}
          grades={grades}
          sections={sections}
          passwordRequired={false}
        />
        <div className="flex gap-3 mt-8">
          <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar profesor" size="sm">
        <p className="text-sm text-gray-500 text-center">Se eliminará {deleting?.user?.name}. Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setDeleting(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 rounded-[30px] bg-red-600 text-white py-2.5 text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50">
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </Modal>
    </>
  )
}