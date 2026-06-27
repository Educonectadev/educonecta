"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import DataTable from "@/components/DataTable"
import Select from "@/components/Select"

interface Subscription {
  id: number
  institutionId: number
  plan: "ESENCIAL" | "PROFESIONAL" | "INSTITUCIONAL"
  pricePerParent: number | string
  parentCount: number
  monthlyAmount: number | string
  startedAt: string
  expiresAt: string | null
  isActive: boolean
  notes: string | null
  institutionName?: string
  institutionCode?: string
  institutionActive?: boolean
}

interface Institution {
  id: number
  name: string
  code: string
  isActive: boolean
  subscription: Subscription | null
}

const PLAN_LABELS: Record<string, string> = {
  ESENCIAL: "Esencial",
  PROFESIONAL: "Profesional",
  INSTITUCIONAL: "Institucional",
}

const PLAN_STYLES: Record<string, string> = {
  ESENCIAL: "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300",
  PROFESIONAL: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  INSTITUCIONAL: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800",
}

export default function PlanesList({
  subscriptions: initialSubs,
  institutions,
}: {
  subscriptions: Subscription[]
  institutions: Institution[]
}) {
  const router = useRouter()
  const [subs, setSubs] = useState<Subscription[]>(initialSubs)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    institutionId: "",
    plan: "PROFESIONAL" as Subscription["plan"],
    pricePerParent: "2",
    parentCount: "",
    monthlyAmount: "",
    expiresAt: "",
    notes: "",
  })

  const institutionsWithoutSub = useMemo(
    () => institutions.filter((i) => !i.subscription),
    [institutions]
  )

  function openCreate() {
    setEditing(null)
    setForm({
      institutionId: "",
      plan: "PROFESIONAL",
      pricePerParent: "2",
      parentCount: "",
      monthlyAmount: "",
      expiresAt: "",
      notes: "",
    })
    setShowForm(true)
  }

  function openEdit(sub: Subscription) {
    setEditing(sub)
    setForm({
      institutionId: String(sub.institutionId),
      plan: sub.plan,
      pricePerParent: String(sub.pricePerParent),
      parentCount: String(sub.parentCount),
      monthlyAmount: String(sub.monthlyAmount),
      expiresAt: sub.expiresAt ? sub.expiresAt.substring(0, 10) : "",
      notes: sub.notes ?? "",
    })
    setShowForm(true)
  }

  function computeMonthly(price: string, count: string) {
    const p = Number(price)
    const c = Number(count)
    if (!Number.isFinite(p) || !Number.isFinite(c)) return ""
    return (p * c).toFixed(2)
  }

  async function handleSave() {
    if (!form.institutionId) {
      toast.danger("Selecciona una institución")
      return
    }
    setLoading(true)
    const payload = {
      institutionId: Number(form.institutionId),
      plan: form.plan,
      pricePerParent: Number(form.pricePerParent || 0),
      parentCount: Number(form.parentCount || 0),
      monthlyAmount: Number(form.monthlyAmount || computeMonthly(form.pricePerParent, form.parentCount)),
      expiresAt: form.expiresAt || null,
      notes: form.notes || null,
    }
    const res = await fetch("/api/super-admin/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setShowForm(false)
      toast.success(editing ? "Suscripción actualizada" : "Suscripción creada")
      setSubs((prev) => {
        const exists = prev.find((s) => s.id === data?.id)
        if (exists) return prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
        return [data, ...prev]
      })
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.danger(data.error || "Error al guardar")
    }
  }

  async function toggleActive(sub: Subscription) {
    const res = await fetch(`/api/super-admin/subscriptions/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !sub.isActive }),
    })
    if (res.ok) {
      setSubs((prev) => prev.map((s) => (s.id === sub.id ? { ...s, isActive: !s.isActive } : s)))
      toast.success(sub.isActive ? "Suscripción desactivada" : "Suscripción activada")
      router.refresh()
    } else {
      toast.danger("No se pudo actualizar")
    }
  }

  async function handleDelete(sub: Subscription) {
    if (!confirm(`¿Eliminar la suscripción de ${sub.institutionName ?? "esta institución"}?`)) return
    const res = await fetch(`/api/super-admin/subscriptions/${sub.id}`, { method: "DELETE" })
    if (res.ok) {
      setSubs((prev) => prev.filter((s) => s.id !== sub.id))
      toast.success("Suscripción eliminada")
      router.refresh()
    } else {
      toast.danger("No se pudo eliminar")
    }
  }

  const totalMonthly = subs
    .filter((s) => s.isActive)
    .reduce((acc, s) => acc + Number(s.monthlyAmount ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Planes y Suscripciones</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Activa el plan de cada colegio. El monto mensual se calcula como S/ {Number(form.pricePerParent || 2).toFixed(2)} × número de familias aportantes.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-[30px] btn-primary px-6 py-2.5 text-sm font-medium"
        >
          + Asignar plan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Suscripciones activas" value={subs.filter((s) => s.isActive).length} />
        <StatCard label="Familias aportantes" value={subs.filter((s) => s.isActive).reduce((acc, s) => acc + Number(s.parentCount ?? 0), 0)} />
        <StatCard
          label="Ingreso mensual"
          value={`S/ ${totalMonthly.toFixed(2)}`}
        />
      </div>

      <DataTable
        data={subs}
        emptyMessage="Aún no hay suscripciones registradas."
        onEdit={openEdit}
        onDelete={(s) => handleDelete(s)}
        columns={[
          {
            key: "institution",
            label: "Institución",
            render: (s) => (
              <div>
                <p className="font-medium text-gray-900 dark:text-white/90">{s.institutionName ?? "—"}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">{s.institutionCode ?? ""}</p>
              </div>
            ),
          },
          {
            key: "plan",
            label: "Plan",
            sortable: true,
            render: (s) => (
              <span className={`text-xs rounded-full px-2.5 py-0.5 ${PLAN_STYLES[s.plan] ?? "bg-gray-100 text-gray-600"}`}>
                {PLAN_LABELS[s.plan] ?? s.plan}
              </span>
            ),
          },
          {
            key: "pricePerParent",
            label: "S/ x familia",
            render: (s) => `S/ ${Number(s.pricePerParent).toFixed(2)}`,
          },
          {
            key: "parentCount",
            label: "Familias",
            render: (s) => Number(s.parentCount).toLocaleString("es-PE"),
          },
          {
            key: "monthlyAmount",
            label: "Mensual",
            sortable: true,
            render: (s) => (
              <span className="font-medium text-gray-900 dark:text-white/90">
                S/ {Number(s.monthlyAmount).toFixed(2)}
              </span>
            ),
          },
          {
            key: "expiresAt",
            label: "Vence",
            render: (s) =>
              s.expiresAt
                ? new Date(s.expiresAt).toLocaleDateString("es-PE")
                : <span className="text-xs text-gray-400">—</span>,
          },
          {
            key: "isActive",
            label: "Estado",
            render: (s) => (
              <button
                onClick={() => toggleActive(s)}
                className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium transition-all ${
                  s.isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                    : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-500 hover:bg-gray-200"
                }`}
                title="Click para cambiar estado"
              >
                {s.isActive ? "Activo" : "Inactivo"}
              </button>
            ),
          },
        ]}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Editar suscripción" : "Asignar plan"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Institución</label>
            {editing ? (
              <input
                value={editing.institutionName ?? ""}
                disabled
                className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700"
              />
            ) : (
              <Select
                value={form.institutionId}
                onChange={(val) => setForm((p) => ({ ...p, institutionId: val }))}
                options={institutionsWithoutSub.map((i) => ({ value: String(i.id), label: `${i.name} (${i.code})` }))}
                placeholder="Seleccionar institución"
              />
            )}
            {!editing && institutionsWithoutSub.length === 0 && (
              <p className="mt-2 text-[11px] text-gray-400">Todas las instituciones ya tienen suscripción.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Plan</label>
            <Select
              value={form.plan}
              onChange={(val) => setForm((p) => ({ ...p, plan: val as Subscription["plan"] }))}
              options={[
                { value: "ESENCIAL", label: "Esencial" },
                { value: "PROFESIONAL", label: "Profesional" },
                { value: "INSTITUCIONAL", label: "Institucional" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">S/ por familia</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.pricePerParent}
                onChange={(e) => {
                  const price = e.target.value
                  setForm((p) => ({
                    ...p,
                    pricePerParent: price,
                    monthlyAmount: computeMonthly(price, p.parentCount),
                  }))
                }}
                className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">N° familias aportantes</label>
              <input
                type="number"
                min="0"
                value={form.parentCount}
                onChange={(e) => {
                  const count = e.target.value
                  setForm((p) => ({
                    ...p,
                    parentCount: count,
                    monthlyAmount: computeMonthly(p.pricePerParent, count),
                  }))
                }}
                className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Monto mensual (S/)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.monthlyAmount}
              onChange={(e) => setForm((p) => ({ ...p, monthlyAmount: e.target.value }))}
              className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all bg-gray-50 dark:bg-zinc-800"
              placeholder="Se calcula automáticamente"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Auto: S/ {Number(form.pricePerParent || 0).toFixed(2)} × {form.parentCount || 0} = S/{" "}
              {computeMonthly(form.pricePerParent, form.parentCount) || "0.00"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de vencimiento (opcional)</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
              className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notas (opcional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none"
              placeholder="Comprobante, contacto, etc."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowForm(false)}
            className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium"
          >
            {loading ? "Guardando..." : editing ? "Actualizar" : "Activar plan"}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">{value}</p>
    </div>
  )
}