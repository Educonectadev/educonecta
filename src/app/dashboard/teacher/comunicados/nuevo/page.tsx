"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

export default function NuevoComunicadoPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState("general")
  const [priority, setPriority] = useState("normal")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) {
      setError("Completa los campos obligatorios.")
      return
    }
    setSubmitting(true)
    setError("")

    const res = await fetch("/api/teacher/communications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, type, priority }),
    })

    const result = await res.json()
    setSubmitting(false)
    if (result.success) {
      router.push("/dashboard/teacher/comunicados")
    } else {
      setError("Error al crear el comunicado.")
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Nuevo Comunicado</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Publica un aviso para la comunidad educativa</p>
        </div>
        <Link
          href="/dashboard/teacher/comunicados"
          className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancelar
        </Link>
      </div>

      {error && (
        <p className="text-sm border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Contenido *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-[25px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            rows={6}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            >
              <option value="general">General</option>
              <option value="important">Importante</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
            >
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary rounded-[30px] px-8 py-3 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Publicar Comunicado"}
        </button>
      </form>
    </div>
  )
}