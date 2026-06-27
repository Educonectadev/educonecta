"use client"

import { useEffect, useState } from "react"

const POLL_INTERVAL_MS = 5000

export default function SolicitudesBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    let lastSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    async function load() {
      try {
        const res = await fetch(`/api/super-admin/leads?since=${encodeURIComponent(lastSince)}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const list = Array.isArray(data.leads) ? data.leads : []
        const unread = list.filter((l: any) => l.unreadByAdmin).length
        setCount(unread)
        if (data.serverTime) lastSince = data.serverTime
      } catch {}
    }

    load()
    const t = setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  if (count <= 0) return null

  return (
    <span
      aria-label={`${count} solicitudes sin leer`}
      className="ml-auto inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}