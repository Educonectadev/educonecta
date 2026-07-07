"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/Modal"
import DataTable from "@/components/DataTable"

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
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Nombre del Aula</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
          className="w-full rounded-[30px] border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all" placeholder="Aula 101" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Código</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full rounded-[30px] border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all" placeholder="A-101" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Capacidad</label>
          <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className="w-full rounded-[30px] border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all" placeholder="30" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Ubicación</label>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="w-full rounded-[30px] border border-[var(--surface-border)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all" placeholder="Pabellón A, 2do piso" />
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
    <div className="space-y-4 md:space-y-6 pt-3 md:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Aulas</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] sa-btn sa-btn-primary px-6 py-2.5 text-sm font-medium text-center">+ Registrar Aula</button>
      </div>

      <DataTable
        data={aulas}
        onEdit={openEdit}
        onDelete={(a) => setDeleting(a)}
        emptyMessage="No hay aulas registradas."
        columns={[
          {
            key: "name",
            label: "Aula",
            sortable: true,
            render: (a) => (
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{a.name}</p>
                {a.code && <p className="text-[11px] text-[var(--muted-foreground)]">{a.code}</p>}
              </div>
            ),
          },
          {
            key: "capacity",
            label: "Capacidad",
            sortable: true,
            render: (a) => a.capacity != null ? <span className="text-sm text-[var(--foreground)]">{a.capacity} estudiantes</span> : <span className="text-sm text-[var(--muted-foreground)]">—</span>,
          },
          {
            key: "location",
            label: "Ubicación",
            sortable: true,
            render: (a) => a.location ? <span className="text-sm text-[var(--foreground)]">{a.location}</span> : <span className="text-sm text-[var(--muted-foreground)]">—</span>,
          },
        ]}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Aula" size="md" scroll="inside">
        <FormFields form={form} setForm={setForm} />
        <div className="flex gap-3 mt-8">
          <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-[var(--surface-border)] py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-all">Cancelar</button>
          <button onClick={handleCreate} disabled={loading || !form.name} className="flex-1 rounded-[30px] sa-btn sa-btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Aula" size="md" scroll="inside">
        <FormFields form={form} setForm={setForm} />
        <div className="flex gap-3 mt-8">
          <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-[var(--surface-border)] py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] sa-btn sa-btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar aula" size="sm">
        <p className="text-sm text-[var(--muted-foreground)] text-center">Se eliminará {deleting?.name}. Esta acción no se puede deshacer.</p>
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
