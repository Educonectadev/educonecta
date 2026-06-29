"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Calendar } from "lucide-react"

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

export default function AcademicPeriodsList() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [showForm, setShowForm] = useState(false)
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

  const create = async () => {
    await fetch("/api/admin/academic-periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setShowForm(false)
    setForm({ name: "", type: "bimester", academicYear: String(new Date().getFullYear()), startDate: "", endDate: "", order: 1 })
    load()
  }

  const remove = async (id: number) => {
    await fetch(`/api/admin/academic-periods/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 text-emerald-400" />
          Períodos Académicos
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          Nuevo período
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder="Nombre (ej: I Bimestre)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
            >
              <option value="bimester">Bimestre</option>
              <option value="trimester">Trimestre</option>
              <option value="semester">Semestre</option>
            </select>
            <input
              type="number"
              placeholder="Orden"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Año (ej: 2024)"
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              className="rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
            />
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">
              Crear
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {periods.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</span>
              <span className="text-xs text-gray-400 dark:text-zinc-500 uppercase">{p.type}</span>
              <span className="text-sm text-gray-500 dark:text-zinc-400">{p.academicYear}</span>
              <span className="text-xs text-gray-400 dark:text-zinc-500">
                {p.startDate} → {p.endDate}
              </span>
            </div>
            <button onClick={() => remove(p.id)} className="text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {periods.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-8">
            No hay períodos académicos. Crea el primero.
          </p>
        )}
      </div>
    </div>
  )
}
