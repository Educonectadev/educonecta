"use client"

import { useState, useEffect } from "react"
import { Plus, DollarSign } from "lucide-react"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import DataTable from "@/components/DataTable"

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
  const [fees, setFees] = useState<Fee[]>([])
  const [editing, setEditing] = useState<Fee | null>(null)
  const [showForm, setShowForm] = useState(false)
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
    setShowForm(true)
  }

  async function handleSave() {
    setLoading(true)
    try {
      const isEdit = !!editing
      const body = isEdit ? { id: editing!.id, ...form } : form
      const res = await fetch("/api/admin/fees", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Error al guardar")
      toast.success(isEdit ? "Cuota actualizada" : "Cuota creada")
      setShowForm(false)
      setEditing(null)
      resetForm()
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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <DollarSign className="w-6 h-6 text-emerald-500" />
          Cuotas y Pensiones
        </h1>
        <button
          onClick={() => { resetForm(); setEditing(null); setShowForm(true) }}
          className="rounded-[30px] btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nueva cuota
        </button>
      </div>

      <DataTable
        data={fees}
        emptyMessage="No hay cuotas registradas. Crea la primera."
        onEdit={openEdit}
        onDelete={(f) => setDeleting(f)}
        columns={[
          {
            key: "name",
            label: "Cuota",
            sortable: true,
            render: (f) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{f.name}</p>
                  {f.description && <p className="text-[11px] text-gray-400">{f.description}</p>}
                </div>
              </div>
            ),
          },
          {
            key: "type",
            label: "Tipo",
            sortable: true,
            render: (f) => (
              <span className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-full px-2.5 py-1">
                {typeLabels[f.type] ?? f.type}
              </span>
            ),
          },
          {
            key: "amount",
            label: "Monto",
            sortable: true,
            render: (f) => (
              <span className="text-sm font-medium text-gray-900 dark:text-white">S/ {f.amount.toFixed(2)}</span>
            ),
          },
          {
            key: "dueDay",
            label: "Vence",
            sortable: true,
            render: (f) => <span className="text-sm text-gray-500">Día {f.dueDay}</span>,
          },
          {
            key: "academicYear",
            label: "Año",
            sortable: true,
            render: (f) => (
              <span className="text-[11px] text-gray-400 dark:text-zinc-600 font-medium bg-gray-100 dark:bg-zinc-800 rounded-full px-2.5 py-1">
                {f.academicYear}
              </span>
            ),
          },
        ]}
      />

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null) }} title={editing ? "Editar cuota" : "Nueva cuota"} size="md" scroll="inside">
        <FormFields form={form} setForm={setForm} />
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => { setShowForm(false); setEditing(null) }}
            className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !form.name}
            className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear cuota"}
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
    </div>
  )
}
