"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/Modal"

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
    await fetch("/api/admin/students", {
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
    setShowCreate(false)
    resetForm()
    router.refresh()
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    await fetch(`/api/admin/students/${editing.id}`, {
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
    setEditing(null)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    await fetch(`/api/admin/students/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    setDeleting(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Alumnos</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 text-center">
          + Registrar Alumno
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-[30px]">
        <table className="w-full text-sm">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Documento</th>
              <th className="px-6 py-4">Grado</th>
              <th className="px-6 py-4">Sección</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 md:divide-y-0">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No hay alumnos registrados.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="flex flex-col md:table-row border border-gray-200 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0">
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 font-medium">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Nombre</span>
                    <span>{s.firstName} {s.lastName}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Documento</span>
                    <span>{s.documentId}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Grado</span>
                    <span>{s.grade?.name ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Sección</span>
                    <span>{s.section?.name ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Email</span>
                    <span>{s.email ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Acciones</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="text-xs text-gray-500 hover:text-black transition-all border border-gray-200 rounded-[30px] px-3 py-1">Editar</button>
                      <button onClick={() => setDeleting(s)} className="text-xs text-red-500 hover:text-red-700 transition-all border border-red-200 rounded-[30px] px-3 py-1">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Alumno">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Apellido</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Documento</label>
            <input value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Grado</label>
            <select value={form.gradeId} onChange={(e) => setForm({ ...form, gradeId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all">
              <option value="">Sin grado</option>
              {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sección</label>
            <select value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all">
              <option value="">Sin sección</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleCreate} disabled={loading || !form.firstName || !form.lastName || !form.documentId} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
            {loading ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Alumno">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Apellido</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Documento</label>
            <input value={form.documentId} onChange={(e) => setForm({ ...form, documentId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Grado</label>
            <select value={form.gradeId} onChange={(e) => setForm({ ...form, gradeId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all">
              <option value="">Sin grado</option>
              {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sección</label>
            <select value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all">
              <option value="">Sin sección</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
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
