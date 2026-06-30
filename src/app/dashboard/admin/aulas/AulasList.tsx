"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
        <label className="block sa-eyebrow mb-1.5">Nombre del Aula</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
          className="sa-input w-full" placeholder="Aula 101" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block sa-eyebrow mb-1.5">Código</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="sa-input w-full" placeholder="A-101" />
        </div>
        <div>
          <label className="block sa-eyebrow mb-1.5">Capacidad</label>
          <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className="sa-input w-full" placeholder="30" />
        </div>
      </div>
      <div>
        <label className="block sa-eyebrow mb-1.5">Ubicación</label>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="sa-input w-full" placeholder="Pabellón A, 2do piso" />
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <p className="sa-eyebrow">Infraestructura</p>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Aulas</h1>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowCreate(true); resetForm() }} className="sa-btn sa-btn-primary">+ Registrar Aula</motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}>
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
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{a.name}</p>
                  {a.code && <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{a.code}</p>}
                </div>
              ),
            },
            {
              key: "capacity",
              label: "Capacidad",
              sortable: true,
              render: (a) => a.capacity != null ? <span className="text-sm" style={{ color: "var(--foreground)" }}>{a.capacity} estudiantes</span> : <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>—</span>,
            },
            {
              key: "location",
              label: "Ubicación",
              sortable: true,
              render: (a) => a.location ? <span className="text-sm" style={{ color: "var(--foreground)" }}>{a.location}</span> : <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>—</span>,
            },
          ]}
        />
      </motion.div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Aula" size="md" scroll="inside">
        <FormFields form={form} setForm={setForm} />
        <div className="flex gap-3 mt-8">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(false)} className="sa-btn sa-btn-ghost flex-1">Cancelar</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={loading || !form.name} className="sa-btn sa-btn-primary flex-1">
            {loading ? "Guardando..." : "Registrar"}
          </motion.button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Aula" size="md" scroll="inside">
        <FormFields form={form} setForm={setForm} />
        <div className="flex gap-3 mt-8">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditing(null)} className="sa-btn sa-btn-ghost flex-1">Cancelar</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={loading} className="sa-btn sa-btn-primary flex-1">
            {loading ? "Guardando..." : "Guardar"}
          </motion.button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar aula" size="sm">
        <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>Se eliminará {deleting?.name}. Esta acción no se puede deshacer.</p>
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
