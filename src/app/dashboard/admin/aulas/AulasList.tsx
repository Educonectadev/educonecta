"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/Modal"

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

      {aulas.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-[30px] p-12 text-center text-gray-500">No hay aulas registradas.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {aulas.map((a) => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-[25px] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-[12px] flex items-center justify-center text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a]">{a.name}</h3>
                    {a.code && <span className="text-xs text-gray-400">{a.code}</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {a.capacity != null && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>{a.capacity} estudiantes</span>
                  </div>
                )}
                {a.location && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{a.location}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(a)} className="text-xs text-gray-500 hover:text-black transition-all border border-gray-200 rounded-[30px] px-3 py-1.5">Editar</button>
                <button onClick={() => setDeleting(a)} className="text-xs text-red-500 hover:text-red-700 transition-all border border-red-200 rounded-[30px] px-3 py-1.5">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Aula">
        <FormFields form={form} setForm={setForm} />
        <div className="flex gap-3 mt-8">
          <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleCreate} disabled={loading || !form.name} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
            {loading ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Aula">
        <FormFields form={form} setForm={setForm} />
        <div className="flex gap-3 mt-8">
          <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar aula" size="sm">
        <p className="text-sm text-gray-500 text-center">Se eliminará {deleting?.name}. Esta acción no se puede deshacer.</p>
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
