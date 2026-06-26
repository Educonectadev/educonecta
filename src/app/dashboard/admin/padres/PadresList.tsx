"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import DataTable from "@/components/DataTable"

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
    const res = await fetch("/api/admin/parents", {
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
    if (res.ok) {
      setShowCreate(false)
      resetForm()
      router.refresh()
    } else {
      const data = await res.json()
      toast.danger(data.error || "Error al registrar padre")
    }
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    const res = await fetch(`/api/admin/parents/${editing.id}`, {
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
    if (res.ok) {
      setEditing(null)
      router.refresh()
    } else {
      const data = await res.json()
      toast.danger(data.error || "Error al actualizar padre")
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    const res = await fetch(`/api/admin/parents/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    if (res.ok) {
      setDeleting(null)
      router.refresh()
    } else {
      toast.danger("Error al eliminar padre")
    }
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Padres</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] bg-black dark:bg-white px-6 py-2.5 text-sm font-medium text-white dark:text-black transition-all hover:bg-gray-800 dark:hover:bg-zinc-200 text-center">+ Registrar Padre</button>
      </div>

      <DataTable
        data={parents}
        emptyMessage="No hay padres registrados."
        onEdit={openEdit}
        onDelete={(p) => setDeleting(p)}
        columns={[
          {
            key: "name",
            label: "Padre",
            sortable: true,
            render: (p) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                  {p.user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.user.name}</p>
                  <p className="text-[11px] text-gray-400">{p.user.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "phone",
            label: "Teléfono",
            render: (p) => p.user.phone ? <span className="text-sm text-gray-500">{p.user.phone}</span> : <span className="text-sm text-gray-300">—</span>,
          },
          {
            key: "childrenCount",
            label: "Hijos",
            render: (p) => (
              <div>
                <span className="text-sm font-medium text-gray-700">{p.children.length}</span>
                {p.children.length > 0 && (
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {p.children.map((c) => c.student.firstName).join(", ")}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Padre" size="md" scroll="inside">
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
                  <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => toggleChild(s.id)} />
                  {s.firstName} {s.lastName}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleCreate} disabled={loading || !form.firstName || !form.lastName || !form.password} className="flex-1 rounded-[30px] bg-black dark:bg-white text-white dark:text-black py-2.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50">
            {loading ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Padre" size="md" scroll="inside">
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
                  <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => toggleChild(s.id)} />
                  {s.firstName} {s.lastName}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] bg-black dark:bg-white text-white dark:text-black py-2.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar padre" size="sm">
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
