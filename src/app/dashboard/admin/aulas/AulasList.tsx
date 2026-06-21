"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Aula {
  id: number
  name: string
  code: string | null
  capacity: number | null
  location: string | null
}

function FormFields({ form, setForm }: { form: { name: string; code: string; capacity: string; location: string }; setForm: (f: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del Aula</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
          className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Aula 101" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Código</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="A-101" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Capacidad</label>
          <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="30" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Ubicación</label>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Pabellón A, 2do piso" />
      </div>
    </div>
  )
}

export default function AulasList({ aulas }: { aulas: Aula[] }) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Aula | null>(null)
  const [deleting, setDeleting] = useState<Aula | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", code: "", capacity: "", location: "" })

  function resetForm() { setForm({ name: "", code: "", capacity: "", location: "" }) }

  function openEdit(a: Aula) {
    setEditing(a)
    setForm({
      name: a.name,
      code: a.code ?? "",
      capacity: a.capacity?.toString() ?? "",
      location: a.location ?? "",
    })
  }

  async function handleCreate() {
    setLoading(true)
    await fetch("/api/admin/classrooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setLoading(false)
    setShowCreate(false)
    resetForm()
    router.refresh()
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    await fetch(`/api/admin/classrooms/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setLoading(false)
    setEditing(null)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    await fetch(`/api/admin/classrooms/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    setDeleting(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Aulas</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 text-center">+ Registrar Aula</button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-[30px] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4 whitespace-nowrap">Aula</th>
              <th className="px-6 py-4 whitespace-nowrap">Código</th>
              <th className="px-6 py-4 whitespace-nowrap">Capacidad</th>
              <th className="px-6 py-4 whitespace-nowrap">Ubicación</th>
              <th className="px-6 py-4 w-24 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 md:divide-y-0">
            {aulas.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No hay aulas registradas.</td></tr>
            ) : (
              aulas.map((a) => (
                <tr key={a.id} className="flex flex-col md:table-row border border-gray-200 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0">
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 font-medium">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Aula</span>
                    <span>{a.name}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Código</span>
                    <span>{a.code ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Capacidad</span>
                    <span>{a.capacity != null ? `${a.capacity} estudiantes` : "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Ubicación</span>
                    <span>{a.location ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Acciones</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(a)} className="text-xs text-gray-500 hover:text-black transition-all border border-gray-200 rounded-[30px] px-3 py-1">Editar</button>
                      <button onClick={() => setDeleting(a)} className="text-xs text-red-500 hover:text-red-700 transition-all border border-red-200 rounded-[30px] px-3 py-1">Eliminar</button>
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
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-md w-full p-8 animate-fade-in">
            <h2 className="text-xl font-bold tracking-tight mb-6">Registrar Aula</h2>
            <FormFields form={form} setForm={setForm} />
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleCreate} disabled={loading || !form.name} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
                {loading ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-md w-full p-8 animate-fade-in">
            <h2 className="text-xl font-bold tracking-tight mb-6">Editar Aula</h2>
            <FormFields form={form} setForm={setForm} />
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
            <h2 className="text-lg font-bold tracking-tight mb-2">¿Eliminar aula?</h2>
            <p className="text-sm text-gray-500">Se eliminará {deleting.name}. Esta acción no se puede deshacer.</p>
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
