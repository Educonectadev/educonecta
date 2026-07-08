"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
  grade: { id: number; name: string; shift?: string } | null
  section: { id: number; name: string } | null
  shift?: string | null
}

interface Grade { id: number; name: string; shift?: string }
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
    shift: "",
    createAccount: false,
  })

  function resetForm() {
    setForm({ firstName: "", lastName: "", documentId: "", email: "", phone: "", gradeId: "", sectionId: "", shift: "", createAccount: false })
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
      shift: s.shift ?? "",
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
        shift: form.shift || null,
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
        shift: form.shift || null,
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
    <div className="space-y-4 md:space-y-6 pt-3 md:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Alumnos</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] sa-btn sa-btn-primary px-6 py-2.5 text-sm font-medium text-center">
          + Registrar Alumno
        </button>
      </div>

      <DataTable
        data={students}
        emptyMessage="No hay alumnos registrados."
        onEdit={openEdit}
        onDelete={(s) => setDeleting(s)}
        detailModal={(s) => (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface-3)] flex items-center justify-center text-lg font-bold text-[var(--foreground)] shrink-0">
                {s.firstName.charAt(0)}{s.lastName.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--foreground)]">{s.firstName} {s.lastName}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{s.email || "Sin email"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--surface-2)] rounded-2xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Documento</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{s.documentId}</p>
              </div>
              <div className="bg-[var(--surface-2)] rounded-2xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Grado</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{s.grade?.name || "—"}</p>
              </div>
              <div className="bg-[var(--surface-2)] rounded-2xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Sección</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{s.section?.name || "—"}</p>
              </div>
              <div className="bg-[var(--surface-2)] rounded-2xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Turno</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{s.shift || s.grade?.shift || "—"}</p>
              </div>
            </div>
          </div>
        )}
        columns={[
          {
            key: "name",
            label: "Alumno",
            sortable: true,
            render: (s) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-xs font-medium text-[var(--muted-foreground)] shrink-0">
                  {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{s.firstName} {s.lastName}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">{s.email || "—"}</p>
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
                {s.grade && <span className="badge-gray text-xs rounded-full px-2 py-0.5 border">{s.grade.name}</span>}
                {s.section && <span className="badge-gray text-xs rounded-full px-2 py-0.5 border">Sec. {s.section.name}</span>}
              </div>
            ),
          },
          {
            key: "shift",
            label: "Turno",
            render: (s) => (
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                {s.shift || s.grade?.shift || "—"}
              </span>
            ),
          },
        ]}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Alumno" size="md" scroll="inside">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Nombre</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-2xl border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Apellido</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-2xl border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Documento</label>
              <input value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} className="w-full rounded-2xl border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Grado</label>
              <Select value={form.gradeId} onChange={(val) => setForm({...form, gradeId: val})} options={grades.map(g => ({value: String(g.id), label: g.shift ? `${g.name} · ${g.shift}` : g.name}))} placeholder="Sin grado" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Sección</label>
              <Select value={form.sectionId} onChange={(val) => setForm({...form, sectionId: val})} options={sections.map(s => ({value: String(s.id), label: s.name}))} placeholder="Sin sección" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Turno</label>
            <Select value={form.shift} onChange={(val) => setForm({...form, shift: val})} options={[{value: "MAÑANA", label: "Mañana"}, {value: "TARDE", label: "Tarde"}]} placeholder="Sin turno (heredado del grado)" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.createAccount}
              onChange={(e) => setForm({ ...form, createAccount: e.target.checked })}
              className="size-4"
            />
            <span className="text-xs text-[var(--muted-foreground)]">
              Crear cuenta de acceso para que el alumno entre a su portal.
            </span>
          </label>
          {form.createAccount && !form.email.trim() && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              Ingresa el email del alumno para crear la cuenta.
            </p>
          )}
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-[var(--surface-border)] py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-all">Cancelar</button>
          <button onClick={handleCreate} disabled={loading || !form.firstName || !form.lastName || !form.documentId} className="flex-1 rounded-[30px] sa-btn sa-btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!createdCredentials} onClose={() => setCreatedCredentials(null)} title="Cuenta creada" size="md">
        {createdCredentials && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-sm">
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold">Cuenta creada para {createdCredentials.name}</p>
              <p className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                Entrega estas credenciales al alumno. Le recomendamos cambiar la contraseña al primer ingreso desde su portal.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">Email</p>
                <p className="text-sm font-mono text-[var(--foreground)]">{createdCredentials.email}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">Contraseña temporal</p>
                <p className="text-sm font-mono text-[var(--foreground)] select-all bg-[var(--surface-2)] border border-[var(--surface-border)] rounded-2xl px-4 py-2 inline-block">{createdCredentials.tempPassword}</p>
              </div>
            </div>
            <button
              onClick={() => setCreatedCredentials(null)}
              className="w-full rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 py-2.5 text-sm font-medium text-white"
            >
              Entendido
            </button>
          </div>
        )}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Alumno" size="md" scroll="inside">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Nombre</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-2xl border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Apellido</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-2xl border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Documento</label>
              <input value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} className="w-full rounded-2xl border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Grado</label>
              <Select value={form.gradeId} onChange={(val) => setForm({...form, gradeId: val})} options={grades.map(g => ({value: String(g.id), label: g.shift ? `${g.name} · ${g.shift}` : g.name}))} placeholder="Sin grado" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Sección</label>
              <Select value={form.sectionId} onChange={(val) => setForm({...form, sectionId: val})} options={sections.map(s => ({value: String(s.id), label: s.name}))} placeholder="Sin sección" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Turno</label>
            <Select value={form.shift} onChange={(val) => setForm({...form, shift: val})} options={[{value: "MAÑANA", label: "Mañana"}, {value: "TARDE", label: "Tarde"}]} placeholder="Sin turno (heredado del grado)" />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-[var(--surface-border)] py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] sa-btn sa-btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar alumno" size="sm">
        <p className="text-sm text-[var(--muted-foreground)] text-center">Se eliminará {deleting?.firstName} {deleting?.lastName}. Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setDeleting(null)} className="flex-1 rounded-[30px] border border-[var(--surface-border)] py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-all">Cancelar</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 rounded-[30px] bg-red-600 text-white py-2.5 text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50">
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </Modal>
    </div>
  )
}
