"use client"

import { useState } from "react"

interface Props {
  label?: string
  icon?: string
  className?: string
}

export default function DownloadAppButton({ label = "Descargar aplicación", icon = "download", className = "" }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch("/api/download-installer")
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.error || "Error al descargar")
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition") || ""
      const match = disposition.match(/filename="?(.+?)"?$/)
      const filename = match?.[1] || "EduConecta-instalador"
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex items-center justify-start gap-3 rounded-[30px] px-4 py-2.5 text-sm font-medium transition-colors w-full hover:bg-default-100 dark:hover:bg-default-50 ${className}`}
    >
      <span className={`material-icons text-lg ${loading ? "animate-spin" : "opacity-40"}`}>
        {loading ? "sync" : icon}
      </span>
      <span className="flex-1 text-left truncate">{loading ? "Descargando..." : label}</span>
    </button>
  )
}
