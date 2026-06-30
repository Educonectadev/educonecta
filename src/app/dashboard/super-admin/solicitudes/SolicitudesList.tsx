"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import NeonCard from "@/components/premium/NeonCard"
import { getIcon } from "@/components/premium/iconRegistry"
import { motion, AnimatePresence } from "framer-motion"

interface Lead {
  id: number
  institutionName: string
  directorName: string
  email: string
  phone: string
  plan: string | null
  status: "NUEVO" | "EN_CONTACTO" | "CERRADO"
  notes: string | null
  unreadByAdmin: boolean
  createdAt: string
  updatedAt: string
}

interface LeadMessage {
  id: number
  leadId: number
  authorRole: "LEAD" | "ADMIN"
  authorName: string | null
  body: string
  readByAdmin: boolean
  createdAt: string
}

const STATUS_LABELS: Record<Lead["status"], string> = {
  NUEVO: "Nuevo",
  EN_CONTACTO: "En contacto",
  CERRADO: "Cerrado",
}

const STATUS_ICONS: Record<Lead["status"], string> = {
  NUEVO: "spark",
  EN_CONTACTO: "chat",
  CERRADO: "check",
}

function statusStyle(s: Lead["status"]) {
  if (s === "NUEVO") {
    return { color: "var(--accent)", bg: "color-mix(in srgb, var(--accent) 14%, transparent)" }
  }
  if (s === "EN_CONTACTO") {
    return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.14)" }
  }
  return { color: "var(--muted-foreground)", bg: "var(--surface-3)" }
}

const POLL_INTERVAL_MS = 5000

