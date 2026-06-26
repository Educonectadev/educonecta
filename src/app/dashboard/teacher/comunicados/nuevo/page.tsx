"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Modal from "@/components/Modal"
import Select from "@/components/Select"

export default function NuevoComunicadoPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState("general")
  const [priority, setPriority] = useState("normal")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  function close() {
    setOpen(false)
    router.push("/dashboard/teacher/comunicados")
  }

  async function handleSubmit(e: React.FormEvent) {
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
    <Modal open={open} onClose={close} title="Nuevo Comunicado" size="lg" scroll="inside">
      <div className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-zinc-500">Publica un aviso para la comunidad educativa</p>

        {error && (
          <p className="text-sm border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Tipo</label>
              <Select
                value={type}
                onChange={setType}
                options={[
                  { value: "general", label: "General" },
                  { value: "important", label: "Importante" },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Prioridad</label>
              <Select
                value={priority}
                onChange={setPriority}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "Alta" },
                ]}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={close} className="flex-1 rounded-[30px] border border-gray-200 dark:border-zinc-700 py-2.5 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium"
            >
              {submitting ? "Guardando..." : "Publicar Comunicado"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
