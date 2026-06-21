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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Comunicado</h1>
        <Link
          href="/dashboard/teacher/comunicados"
          className="text-sm text-gray-400 hover:text-black transition-colors"
        >
          Cancelar
        </Link>
      </div>

      {error && (
        <p className="mb-6 text-sm border border-gray-100 rounded-[30px] p-4 bg-gray-50 text-gray-600">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">Contenido *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
            rows={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm bg-white focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option value="general">General</option>
            <option value="important">Importante</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">Prioridad</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm bg-white focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
          >
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 text-white px-8 py-3 rounded-[25px] text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Publicar Comunicado"}
        </button>
      </form>
    </div>
  )
}
