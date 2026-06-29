"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Plus, DollarSign, Pencil, Trash2 } from "lucide-react"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"

type Fee = {
  id: number
  name: string
  description: string
  amount: number
  type: string
  dueDay: number
  academicYear: string
  isActive: boolean
}

const typeLabels: Record<string, string> = {
  pension: "Pensión",
  enrollment: "Matrícula",
  apafa: "APAFA",
  other: "Otro",
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function FormFields({
  form,
  setForm,
}: {
  form: { name: string; description: string; amount: number; type: string; dueDay: number; academicYear: string }
  setForm: (f: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nombre de la cuota</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          placeholder="Pensión Mensual"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option value="pension">Pensión</option>
            <option value="enrollment">Matrícula</option>
            <option value="apafa">APAFA</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Monto (S/)</label>
          <input
            type="number"
            step="0.01"
            value={form.amount || ""}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Día de vencimiento</label>
          <input
            type="number"
            min={1}
            max={31}
            value={form.dueDay || ""}
            onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })}
            className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            placeholder="10"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Año académico</label>
          <input
            value={form.academicYear}
            onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
            className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            placeholder="2026"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Descripción (opcional)</label>
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          placeholder="Descripción de la cuota"
        />
      </div>
    </div>
  )
}

export default function FeesPage() {
  const router = useRouter()
  const [fees, setFees] = useState<Fee[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Fee | null>(null)
  const [deleting, setDeleting] = useState<Fee | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    amount: 0,
    type: "pension",
    dueDay: 10,
    academicYear: String(new Date().getFullYear()),
  })

  const load = async () => {
    const res = await fetch("/api/admin/fees")
    const data = await res.json()
    setFees(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setForm({ name: "", description: "", amount: 0, type: "pension", dueDay: 10, academicYear: String(new Date().getFullYear()) })
  }

  function openNew() {
    resetForm()
    setShowCreate(true)
  }

  function openEdit(fee: Fee) {
    setEditing(fee)
    setForm({
      name: fee.name,
      description: fee.description,
      amount: fee.amount,
      type: fee.type,
      dueDay: fee.dueDay,
      academicYear: fee.academicYear,
    })
  }

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Error al crear")
      toast.success("Cuota creada correctamente")
      setShowCreate(false)
      resetForm()
      load()
    } catch {
      toast.danger("Error al crear la cuota")
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      })
      if (!res.ok) throw new Error("Error al guardar")
      toast.success("Cuota actualizada")
      setEditing(null)
      load()
    } catch {
      toast.danger("Error al guardar la cuota")
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/fees/${deleting.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      toast.success("Cuota eliminada")
      setDeleting(null)
      load()
    } catch {
      toast.danger("Error al eliminar la cuota")
    }
    setLoading(false)
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <DollarSign className="w-6 h-6 text-emerald-500" />
          Cuotas y Pensiones
        </h1>
        <button
          onClick={openNew}
          className="rounded-[30px] btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nueva cuota
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        {fees.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-12">
            No hay cuotas registradas. Crea la primera.
          </p>
        )}
        <AnimatePresence>
          {fees.map((fee) => (
            <motion.div
              key={fee.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-between rounded-[30px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-5 py-4 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fee.name}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                    {typeLabels[fee.type]} · S/ {fee.amount.toFixed(2)} · Vence día {fee.dueDay}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-[11px] text-gray-400 dark:text-zinc-600 font-medium bg-gray-100 dark:bg-zinc-800 rounded-full px-2.5 py-1">
                  {fee.academicYear}
                </span>
                <button
                  onClick={() => openEdit(fee)}
                  className="text-gray-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleting(fee)}
                  className="text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nueva cuota" size="md" scroll="inside">
        <FormFields form={form} setForm={setForm} />
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setShowCreate(false)}
            className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !form.name}
            className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {loading ? "Creando..." : "Crear cuota"}
          </button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar cuota" size="md" scroll="inside">
        <FormFields form={form} setForm={setForm} />
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setEditing(null)}
            className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar cuota" size="sm">
        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center">
          Se eliminará <span className="font-semibold text-gray-700 dark:text-zinc-300">{deleting?.name}</span>.
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setDeleting(null)}
            className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 rounded-[30px] bg-red-600 text-white py-2.5 text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </Modal>
    </motion.div>
  )
}
