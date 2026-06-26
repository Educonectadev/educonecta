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
  const [form, setForm] = useState({ firstName: "", lastName: "", documentId: "", email: "", phone: "", gradeId: "", sectionId: "" })

  function resetForm() { setForm({ firstName: "", lastName: "", documentId: "", email: "", phone: "", gradeId: "", sectionId: "" }) }

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
    })
  }

  async function handleCreate() {
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
      }),
    })
    setLoading(false)
    if (res.ok) {
      setShowCreate(false)
      resetForm()
      router.refresh()
    } else {
      const data = await res.json()
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Alumnos</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] btn-primary px-6 py-2.5 text-sm font-medium text-center">
          + Registrar Alumno
        </button>
      </div>

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
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                  {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{s.firstName} {s.lastName}</p>
                  <p className="text-[11px] text-gray-400">{s.email || "—"}</p>
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
              <div className="flex gap-1.5">
                {s.grade && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{s.grade.name}</span>}
                {s.section && <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">Sec. {s.section.name}</span>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Alumno" size="md" scroll="inside">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Apellido</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Documento</label>
              <input value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Grado</label>
              <Select value={form.gradeId} onChange={(val) => setForm({...form, gradeId: val})} options={grades.map(g => ({value: String(g.id), label: g.name}))} placeholder="Sin grado" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sección</label>
              <Select value={form.sectionId} onChange={(val) => setForm({...form, sectionId: val})} options={sections.map(s => ({value: String(s.id), label: s.name}))} placeholder="Sin sección" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleCreate} disabled={loading || !form.firstName || !form.lastName || !form.documentId} className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Alumno" size="md" scroll="inside">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Apellido</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Documento</label>
              <input value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Grado</label>
              <Select value={form.gradeId} onChange={(val) => setForm({...form, gradeId: val})} options={grades.map(g => ({value: String(g.id), label: g.name}))} placeholder="Sin grado" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sección</label>
              <Select value={form.sectionId} onChange={(val) => setForm({...form, sectionId: val})} options={sections.map(s => ({value: String(s.id), label: s.name}))} placeholder="Sin sección" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar alumno" size="sm">
        <p className="text-sm text-gray-500 text-center">Se eliminará {deleting?.firstName} {deleting?.lastName}. Esta acción no se puede deshacer.</p>
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
