"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Parent {
  id: number
  user: { id: number; name: string; email: string; phone: string | null }
  children: { student: { id: number; firstName: string; lastName: string } }[]
}

export default function PadresList({ parents, allStudents }: { parents: Parent[]; allStudents: { id: number; firstName: string; lastName: string }[] }) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Parent | null>(null)
  const [deleting, setDeleting] = useState<Parent | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ firstName: "", lastName: "", password: "", phone: "", studentIds: [] as number[] })

  function resetForm() { setForm({ firstName: "", lastName: "", password: "", phone: "", studentIds: [] }) }

  function openEdit(p: Parent) {
    const parts = p.user.name.split(" ")
    setEditing(p)
    setForm({
      firstName: parts[0] ?? "",
      lastName: (parts.slice(1).join(" ") || parts[0]) ?? "",
      password: "",
      phone: p.user.phone ?? "",
      studentIds: p.children.map((c) => c.student.id),
    })
  }

  async function handleCreate() {
    setLoading(true)
    await fetch("/api/admin/parents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
        phone: form.phone || null,
        studentIds: form.studentIds,
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
    await fetch(`/api/admin/parents/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password || undefined,
        phone: form.phone || null,
        studentIds: form.studentIds,
      }),
    })
    setLoading(false)
    setEditing(null)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    await fetch(`/api/admin/parents/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    setDeleting(null)
    router.refresh()
  }

  function toggleChild(id: number) {
    setForm((f) => ({
      ...f,
      studentIds: f.studentIds.includes(id) ? f.studentIds.filter((c) => c !== id) : [...f.studentIds, id],
    }))
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Padres</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 text-center">+ Registrar Padre</button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-[30px]">
        <table className="w-full text-sm">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Hijos</th>
              <th className="px-6 py-4 w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 md:divide-y-0">
            {parents.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No hay padres registrados.</td></tr>
            ) : (
              parents.map((p) => (
                <tr key={p.id} className="flex flex-col md:table-row border border-gray-200 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0">
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 font-medium">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Nombre</span>
                    <span>{p.user.name}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Email</span>
                    <span>{p.user.email}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Hijos</span>
                    <span>{p.children.map((c) => `${c.student.firstName} ${c.student.lastName}`).join(", ") || "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Acciones</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-gray-500 hover:text-black transition-all border border-gray-200 rounded-[30px] px-3 py-1">Editar</button>
                      <button onClick={() => setDeleting(p)} className="text-xs text-red-500 hover:text-red-700 transition-all border border-red-200 rounded-[30px] px-3 py-1">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-md w-full p-8 animate-fade-in max-h-[80vh] overflow-y-auto scrollbar-hide">
            <h2 className="text-xl font-bold tracking-tight mb-6">Registrar Padre</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nombres</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Juan" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Apellidos</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Pérez" />
                </div>
              </div>
              {form.firstName && form.lastName && (
                <div className="bg-gray-50 rounded-[20px] px-4 py-2.5">
                  <p className="text-[11px] text-gray-400">Email generado automáticamente:</p>
                  <p className="text-sm font-medium text-gray-700">{form.firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.{form.lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@colegio.edu.pe</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hijos vinculados</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
                  {allStudents.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => toggleChild(s.id)} className="accent-black" />
                      {s.firstName} {s.lastName}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleCreate} disabled={loading || !form.firstName || !form.lastName || !form.password} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
                {loading ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-md w-full p-8 animate-fade-in max-h-[80vh] overflow-y-auto scrollbar-hide">
            <h2 className="text-xl font-bold tracking-tight mb-6">Editar Padre</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nombres</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Apellidos</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nueva contraseña (vacío = mantener)</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hijos vinculados</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
                  {allStudents.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => toggleChild(s.id)} className="accent-black" />
                      {s.firstName} {s.lastName}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setDeleting(null) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-sm w-full p-8 animate-fade-in text-center">
            <h2 className="text-lg font-bold tracking-tight mb-2">¿Eliminar padre?</h2>
            <p className="text-sm text-gray-500">Se eliminará {deleting.user.name}. Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleting(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 rounded-[30px] bg-red-600 text-white py-2.5 text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50">
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
