"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Modal from "@/components/Modal"
import Select from "@/components/Select"
import { motion } from "framer-motion"

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
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Publica un aviso para la comunidad educativa</p>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm sa-surface p-4"
            style={{ color: "#ef4444" }}
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="sa-input w-full"
              required
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Contenido *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="sa-input w-full"
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Tipo</label>
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
              <label className="block sa-eyebrow mb-1.5" style={{ color: "var(--muted-foreground)" }}>Prioridad</label>
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
            <button type="button" onClick={close} className="sa-btn sa-btn-ghost flex-1 text-sm py-2.5">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="sa-btn sa-btn-primary flex-1 text-sm py-2.5"
            >
              {submitting ? "Guardando..." : "Publicar Comunicado"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
