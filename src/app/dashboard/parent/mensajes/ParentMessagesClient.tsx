"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Teacher {
  userId: number
  teacherId: number
  name: string
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

export default function ParentMessagesClient({
  teachers,
  lastMessages,
  parentUserId,
  parentName,
}: {
  teachers: Teacher[]
  lastMessages: Message[]
  parentUserId: number
  parentName: string
}) {
  const [selected, setSelected] = useState<Teacher | null>(teachers[0] ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const lastServerTime = useRef<string>(new Date().toISOString())

  const conversationsByTeacher = new Map<number, Message>()
  for (const m of lastMessages) {
    if (!conversationsByTeacher.has(m.teacherUserId)) conversationsByTeacher.set(m.teacherUserId, m)
  }

  function lastForTeacher(t: Teacher) {
    return conversationsByTeacher.get(t.userId)
  }

  async function loadConversation(teacher: Teacher) {
    setMessages([])
    try {
      const res = await fetch(`/api/messages/parent-teacher?teacherUserId=${teacher.userId}`)
      if (!res.ok) return
      const data = await res.json()
      const list: Message[] = data.messages ?? []
      setMessages(list)
      if (list.length > 0) lastServerTime.current = list[list.length - 1].createdAt
    } catch {}
  }

  useEffect(() => {
    if (selected) loadConversation(selected)
  }, [selected])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    const t = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/messages/parent-teacher?teacherUserId=${selected.userId}&since=${encodeURIComponent(lastServerTime.current)}`
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
        body: JSON.stringify({ teacherUserId: selected.userId, body: text }),
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
      <header>
        <p className="sa-eyebrow" style={{ color: "var(--muted-foreground)" }}>Mensajes</p>
        <h1 className="text-2xl font-bold tracking-tight font-display" style={{ color: "var(--foreground)" }}>Mensajes</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Conversaci&oacute;n directa con los docentes de tus hijos.</p>
      </header>

      {teachers.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)" }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sin docentes asignados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>A&uacute;n no tienes docentes asignados para chatear.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.aside
            className="sa-surface overflow-hidden"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto" style={{ borderBottom: "1px solid var(--surface-border)" }}>
              {teachers.map((t) => {
                const last = lastForTeacher(t)
                const active = selected?.userId === t.userId
                return (
                  <li key={t.userId} style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <button
                      onClick={() => setSelected(t)}
                      className="w-full text-left p-4 transition-colors"
                      style={active ? { background: "rgba(217, 119, 6, 0.06)" } : {}}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--surface-2)" }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "" }}
                    >
                      <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{t.name}</p>
                      <p className="mt-0.5 text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                        {last ? last.body : "Sin mensajes a&uacute;n"}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.aside>

          <motion.section
            className="md:col-span-2 sa-surface flex flex-col h-[70vh]"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {selected ? (
              <>
                <header className="px-5 py-3" style={{ borderBottom: "1px solid var(--surface-border)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{selected.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Docente</p>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-xs text-center py-10" style={{ color: "var(--muted-foreground)" }}>
                      Escribe abajo para iniciar la conversaci&oacute;n.
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={"flex " + (m.fromRole === "PARENT" ? "justify-end" : "justify-start")}>
                        <div
                          className="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
                          style={m.fromRole === "PARENT"
                            ? { background: "#d97706", color: "white" }
                            : { background: "var(--surface-2)", color: "var(--foreground)" }
                          }
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <p className="mt-1 text-[10px]"
                            style={m.fromRole === "PARENT" ? { color: "rgba(255,255,255,0.7)" } : { color: "var(--muted-foreground)" }}>
                            {new Date(m.createdAt).toLocaleString("es-PE", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={endRef} />
                </div>
                <div className="p-3 flex gap-2" style={{ borderTop: "1px solid var(--surface-border)" }}>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        send()
                      }
                    }}
                    placeholder="Escribe un mensaje&hellip;"
                    className="flex-1 min-w-0 sa-input text-sm"
                  />
                  <button
                    onClick={send}
                    disabled={sending || !draft.trim()}
                    aria-label="Enviar mensaje"
                    className="shrink-0 inline-flex items-center justify-center size-11 rounded-full transition-colors duration-200 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "#d97706" }}
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
                Selecciona un docente
              </div>
            )}
          </motion.section>
        </div>
      )}
    </div>
  )
}
