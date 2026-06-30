"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import DataTable from "@/components/DataTable"
import Select from "@/components/Select"
import { getIcon } from "@/components/premium/iconRegistry"

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

type StatusType = "active" | "expiring" | "suspended" | "cancelled"

function computeStatus(sub: Subscription): { type: StatusType; label: string } {
  if (!sub.isActive) return { type: "cancelled", label: "Cancelado" }
  if (!sub.expiresAt) return { type: "active", label: "Activo" }
  const now = new Date()
  const expires = new Date(sub.expiresAt)
  if (expires <= now) return { type: "suspended", label: "Vencido" }
  const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft <= 30) return { type: "expiring", label: "Próximo a vencer" }
  return { type: "active", label: "Activo" }
}

const STATUS_STYLES: Record<StatusType, { color: string; bg: string }> = {
  active: {
    color: "var(--accent)",
    bg: "color-mix(in srgb, var(--accent) 14%, transparent)",
  },
  expiring: {
    color: "#d97706",
    bg: "rgba(217, 119, 6, 0.14)",
  },
  suspended: {
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
  },
  cancelled: {
    color: "var(--muted-foreground)",
    bg: "var(--surface-3)",
  },
}

const PLAN_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  ESENCIAL: {
    color: "var(--foreground)",
    bg: "var(--surface-2)",
    border: "var(--surface-border)",
  },
  PROFESIONAL: {
    color: "#059669",
    bg: "color-mix(in srgb, #059669 12%, transparent)",
    border: "color-mix(in srgb, #059669 25%, transparent)",
  },
  INSTITUCIONAL: {
    color: "#6366f1",
    bg: "color-mix(in srgb, #6366f1 12%, transparent)",
    border: "color-mix(in srgb, #6366f1 25%, transparent)",
  },
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
  const [viewing, setViewing] = useState<Subscription | null>(null)

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
    const status = computeStatus(sub)
    if (status.type !== "active" && status.type !== "expiring") {
      const res = await fetch(`/api/super-admin/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      })
      if (res.ok) {
        setSubs((prev) => prev.map((s) => (s.id === sub.id ? { ...s, isActive: true } : s)))
        toast.success("Suscripción reactivada")
        router.refresh()
      } else {
        toast.danger("No se pudo reactivar")
      }
      return
    }
    const res = await fetch(`/api/super-admin/subscriptions/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !sub.isActive }),
    })
    if (res.ok) {
      setSubs((prev) => prev.map((s) => (s.id === sub.id ? { ...s, isActive: !s.isActive } : s)))
      toast.success(sub.isActive ? "Suscripción suspendida" : "Suscripción activada")
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

  const stats = [
    {
      label: "Suscripciones activas",
      value: subs.filter((s) => s.isActive).length,
      icon: "credit_card",
    },
    {
      label: "Familias aportantes",
      value: subs.filter((s) => s.isActive).reduce((acc, s) => acc + Number(s.parentCount ?? 0), 0),
      icon: "users",
    },
    {
      label: "Ingreso mensual",
      value: `S/ ${totalMonthly.toFixed(2)}`,
      icon: "wallet",
      format: true,
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8 pt-4 md:pt-6">
      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="sa-eyebrow">Suscripciones</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1" style={{ fontFamily: "var(--font-display)" }}>
            Planes y Suscripciones
          </h1>
          <p className="text-sm mt-1.5 max-w-2xl" style={{ color: "var(--muted-foreground)" }}>
            Activa el plan de cada colegio. El monto mensual se calcula como <strong style={{ color: "var(--foreground)" }}>S/ precio por familia × familias aportantes</strong>.
          </p>
        </motion.div>
        <motion.button
          onClick={openCreate}
          className="sa-btn sa-btn-primary self-start md:self-auto"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {getIcon("plus", { size: 16, strokeWidth: 2.2 })}
          <span>Asignar plan</span>
        </motion.button>
      </header>

      {/* ── STAT CARDS ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {stats.map((s, idx) => (
            <motion.div
              key={s.label}
              className="sa-tile group"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 + idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="inline-flex items-center justify-center rounded-full"
                  style={{
                    width: 30,
                    height: 30,
                    background: "var(--surface-2)",
                    border: "1px solid var(--surface-border)",
                  }}
                >
                  {getIcon(s.icon, { size: 14, strokeWidth: 2 })}
                </span>
              </div>
              <p className="sa-eyebrow">{s.label}</p>
              <p className="sa-num text-3xl mt-1.5">{s.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── TABLE ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        {subs.length === 0 ? (
          <div className="sa-surface py-14 md:py-16 text-center">
            <span
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: "var(--surface-3)" }}
            >
              {getIcon("credit_card", { size: 28, strokeWidth: 1.6 })}
            </span>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
              Aún no hay suscripciones
            </p>
            <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>
              Las suscripciones de cada institución aparecerán aquí. Asigna el primer plan usando el botón superior.
            </p>
            <motion.button
              onClick={openCreate}
              className="sa-btn sa-btn-primary mt-5"
              whileTap={{ scale: 0.97 }}
            >
              {getIcon("plus", { size: 16, strokeWidth: 2.2 })}
              <span>Asignar plan</span>
            </motion.button>
          </div>
        ) : (
          <DataTable
            data={subs}
            emptyMessage="Aún no hay suscripciones registradas."
            onEdit={openEdit}
            onDelete={(s) => handleDelete(s)}
            columns={[
              {
                key: "institution",
                label: "Colegio",
                render: (s) => (
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                      {s.institutionName ?? "—"}
                    </p>
                    {s.institutionCode && (
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {s.institutionCode}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: "plan",
                label: "Plan",
                sortable: true,
                render: (s) => {
                  const ps = PLAN_STYLES[s.plan] ?? PLAN_STYLES.ESENCIAL
                  return (
                    <span
                      className="sa-chip"
                      style={{
                        color: ps.color,
                        backgroundColor: ps.bg,
                        borderColor: ps.border,
                      }}
                    >
                      {PLAN_LABELS[s.plan] ?? s.plan}
                    </span>
                  )
                },
              },
              {
                key: "pricePerParent",
                label: "Mensualidad",
                render: (s) => (
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    S/ {Number(s.pricePerParent).toFixed(2)}
                  </span>
                ),
              },
              {
                key: "parentCount",
                label: "Familias",
                render: (s) => (
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {Number(s.parentCount).toLocaleString("es-PE")}
                  </span>
                ),
              },
              {
                key: "monthlyAmount",
                label: "Total/mes",
                sortable: true,
                render: (s) => (
                  <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    S/ {Number(s.monthlyAmount).toFixed(2)}
                  </span>
                ),
              },
              {
                key: "startedAt",
                label: "Inicio",
                render: (s) => (
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(s.startedAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                ),
              },
              {
                key: "expiresAt",
                label: "Vencimiento",
                render: (s) =>
                  s.expiresAt ? (
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(s.expiresAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      —
                    </span>
                  ),
              },
              {
                key: "isActive",
                label: "Estado",
                render: (s) => {
                  const st = computeStatus(s)
                  const ss = STATUS_STYLES[st.type]
                  return (
                    <span className="sa-chip" style={{ color: ss.color, backgroundColor: ss.bg, borderColor: "transparent" }}>
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: ss.color }}
                      />
                      {st.label}
                    </span>
                  )
                },
              },
              {
                key: "actions",
                label: "",
                render: (s) => {
                  const st = computeStatus(s)
                  return (
                    <div className="flex items-center justify-end gap-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); setViewing(s) }}
                        className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                        style={{ color: "var(--muted-foreground)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--foreground)" }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                        title="Ver detalle"
                      >
                        {getIcon("eye", { size: 14, strokeWidth: 2 })}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); openEdit(s) }}
                        className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                        style={{ color: "var(--muted-foreground)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--foreground)" }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                        title="Editar"
                      >
                        {getIcon("edit", { size: 14, strokeWidth: 2 })}
                      </motion.button>
                      {st.type === "suspended" || st.type === "cancelled" ? (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); toggleActive(s) }}
                          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                          style={{ color: "var(--muted-foreground)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "color-mix(in srgb, var(--accent) 14%, transparent)"; e.currentTarget.style.color = "var(--accent)" }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                          title="Renovar"
                        >
                          {getIcon("refresh", { size: 14, strokeWidth: 2 })}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); toggleActive(s) }}
                          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                          style={{ color: "var(--muted-foreground)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.color = "#ef4444" }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                          title="Suspender"
                        >
                          {getIcon("power", { size: 14, strokeWidth: 2 })}
                        </motion.button>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(s) }}
                        className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                        style={{ color: "var(--muted-foreground)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.color = "#ef4444" }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                        title="Eliminar"
                      >
                        {getIcon("trash", { size: 14, strokeWidth: 2 })}
                      </motion.button>
                    </div>
                  )
                },
              },
            ]}
          />
        )}
      </motion.div>

      {/* ── DETAIL MODAL ── */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="" size="md">
        {viewing && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "1px solid var(--surface-border)" }}>
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--surface-2)", border: "1px solid var(--surface-border)" }}
              >
                {getIcon("credit_card", { size: 18, strokeWidth: 2 })}
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{viewing.institutionName ?? "Institución"}</p>
                <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{viewing.institutionCode ?? ""}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Plan</p>
                <span className="sa-chip" style={{ color: PLAN_STYLES[viewing.plan]?.color, backgroundColor: PLAN_STYLES[viewing.plan]?.bg, borderColor: PLAN_STYLES[viewing.plan]?.border }}>
                  {PLAN_LABELS[viewing.plan] ?? viewing.plan}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Estado</p>
                {(() => {
                  const st = computeStatus(viewing)
                  const ss = STATUS_STYLES[st.type]
                  return (
                    <span className="sa-chip" style={{ color: ss.color, backgroundColor: ss.bg, borderColor: "transparent" }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: ss.color }} />
                      {st.label}
                    </span>
                  )
                })()}
              </div>
              <div>
                <p className="text-[11px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Mensualidad</p>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>S/ {Number(viewing.pricePerParent).toFixed(2)} / familia</p>
              </div>
              <div>
                <p className="text-[11px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Familias aportantes</p>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{Number(viewing.parentCount).toLocaleString("es-PE")}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Total mensual</p>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>S/ {Number(viewing.monthlyAmount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Inicio</p>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                  {new Date(viewing.startedAt).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Vencimiento</p>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                  {viewing.expiresAt
                    ? new Date(viewing.expiresAt).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })
                    : "Sin vencimiento"}
                </p>
              </div>
            </div>

            {viewing.notes && (
              <div>
                <p className="text-[11px] font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Notas</p>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{viewing.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── FORM MODAL ── */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Editar suscripción" : "Asignar plan"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block sa-eyebrow mb-1.5">Institución</label>
            {editing ? (
              <input
                value={editing.institutionName ?? ""}
                disabled
                className="sa-input opacity-70 cursor-not-allowed"
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
              <p className="mt-2 text-[11px]" style={{ color: "var(--muted-foreground)" }}>Todas las instituciones ya tienen suscripción.</p>
            )}
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5">Plan</label>
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
              <label className="block sa-eyebrow mb-1.5">S/ por familia</label>
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
                className="sa-input"
              />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">N° familias aportantes</label>
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
                className="sa-input"
              />
            </div>
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5">Monto mensual (S/)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.monthlyAmount}
              onChange={(e) => setForm((p) => ({ ...p, monthlyAmount: e.target.value }))}
              className="sa-input"
              placeholder="Se calcula automáticamente"
            />
            <p className="mt-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              Auto: S/ {Number(form.pricePerParent || 0).toFixed(2)} × {form.parentCount || 0} = S/{" "}
              {computeMonthly(form.pricePerParent, form.parentCount) || "0.00"}
            </p>
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5">Fecha de vencimiento (opcional)</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
              className="sa-input"
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5">Notas (opcional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="sa-input"
              style={{ borderRadius: "18px", resize: "none" }}
              placeholder="Comprobante, contacto, etc."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowForm(false)}
            className="sa-btn sa-btn-ghost flex-1"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="sa-btn sa-btn-primary flex-1"
          >
            {loading ? "Guardando..." : editing ? "Actualizar" : "Activar plan"}
          </button>
        </div>
      </Modal>
    </div>
  )
}
