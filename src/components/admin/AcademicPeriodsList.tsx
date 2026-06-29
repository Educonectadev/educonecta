"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Plus, Trash2, Calendar } from "lucide-react"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"

type Period = {
  id: number
  name: string
  type: string
  academicYear: string
  startDate: string
  endDate: string
  order: number
  isActive: boolean
}

const typeLabels: Record<string, string> = {
  bimester: "Bimestre",
  trimester: "Trimestre",
  semester: "Semestre",
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function AcademicPeriodsList() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [deleting, setDeleting] = useState<Period | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    type: "bimester",
    academicYear: String(new Date().getFullYear()),
    startDate: "",
    endDate: "",
    order: 1,
  })

  const load = async () => {
    const res = await fetch("/api/admin/academic-periods")
    const data = await res.json()
    setPeriods(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setForm({ name: "", type: "bimester", academicYear: String(new Date().getFullYear()), startDate: "", endDate: "", order: 1 })
  }

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/academic-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Error al crear")
      toast.success("Período creado correctamente")
      setShowCreate(false)
      resetForm()
      load()
    } catch {
      toast.danger("Error al crear el período")
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/academic-periods/${deleting.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      toast.success("Período eliminado")
      setDeleting(null)
      load()
    } catch {
      toast.danger("Error al eliminar el período")
    }
    setLoading(false)
  }

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 text-emerald-500" />
          Períodos Académicos
        </h2>
        <button
          onClick={() => { resetForm(); setShowCreate(true) }}
          className="rounded-[30px] btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo período
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        {periods.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-8">
            No hay períodos académicos. Crea el primero.
          </p>
        )}
        <AnimatePresence>
          {periods.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-between rounded-[30px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-5 py-4 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                    {typeLabels[p.type] ?? p.type} · {p.academicYear} · {p.startDate} → {p.endDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-[11px] text-gray-400 dark:text-zinc-600 font-medium bg-gray-100 dark:bg-zinc-800 rounded-full px-2.5 py-1">
                  #{p.order}
                </span>
                <button
                  onClick={() => setDeleting(p)}
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo período académico" size="md" scroll="inside">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
              placeholder="I Bimestre"
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
                <option value="bimester">Bimestre</option>
                <option value="trimester">Trimestre</option>
                <option value="semester">Semestre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Orden</label>
              <input
                type="number"
                min={1}
                value={form.order || ""}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                placeholder="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de inicio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de fin</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            </div>
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
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setShowCreate(false)}
            className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !form.name || !form.startDate || !form.endDate}
            className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {loading ? "Creando..." : "Crear período"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar período" size="sm">
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
