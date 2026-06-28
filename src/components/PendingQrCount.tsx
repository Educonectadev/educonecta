"use client"

import { useEffect, useState } from "react"

const POLL_INTERVAL_MS = 10000

export function PendingQrCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // El endpoint devuelve un objeto {leads:[]} o un array directo según versión.
        // Usamos fetch con credentials y leemos la longitud de la respuesta.
        const res = await fetch("/api/teacher/asistencia/qr/pending-count")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setCount(Number(data.count ?? 0))
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
    <span className="absolute top-2 right-2 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  )
}