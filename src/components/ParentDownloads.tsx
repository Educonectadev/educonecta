"use client"

import { useState } from "react"

export default function ParentDownloads({ studentId }: { studentId?: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  async function download(tipo: "calificaciones" | "asistencia") {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tipo })
      if (studentId) params.set("studentId", String(studentId))
      window.open(`/api/parent/documents?${params.toString()}`, "_blank")
      setDone(tipo)
      setTimeout(() => setDone(null), 2500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-[30px] bg-amber-500 hover:bg-amber-600 transition-colors duration-200 px-5 py-2 text-xs font-medium text-white"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Descargar
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg z-10 overflow-hidden">
          <button
            onClick={() => { download("calificaciones"); setOpen(false) }}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3"
          >
            <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white/90">Boleta de notas</p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">PDF con calificaciones</p>
            </div>
          </button>
          <button
            onClick={() => { download("asistencia"); setOpen(false) }}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 border-t border-gray-100 dark:border-zinc-800"
          >
            <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white/90">Reporte de asistencia</p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">PDF de los últimos 60 días</p>
            </div>
          </button>
        </div>
      )}
      {done && (
        <p className="absolute right-0 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
          {done === "calificaciones" ? "Generando boleta…" : "Generando reporte…"}
        </p>
      )}
    </div>
  )
}