export default function SolicitudesList({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [messages, setMessages] = useState<LeadMessage[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState<"ALL" | Lead["status"]>("ALL")
  const lastServerTimeRef = useRef<string>(new Date().toISOString())
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const unreadCount = leads.filter((l) => l.unreadByAdmin).length

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const res = await fetch(`/api/super-admin/leads?since=${encodeURIComponent(lastServerTimeRef.current)}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (Array.isArray(data.leads) && data.leads.length > 0) {
          setLeads((prev) => {
            const map = new Map(prev.map((l) => [l.id, l]))
            for (const u of data.leads) map.set(u.id, { ...(map.get(u.id) ?? u), ...u })
            return Array.from(map.values()).sort((a, b) => {
              if (a.status === "NUEVO" && b.status !== "NUEVO") return -1
              if (b.status === "NUEVO" && a.status !== "NUEVO") return 1
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })
          })
          const nuevos = data.leads.filter((u: Lead) => u.unreadByAdmin)
          if (nuevos.length > 0) {
            toast(`Nueva solicitud: ${nuevos[0].institutionName}`)
          }
        }
        if (data.serverTime) lastServerTimeRef.current = data.serverTime
      } catch {}
    }
    const t = setInterval(poll, POLL_INTERVAL_MS)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  useEffect(() => {
    if (!selected) return
    let lastTime = new Date().toISOString()
    setMessages([])
    let cancelled = false
    async function loadAll() {
      try {
        const res = await fetch(`/api/super-admin/leads/${selected!.id}/messages`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setMessages(data.messages ?? [])
          const last = (data.messages ?? []).at(-1)
          if (last) lastTime = last.createdAt
        }
      } catch {}
    }
    loadAll()
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/super-admin/leads/${selected!.id}/messages?since=${encodeURIComponent(lastTime)}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id))
            return [...prev, ...data.messages.filter((m: LeadMessage) => !ids.has(m.id))]
          })
          const last = data.messages.at(-1)
          if (last) lastTime = last.createdAt
        }
      } catch {}
    }, POLL_INTERVAL_MS)
    return () => { cancelled = true; clearInterval(t) }
  }, [selected])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const openLead = useCallback(async (lead: Lead) => {
    setSelected(lead)
    setMessages([])
    if (lead.unreadByAdmin) {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, unreadByAdmin: false } : l)))
      try {
        await fetch("/api/super-admin/leads", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: lead.id, unreadByAdmin: false }),
        })
      } catch {}
    }
  }, [])

  async function sendMessage() {
    if (!selected) return
    const text = draft.trim()
    if (!text) return
    setSending(true)
    try {
      const res = await fetch(`/api/super-admin/leads/${selected.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
        setDraft("")
        setLeads((prev) =>
          prev.map((l) => (l.id === selected.id ? { ...l, status: "EN_CONTACTO" } : l))
        )
      } else {
        toast.danger("No se pudo enviar el mensaje")
      }
    } finally { setSending(false) }
  }

  async function changeStatus(lead: Lead, status: Lead["status"]) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)))
    if (selected?.id === lead.id) setSelected({ ...lead, status })
    try {
      await fetch("/api/super-admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, status }),
      })
    } catch {}
  }

  const counts = {
    ALL: leads.length,
    NUEVO: leads.filter((l) => l.status === "NUEVO").length,
    EN_CONTACTO: leads.filter((l) => l.status === "EN_CONTACTO").length,
    CERRADO: leads.filter((l) => l.status === "CERRADO").length,
  }

  const filteredLeads = filter === "ALL" ? leads : leads.filter((l) => l.status === filter)

  const metricItems = [
    { key: "ALL" as const, label: "Todas", value: counts.ALL, icon: "inbox", color: "var(--foreground)" },
    { key: "NUEVO" as const, label: "Nuevas", value: counts.NUEVO, icon: "spark", color: "var(--accent)" },
    { key: "EN_CONTACTO" as const, label: "En contacto", value: counts.EN_CONTACTO, icon: "chat", color: "#f59e0b" },
    { key: "CERRADO" as const, label: "Cerradas", value: counts.CERRADO, icon: "check", color: "var(--muted-foreground)" },
  ]

  return (
    <div className="space-y-6 pt-4 md:pt-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="sa-eyebrow">Pipeline comercial</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Solicitudes</h1>
          {unreadCount > 0 && (
            <p className="text-sm mt-1.5">
              <span className="font-semibold" style={{ color: "var(--accent)" }}>
                {unreadCount} sin leer
              </span>
            </p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {metricItems.map((m) => (
          <motion.button
            key={m.key}
            onClick={() => setFilter(m.key)}
            whileTap={{ scale: 0.97 }}
            className="sa-surface p-3 md:p-4 flex items-center gap-3 text-left cursor-pointer"
            style={{
              borderColor: filter === m.key ? m.color : undefined,
              boxShadow: filter === m.key ? `0 0 0 1px ${m.color}` : undefined,
            }}
          >
            <span
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${m.color} 16%, transparent)`, color: m.color }}
            >
              {getIcon(m.icon, { size: 16, strokeWidth: 2 })}
            </span>
            <div className="min-w-0">
              <p className="text-lg md:text-xl font-bold tracking-tight">{m.value}</p>
              <p className="text-[10px] text-[color:var(--muted-foreground)] font-medium truncate">{m.label}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {filteredLeads.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "var(--surface-3)" }}>
            {getIcon("inbox", { size: 28, strokeWidth: 1.6 })}
          </span>
          <p className="text-sm font-medium mb-1">Sin solicitudes</p>
          <p className="text-xs text-[color:var(--muted-foreground)] max-w-xs mx-auto">
            {filter === "ALL"
              ? "No hay solicitudes de contacto aún. Cuando un colegio se registre desde la página de planes, aparecerá aquí."
              : `No hay solicitudes en estado "${metricItems.find((m) => m.key === filter)?.label.toLowerCase()}".`}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredLeads.map((l, idx) => {
              const ss = statusStyle(l.status)
              return (
                <motion.li
                  layout
                  key={l.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: idx * 0.02 }}
                >
                  <article
                    onClick={() => openLead(l)}
                    className={
                      "sa-surface sa-surface-hover p-4 md:p-5 cursor-pointer relative " +
                      (selected?.id === l.id ? "ring-1 ring-[color:var(--accent)]" : "") +
                      (l.unreadByAdmin ? " sa-accent-border" : "")
                    }
                  >
                    {l.unreadByAdmin && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                        Nuevo
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className="w-10 h-10 rounded-2xl flex items-center justify-center font-semibold text-sm shrink-0"
                          style={{
                            background: l.status === "NUEVO"
                              ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                              : "var(--surface-3)",
                            border: "1px solid var(--surface-border)",
                            color: l.status === "NUEVO" ? "var(--accent)" : "var(--muted-foreground)",
                          }}
                        >
                          {l.institutionName.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">{l.institutionName}</p>
                          </div>
                          <p className="text-[11px] text-[color:var(--muted-foreground)] truncate">
                            {l.directorName}
                          </p>
                        </div>
                      </div>
                      <span
                        className="sa-chip shrink-0"
                        style={{ color: ss.color, backgroundColor: ss.bg, borderColor: "transparent" }}
                      >
                        {getIcon(STATUS_ICONS[l.status], { size: 10, strokeWidth: 2.5 })}
                        {STATUS_LABELS[l.status]}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[color:var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        {getIcon("mail", { size: 11, strokeWidth: 2 })}
                        {l.email}
                      </span>
                      {l.phone && (
                        <span className="flex items-center gap-1">
                          {getIcon("devices", { size: 11, strokeWidth: 2 })}
                          {l.phone}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        {l.plan && (
                          <span className="sa-chip" style={{ padding: "0.1rem 0.5rem", fontSize: "0.65rem" }}>
                            {getIcon("rocket", { size: 9, strokeWidth: 2.5 })}
                            {l.plan}
                          </span>
                        )}
                      </div>
                      <span className="text-[color:var(--muted-foreground)]">
                        {timeAgo(l.createdAt)}
                      </span>
                    </div>
                  </article>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.institutionName : ""}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Director" value={selected.directorName} />
              <Field label="Plan de interés" value={selected.plan ? selected.plan : "—"} />
              <Field label="Email" value={selected.email} link={`mailto:${selected.email}`} />
              <Field label="Teléfono" value={selected.phone} link={`tel:${selected.phone}`} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="sa-eyebrow">Estado:</span>
              {(["NUEVO", "EN_CONTACTO", "CERRADO"] as const).map((s) => {
                const active = selected.status === s
                return (
                  <button
                    key={s}
                    onClick={() => changeStatus(selected, s)}
                    className={
                      "sa-btn text-[11px] py-1 px-3 " +
                      (active ? "sa-btn-primary" : "sa-btn-outline")
                    }
                  >
                    {STATUS_LABELS[s]}
                  </button>
                )
              })}
            </div>

            <div className="sa-surface-flat p-3 max-h-72 overflow-y-auto space-y-2 sa-scroll">
              {messages.length === 0 ? (
                <p className="text-xs text-center text-[color:var(--muted-foreground)] py-6">
                  Sin mensajes aún. Escribe abajo para iniciar la conversación.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={"flex " + (m.authorRole === "ADMIN" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
                      style={
                        m.authorRole === "ADMIN"
                          ? { background: "var(--accent)", color: "#0a0a0c" }
                          : { background: "var(--surface-3)", color: "var(--foreground)", border: "1px solid var(--surface-border)" }
                      }
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className="mt-1 text-[10px] opacity-70">
                        {m.authorName ?? (m.authorRole === "ADMIN" ? "Tú" : "Visitante")} · {new Date(m.createdAt).toLocaleString("es-PE")}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Escribe una respuesta…"
                className="sa-input"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !draft.trim()}
                className="sa-btn sa-btn-primary"
              >
                {sending ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Field({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <p className="sa-eyebrow">{label}</p>
      {link ? (
        <a href={link} className="text-sm sa-accent-text hover:underline">{value}</a>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const d = new Date(dateStr).getTime()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "ahora"
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `hace ${days}d`
  return new Date(dateStr).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })
}
