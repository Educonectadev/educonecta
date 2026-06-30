"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <p className="sa-eyebrow">Comunidad educativa</p>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Padres</h1>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowCreate(true); resetForm() }} className="sa-btn sa-btn-primary">+ Registrar Padre</motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}>
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "var(--surface-3)", color: "var(--muted-foreground)" }}>
                    {p.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{p.user.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{p.user.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "phone",
              label: "Teléfono",
              render: (p) => p.user.phone ? <span className="text-sm" style={{ color: "var(--foreground)" }}>{p.user.phone}</span> : <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>—</span>,
            },
            {
              key: "childrenCount",
              label: "Hijos",
              render: (p) => (
                <div>
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{p.children.length}</span>
                  {p.children.length > 0 && (
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {p.children.map((c) => c.student.firstName).join(", ")}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </motion.div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Padre" size="md" scroll="inside">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5">Nombres</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="sa-input w-full" placeholder="Juan" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Apellidos</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="sa-input w-full" placeholder="Pérez" />
            </div>
          </div>
          {form.firstName && form.lastName && (
            <div className="px-4 py-2.5 rounded-[var(--radius-tile)]" style={{ background: "var(--surface-2)" }}>
              <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Email generado automáticamente:</p>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{form.firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.{form.lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@colegio.edu.pe</p>
            </div>
          )}
          <div>
            <label className="block sa-eyebrow mb-1.5">Contraseña</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="sa-input w-full" />
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Teléfono</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="sa-input w-full" />
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Hijos vinculados</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
              {allStudents.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--foreground)" }}>
                  <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => toggleChild(s.id)} />
                  {s.firstName} {s.lastName}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(false)} className="sa-btn sa-btn-ghost flex-1">Cancelar</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={loading || !form.firstName || !form.lastName || !form.password} className="sa-btn sa-btn-primary flex-1">
            {loading ? "Guardando..." : "Registrar"}
          </motion.button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Padre" size="md" scroll="inside">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5">Nombres</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="sa-input w-full" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Apellidos</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="sa-input w-full" />
            </div>
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Nueva contraseña (vacío = mantener)</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="sa-input w-full" />
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Teléfono</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="sa-input w-full" />
          </div>
          <div>
            <label className="block sa-eyebrow mb-1.5">Hijos vinculados</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
              {allStudents.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--foreground)" }}>
                  <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => toggleChild(s.id)} />
                  {s.firstName} {s.lastName}
                </label>
              ))}
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

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar padre" size="sm">
        <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>Se eliminará {deleting?.user?.name}. Esta acción no se puede deshacer.</p>
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
