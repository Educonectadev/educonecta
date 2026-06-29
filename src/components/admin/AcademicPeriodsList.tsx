"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import DataTable from "@/components/DataTable"

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

export default function AcademicPeriodsList() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [detail, setDetail] = useState<Period | null>(null)
  const [editing, setEditing] = useState<Period | null>(null)
  const [showForm, setShowForm] = useState(false)
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

  function openEdit(p: Period) {
    setEditing(p)
    setForm({ name: p.name, type: p.type, academicYear: p.academicYear, startDate: p.startDate, endDate: p.endDate, order: p.order })
    setShowForm(true)
  }

  async function handleSave() {
    setLoading(true)
    try {
      const isEdit = !!editing
      const url = isEdit ? `/api/admin/academic-periods/${editing!.id}` : "/api/admin/academic-periods"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error("Error al guardar")
      toast.success(isEdit ? "Período actualizado" : "Período creado")
      setShowForm(false)
      setEditing(null)
      resetForm()
      load()
    } catch {
      toast.danger("Error al guardar el período")
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 text-emerald-500" />
          Períodos Académicos
        </h2>
        <button
          onClick={() => { resetForm(); setEditing(null); setShowForm(true) }}
          className="rounded-[30px] btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-medium"
        >
          Nuevo período
        </button>
      </div>

      <DataTable
        data={periods}
        emptyMessage="No hay períodos académicos. Crea el primero."
        onEdit={openEdit}
        onDelete={(p) => setDeleting(p)}
        onRowClick={(p) => setDetail(p)}
        columns={[
          {
            key: "name",
            label: "Período",
            sortable: true,
            render: (p) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">{p.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    {typeLabels[p.type] ?? p.type} · {p.startDate} → {p.endDate}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "academicYear",
            label: "Año",
            sortable: true,
            render: (p) => <span className="text-sm text-gray-700 dark:text-zinc-300">{p.academicYear}</span>,
          },
          {
            key: "order",
            label: "Orden",
            sortable: true,
            render: (p) => (
              <span className="badge-gray text-[11px] rounded-full px-2.5 py-1 border">
                #{p.order}
              </span>
            ),
          },
        ]}
      />

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null) }} title={editing ? "Editar período académico" : "Nuevo período académico"} size="md" scroll="inside">
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
            onClick={() => { setShowForm(false); setEditing(null) }}
            className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !form.name || !form.startDate || !form.endDate}
            className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear período"}
          </button>
        </div>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ""} size="sm">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mb-0.5">Tipo</p>
              <p className="font-medium text-gray-900 dark:text-white/90 capitalize">{detail ? typeLabels[detail.type] ?? detail.type : ""}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mb-0.5">Año</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{detail?.academicYear}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mb-0.5">Inicio</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{detail?.startDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mb-0.5">Fin</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{detail?.endDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mb-0.5">Orden</p>
              <p className="font-medium text-gray-900 dark:text-white/90">#{detail?.order}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mb-0.5">Estado</p>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${detail?.isActive ? "badge-green" : "badge-gray"}`}>
                {detail?.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
          <button
            onClick={() => { const p = detail; setDetail(null); if (p) openEdit(p) }}
            className="w-full rounded-[30px] btn-primary py-2.5 text-sm font-medium"
          >
            Editar período
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
    </div>
  )
}
