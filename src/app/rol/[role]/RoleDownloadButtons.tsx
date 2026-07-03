"use client"

import { useState, useEffect } from "react"

const platforms = [
  { id: "win", label: "Windows", icon: "💻" },
  { id: "mac", label: "macOS", icon: "🍎" },
  { id: "linux", label: "Linux", icon: "🐧" },
] as const

export default function RoleDownloadButtons({ role }: { role: string }) {
  const [detected, setDetected] = useState<string | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent
    if (ua.includes("Windows")) setDetected("win")
    else if (ua.includes("Mac OS") || ua.includes("iPad") || ua.includes("iPhone")) setDetected("mac")
    else if (ua.includes("Linux")) setDetected("linux")
  }, [])

  async function handleDownload(platform: string) {
    try {
      const res = await fetch(`/api/download/public/${role}?platform=${platform}`)
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.error || "Error al descargar")
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition") || ""
      const match = disposition.match(/filename="?(.+?)"?$/)
      const filename = match?.[1] || `EduConecta-${role}-${platform}`
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert("Error al descargar")
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {platforms.map((p) => (
        <button
          key={p.id}
          onClick={() => handleDownload(p.id)}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border transition-colors ${
            detected === p.id
              ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
              : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
          }`}
        >
          <span>{p.icon}</span>
          {p.label}
        </button>
      ))}
    </div>
  )
}
