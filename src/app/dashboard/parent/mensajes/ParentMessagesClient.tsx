"use client"

import { useEffect, useRef, useState } from "react"

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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mensajes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Conversación directa con los docentes de tus hijos.</p>
      </div>

      {teachers.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-gray-400 dark:text-zinc-500">
          Aún no tienes docentes asignados para chatear.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <aside className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-zinc-800 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
              {teachers.map((t) => {
                const last = lastForTeacher(t)
                const active = selected?.userId === t.userId
                return (
                  <li key={t.userId}>
                    <button
                      onClick={() => setSelected(t)}
                      className={
                        "w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors " +
                        (active ? "bg-amber-50 dark:bg-amber-950/30" : "")
                      }
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white/90 truncate">{t.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400 truncate">
                        {last ? last.body : "Sin mensajes aún"}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          <section className="md:col-span-2 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-[70vh]">
            {selected ? (
              <>
                <header className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white/90">{selected.name}</p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500">Docente</p>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-xs text-center text-gray-400 dark:text-zinc-500 py-10">
                      Escribe abajo para iniciar la conversación.
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={"flex " + (m.fromRole === "PARENT" ? "justify-end" : "justify-start")}>
                        <div
                          className={
                            "max-w-[75%] rounded-2xl px-3 py-2 text-sm " +
                            (m.fromRole === "PARENT"
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-100")
                          }
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <p className={"mt-1 text-[10px] " + (m.fromRole === "PARENT" ? "text-amber-100 dark:text-amber-200" : "text-gray-400 dark:text-zinc-500")}>
                            {new Date(m.createdAt).toLocaleString("es-PE", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={endRef} />
                </div>
                <div className="p-3 border-t border-gray-100 dark:border-zinc-800 flex gap-2">
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
                    className="flex-1 min-w-0 rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white/90 px-4 py-2.5 text-sm focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-amber-400 transition-colors"
                  />
                  <button
                    onClick={send}
                    disabled={sending || !draft.trim()}
                    aria-label="Enviar mensaje"
                    className="shrink-0 inline-flex items-center justify-center size-11 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors duration-200 text-white disabled:opacity-40 disabled:cursor-not-allowed"
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
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-zinc-500">
                Selecciona un docente
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}