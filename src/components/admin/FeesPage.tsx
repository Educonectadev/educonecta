"use client"

import { useState, useEffect } from "react"
import { Plus, DollarSign, Pencil, Trash2 } from "lucide-react"

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

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Fee | null>(null)
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

  const openNew = () => {
    setEditing(null)
    setForm({ name: "", description: "", amount: 0, type: "pension", dueDay: 10, academicYear: String(new Date().getFullYear()) })
    setShowForm(true)
  }

  const openEdit = (fee: Fee) => {
    setEditing(fee)
    setForm({ name: fee.name, description: fee.description, amount: fee.amount, type: fee.type, dueDay: fee.dueDay, academicYear: fee.academicYear })
    setShowForm(true)
  }

  const save = async () => {
    if (editing) {
      await fetch("/api/admin/fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      })
    } else {
      await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  const remove = async (id: number) => {
    await fetch(`/api/admin/fees/${id}`, { method: "DELETE" })
    load()
  }

  const typeLabels: Record<string, string> = { pension: "Pensión", enrollment: "Matrícula", apafa: "APAFA", other: "Otro" }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <DollarSign className="w-6 h-6 text-emerald-400" />
          Cuotas y Pensiones
        </h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          Nueva cuota
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{editing ? "Editar" : "Nueva"} cuota</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre (ej: Pensión Mensual)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white"
            >
              <option value="pension">Pensión</option>
              <option value="enrollment">Matrícula</option>
              <option value="apafa">APAFA</option>
              <option value="other">Otro</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Monto (S/)"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500"
            />
            <input
              type="number"
              placeholder="Día de vencimiento"
              value={form.dueDay}
              onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })}
              className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500"
            />
            <input
              placeholder="Año académico"
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500"
            />
            <input
              placeholder="Descripción (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm text-white hover:bg-emerald-700">
              {editing ? "Actualizar" : "Crear"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl px-5 py-2 text-sm text-zinc-400 hover:text-white">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {fees.map((fee) => (
          <div
            key={fee.id}
            className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{fee.name}</span>
                <span className="text-xs text-zinc-500">
                  {typeLabels[fee.type]} · S/ {fee.amount.toFixed(2)} · Vence día {fee.dueDay}
                </span>
              </div>
              <span className="text-xs text-zinc-600">{fee.academicYear}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(fee)} className="text-zinc-500 hover:text-emerald-400">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => remove(fee.id)} className="text-zinc-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {fees.length === 0 && (
          <p className="text-sm text-zinc-500 text-center py-8">No hay cuotas registradas.</p>
        )}
      </div>
    </div>
  )
}
