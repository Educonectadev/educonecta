"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"

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

const STATUS_STYLES: Record<string, string> = {
  NUEVO: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  EN_CONTACTO: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  CERRADO: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700",
}

const POLL_INTERVAL_MS = 5000

export default function SolicitudesList({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [messages, setMessages] = useState<LeadMessage[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const lastServerTimeRef = useRef<string>(new Date().toISOString())
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const unreadCount = leads.filter((l) => l.unreadByAdmin).length

  // Polling de leads nuevos
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
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  // Polling de mensajes del chat abierto
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
    return () => {
      cancelled = true
      clearInterval(t)
    }
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
    } finally {
      setSending(false)
    }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Solicitudes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Colegios que pidieron contacto desde /planes.{" "}
          {unreadCount > 0 && (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {unreadCount} sin leer
            </span>
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {leads.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-400 dark:text-zinc-500">
            Aún no hay solicitudes.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {leads.map((l) => (
              <li
                key={l.id}
                onClick={() => openLead(l)}
                className={
                  "p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50 " +
                  (selected?.id === l.id ? "bg-gray-50 dark:bg-zinc-800/50" : "")
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900 dark:text-white/90 truncate">
                        {l.institutionName}
                      </p>
                      {l.unreadByAdmin && (
                        <span className="shrink-0 inline-flex size-2 rounded-full bg-emerald-500" aria-label="No leído" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400 truncate">
                      {l.directorName} · {l.email}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${STATUS_STYLES[l.status] ?? ""}`}>
                    {l.status === "NUEVO" ? "Nuevo" : l.status === "EN_CONTACTO" ? "En contacto" : "Cerrado"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-zinc-500">
                  {new Date(l.createdAt).toLocaleString("es-PE")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

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
              <span className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-zinc-500">Estado:</span>
              {(["NUEVO", "EN_CONTACTO", "CERRADO"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(selected, s)}
                  className={
                    "text-[11px] rounded-full px-2.5 py-1 font-medium transition-colors duration-200 border " +
                    (selected.status === s
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-emerald-300 hover:text-emerald-600")
                  }
                >
                  {s === "NUEVO" ? "Nuevo" : s === "EN_CONTACTO" ? "En contacto" : "Cerrado"}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30 p-3 max-h-72 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-6">Sin mensajes aún. Escribe abajo para iniciar la conversación.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={"flex " + (m.authorRole === "ADMIN" ? "justify-end" : "justify-start")}>
                    <div
                      className={
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm " +
                        (m.authorRole === "ADMIN"
                          ? "bg-emerald-600 text-white"
                          : "bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700")
                      }
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={"mt-1 text-[10px] " + (m.authorRole === "ADMIN" ? "text-emerald-100" : "text-gray-400")}>
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
                className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !draft.trim()}
                className="rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
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
      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-zinc-500">{label}</p>
      {link ? (
        <a href={link} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">{value}</a>
      ) : (
        <p className="text-sm text-gray-800 dark:text-zinc-200">{value}</p>
      )}
    </div>
  )
}