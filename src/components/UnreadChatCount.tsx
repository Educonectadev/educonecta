"use client"

import { useEffect, useState } from "react"

const POLL_INTERVAL_MS = 8000

interface ChatItem {
  parentUserId: number
  teacherUserId: number
  studentId: number | null
  fromRole: "PARENT" | "TEACHER"
  body: string
  createdAt: string
}

export function UnreadChatCount({ role }: { role: "TEACHER" | "PARENT" }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/messages/parent-teacher")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const list: ChatItem[] = data.messages ?? []
        const unread = list.filter((m) =>
          role === "TEACHER" ? m.fromRole === "PARENT" : m.fromRole === "TEACHER"
        ).length
        setCount(unread)
      } catch {}
    }
    load()
    const t = setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [role])

  if (count <= 0) return null
  return (
    <span className="absolute top-2 right-2 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  )
}