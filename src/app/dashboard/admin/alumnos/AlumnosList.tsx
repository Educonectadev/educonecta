"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import Select from "@/components/Select"
import DataTable from "@/components/DataTable"

interface Student {
  id: number
  firstName: string
  lastName: string
  documentId: string
  email: string | null
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

interface Grade { id: number; name: string }
interface Section { id: number; name: string }

export default function AlumnosList({
  students,
  grades,
  sections,
}: {
  students: Student[]
  grades: Grade[]
  sections: Section[]
}) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; tempPassword: string; name: string } | null>(null)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentId: "",
    email: "",
    phone: "",
    gradeId: "",
    sectionId: "",
    createAccount: false,
  })

  function resetForm() {
    setForm({ firstName: "", lastName: "", documentId: "", email: "", phone: "", gradeId: "", sectionId: "", createAccount: false })
  }

  function openEdit(s: Student) {
    setEditing(s)
    setForm({
      firstName: s.firstName,
      lastName: s.lastName,
      documentId: s.documentId,
      email: s.email ?? "",
      phone: "",
      gradeId: s.grade?.id?.toString() ?? "",
      sectionId: s.section?.id?.toString() ?? "",
      createAccount: false,
    })
  }

  async function handleCreate() {
    if (!form.email.trim() && form.createAccount) {
      toast.danger("Para crear cuenta necesitas el email del alumno.")
      return
    }
    setLoading(true)
    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        documentId: form.documentId,
        email: form.email || null,
        gradeId: form.gradeId ? Number(form.gradeId) : null,
        sectionId: form.sectionId ? Number(form.sectionId) : null,
        createAccount: form.createAccount,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (res.ok) {
      setShowCreate(false)
      if (data?.tempPassword) {
        setCreatedCredentials({
          email: form.email,
          tempPassword: data.tempPassword,
          name: `${form.firstName} ${form.lastName}`,
        })
      } else {
        setCreatedCredentials(null)
      }
      resetForm()
      router.refresh()
    } else {
      toast.danger(data.error || "Error al registrar alumno")
    }
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    const res = await fetch(`/api/admin/students/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        documentId: form.documentId,
        email: form.email || null,
        gradeId: form.gradeId ? Number(form.gradeId) : null,
        sectionId: form.sectionId ? Number(form.sectionId) : null,
      }),
    })
    setLoading(false)
    if (res.ok) {
      setEditing(null)
      router.refresh()
    } else {
      const data = await res.json()
      toast.danger(data.error || "Error al actualizar alumno")
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    const res = await fetch(`/api/admin/students/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    if (res.ok) {
      setDeleting(null)
      router.refresh()
    } else {
      toast.danger("Error al eliminar alumno")
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <p className="sa-eyebrow">Gestión académica</p>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Alumnos</h1>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowCreate(true); resetForm() }} className="sa-btn sa-btn-primary">
            + Registrar Alumno
          </motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}>
        <DataTable
          data={students}
          emptyMessage="No hay alumnos registrados."
          onEdit={openEdit}
          onDelete={(s) => setDeleting(s)}
          columns={[
            {
              key: "name",
              label: "Alumno",
              sortable: true,
              render: (s) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "var(--surface-3)", color: "var(--muted-foreground)" }}>
                    {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{s.firstName} {s.lastName}</p>
                    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{s.email || "—"}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "documentId",
              label: "Documento",
              sortable: true,
            },
            {
              key: "grade",
              label: "Grado / Sección",
              render: (s) => (
                <div className="flex gap-1.5 flex-wrap">
                  {s.grade && <span className="sa-chip">{s.grade.name}</span>}
                  {s.section && <span className="sa-chip">Sec. {s.section.name}</span>}
                </div>
              ),
            },
          ]}
        />
      </motion.div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Alumno" size="md" scroll="inside">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5">Nombre</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="sa-input w-full" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Apellido</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="sa-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5">Documento</label>
              <input value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} className="sa-input w-full" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="sa-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5">Grado</label>
              <Select value={form.gradeId} onChange={(val) => setForm({...form, gradeId: val})} options={grades.map(g => ({value: String(g.id), label: g.name}))} placeholder="Sin grado" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Sección</label>
              <Select value={form.sectionId} onChange={(val) => setForm({...form, sectionId: val})} options={sections.map(s => ({value: String(s.id), label: s.name}))} placeholder="Sin sección" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.createAccount}
              onChange={(e) => setForm({ ...form, createAccount: e.target.checked })}
              className="size-4"
            />
            <span className="text-xs" style={{ color: "var(--foreground)" }}>
              Crear cuenta de acceso para que el alumno entre a su portal.
            </span>
          </label>
          {form.createAccount && !form.email.trim() && (
            <p className="text-[11px]" style={{ color: "#d97706" }}>
              Ingresa el email del alumno para crear la cuenta.
            </p>
          )}
        </div>
        <div className="flex gap-3 mt-8">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(false)} className="sa-btn sa-btn-ghost flex-1">Cancelar</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={loading || !form.firstName || !form.lastName || !form.documentId} className="sa-btn sa-btn-primary flex-1">
            {loading ? "Guardando..." : "Registrar"}
          </motion.button>
        </div>
      </Modal>

      <Modal open={!!createdCredentials} onClose={() => setCreatedCredentials(null)} title="Cuenta creada" size="md">
        {createdCredentials && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 text-sm" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)", color: "var(--accent)" }}>
              <p className="font-semibold">Cuenta creada para {createdCredentials.name}</p>
              <p className="mt-2 text-xs" style={{ opacity: 0.8 }}>
                Entrega estas credenciales al alumno. Le recomendamos cambiar la contraseña al primer ingreso desde su portal.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="sa-eyebrow">Email</p>
                <p className="text-sm font-mono" style={{ color: "var(--foreground)" }}>{createdCredentials.email}</p>
              </div>
              <div>
                <p className="sa-eyebrow">Contraseña temporal</p>
                <p className="text-sm font-mono select-all inline-block px-4 py-2 rounded-[var(--radius-tile)]" style={{ color: "var(--foreground)", background: "var(--surface-3)" }}>{createdCredentials.tempPassword}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setCreatedCredentials(null)}
              className="sa-btn w-full" style={{ background: "var(--accent)", color: "var(--background)", border: "1px solid var(--accent)" }}
            >
              Entendido
            </motion.button>
          </div>
        )}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Alumno" size="md" scroll="inside">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5">Nombre</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="sa-input w-full" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Apellido</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="sa-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5">Documento</label>
              <input value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} className="sa-input w-full" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="sa-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5">Grado</label>
              <Select value={form.gradeId} onChange={(val) => setForm({...form, gradeId: val})} options={grades.map(g => ({value: String(g.id), label: g.name}))} placeholder="Sin grado" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Sección</label>
              <Select value={form.sectionId} onChange={(val) => setForm({...form, sectionId: val})} options={sections.map(s => ({value: String(s.id), label: s.name}))} placeholder="Sin sección" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditing(null)} className="sa-btn sa-btn-ghost flex-1">Cancelar</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={loading} className="sa-btn sa-btn-primary flex-1">
            {loading ? "Guardando..." : "Guardar"}
          </motion.button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar alumno" size="sm">
        <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>Se eliminará {deleting?.firstName} {deleting?.lastName}. Esta acción no se puede deshacer.</p>
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
