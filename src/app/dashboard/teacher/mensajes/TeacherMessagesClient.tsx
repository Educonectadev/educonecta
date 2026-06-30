"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { getIcon } from "@/components/premium/iconRegistry"

interface Parent {
  userId: number
  name: string
  studentId: number
  studentName: string
}
interface Message {
  id: number
  parentUserId: number
  teacherUserId: number
  studentId: number | null
  fromRole: "PARENT" | "TEACHER"
  fromName: string | null
  body: string
  createdAt: string
}

export default function TeacherMessagesClient({
  parents,
  lastMessages,
  teacherUserId,
  teacherName,
}: {
  parents: Parent[]
  lastMessages: Message[]
  teacherUserId: number
  teacherName: string
}) {
  const [selected, setSelected] = useState<Parent | null>(parents[0] ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const lastServerTime = useRef<string>(new Date().toISOString())

  const byParent = new Map<number, Message>()
  for (const m of lastMessages) {
    if (!byParent.has(m.parentUserId)) byParent.set(m.parentUserId, m)
  }

  async function load(p: Parent) {
    setMessages([])
    try {
      const res = await fetch(`/api/messages/parent-teacher?parentUserId=${p.userId}`)
      if (!res.ok) return
      const data = await res.json()
      const list: Message[] = data.messages ?? []
      setMessages(list)
      if (list.length > 0) lastServerTime.current = list[list.length - 1].createdAt
    } catch {}
  }

  useEffect(() => {
    if (selected) load(selected)
  }, [selected])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    const t = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/messages/parent-teacher?parentUserId=${selected.userId}&since=${encodeURIComponent(lastServerTime.current)}`
        )
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const newOnes: Message[] = data.messages ?? []
        if (newOnes.length > 0) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id))
            return [...prev, ...newOnes.filter((m) => !ids.has(m.id))]
          })
          lastServerTime.current = newOnes[newOnes.length - 1].createdAt
        }
      } catch {}
    }, 5000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [selected])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    if (!selected) return
    const text = draft.trim()
    if (!text) return
    setSending(true)
    try {
      const res = await fetch("/api/messages/parent-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentUserId: selected.userId, studentId: selected.studentId, body: text }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
        setDraft("")
        lastServerTime.current = data.message.createdAt
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <div>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Docente / Mensajes</p>
        <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mensajes</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Conversación directa con los padres de tus estudiantes.</p>
      </div>

      {parents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          className="sa-surface py-14 md:py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            {getIcon("chat", { className: "w-6 h-6", style: { color: "var(--muted-foreground)" } })}
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Aún no tienes apoderados para chatear.</p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>
            Los padres de tus estudiantes aparecerán aquí cuando se vinculen a la plataforma.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <aside className="sa-surface overflow-hidden">
            <ul className="divide-y max-h-[60vh] md:max-h-[70vh] overflow-y-auto" style={{ borderColor: "var(--surface-border)" }}>
              {parents.map((p) => {
                const last = byParent.get(p.userId)
                const active = selected?.userId === p.userId
                return (
                  <li key={p.userId}>
                    <button
                      onClick={() => setSelected(p)}
                      className="w-full text-left p-4 transition-colors"
                      style={{
                        background: active ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent",
                        color: "var(--foreground)",
                      }}
                    >
                      <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{p.name}</p>
                      <p className="text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>{p.studentName}</p>
                      <p className="mt-0.5 text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                        {last ? last.body : "Sin mensajes aún"}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          <section className="md:col-span-2 sa-surface flex flex-col h-[70vh]">
            {selected ? (
              <>
                <header className="px-5 py-3 border-b" style={{ borderColor: "var(--surface-border)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{selected.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Apoderado de {selected.studentName}</p>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-xs text-center py-10" style={{ color: "var(--muted-foreground)" }}>
                      Escribe abajo para iniciar la conversación.
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={"flex " + (m.fromRole === "TEACHER" ? "justify-end" : "justify-start")}>
                        <div
                          className="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
                          style={
                            m.fromRole === "TEACHER"
                              ? { background: "var(--accent)", color: "var(--foreground)" }
                              : { background: "var(--surface-3)", color: "var(--foreground)" }
                          }
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <p className="mt-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                            {new Date(m.createdAt).toLocaleString("es-PE", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={endRef} />
                </div>
                <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--surface-border)" }}>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        send()
                      }
                    }}
                    placeholder="Escribe un mensaje…"
                    className="flex-1 min-w-0 sa-input"
                    style={{ color: "var(--foreground)", background: "var(--surface)" }}
                  />
                  <button
                    onClick={send}
                    disabled={sending || !draft.trim()}
                    aria-label="Enviar mensaje"
                    className="shrink-0 inline-flex items-center justify-center size-11 rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "var(--accent)", color: "var(--foreground)" }}
                  >
                    {sending ? (
                      <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="9" strokeDasharray="42" strokeDashoffset="14" />
                      </svg>
                    ) : (
                      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2 11 13" />
                        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                Selecciona un apoderado
              </div>
            )}
          </section>
        </motion.div>
      )}
    </div>
  )
}
