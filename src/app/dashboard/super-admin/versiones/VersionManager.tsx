"use client"

import { useState } from "react"
import { toast } from "@heroui/react"
import { motion, AnimatePresence } from "framer-motion"
import NeonCard from "@/components/premium/NeonCard"
import IconTile, { getIcon } from "@/components/premium/IconTile"

interface Version {
  id: number
  version: string
  title: string | null
  description: string | null
  isCurrent: boolean
  createdAt: string
}

export default function VersionManager({ versiones: initial }: { versiones: Version[] }) {
  const [versiones, setVersiones] = useState<Version[]>(initial)
  const [version, setVersion] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isCurrent, setIsCurrent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!version.trim()) return
    setLoading(true)

    const method = editing ? "PUT" : "POST"
    const url = editing ? `/api/super-admin/versiones?id=${editing}` : "/api/super-admin/versiones"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: version.trim(), title: title.trim() || null, description: description.trim() || null, isCurrent }),
    })

    if (res.ok) {
      const data = await res.json()
      if (editing) {
        setVersiones((prev) => prev.map((v) => (v.id === editing ? data : v)))
      } else {
        setVersiones((prev) => [data, ...prev])
      }
      setVersion("")
      setTitle("")
      setDescription("")
      setIsCurrent(false)
      setEditing(null)
    } else {
      const err = await res.json()
      toast.danger(err.error)
    }
    setLoading(false)
  }

  async function handleSetCurrent(v: Version) {
    const res = await fetch(`/api/super-admin/versiones?id=${v.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCurrent: true }),
    })
    if (res.ok) {
      const data = await res.json()
      setVersiones((prev) => prev.map((x) => ({ ...x, isCurrent: x.id === data.id })))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta versión?")) return
    const res = await fetch(`/api/super-admin/versiones?id=${id}`, { method: "DELETE" })
    if (res.ok) setVersiones((prev) => prev.filter((v) => v.id !== id))
  }

  function handleEdit(v: Version) {
    setEditing(v.id)
    setVersion(v.version)
    setTitle(v.title ?? "")
    setDescription(v.description ?? "")
    setIsCurrent(v.isCurrent)
  }

  function handleCancel() {
    setEditing(null)
    setVersion("")
    setTitle("")
    setDescription("")
    setIsCurrent(false)
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_2fr] items-start pt-4 md:pt-6">
      <NeonCard hoverable={false} delay={0.05}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3">
            <IconTile name={editing ? "edit" : "rocket"} size={16} filled active />
            <h2 className="text-base font-semibold">{editing ? "Editar Versión" : "Nueva Versión"}</h2>
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5">Versión *</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="v1.0.0"
              className="sa-input"
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lanzamiento inicial"
              className="sa-input"
            />
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Novedades de esta versión..."
              rows={3}
              className="sa-input"
              style={{ borderRadius: "18px", resize: "none" }}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-[color:var(--muted-foreground)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="accent-current size-4"
              style={{ accentColor: "var(--neon)" }}
            />
            Marcar como versión actual
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !version.trim()}
              className="sa-btn sa-btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? "Guardando..." : editing ? "Actualizar" : "Registrar"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleCancel}
                className="sa-btn sa-btn-ghost"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </NeonCard>

      <div className="space-y-3">
        {versiones.length === 0 ? (
          <NeonCard hoverable={false} className="text-center">
            <div className="py-8">
              {getIcon("history", { size: 28, strokeWidth: 1.6, className: "mx-auto mb-3 opacity-50" })}
              <p className="text-sm text-[color:var(--muted-foreground)]">No hay versiones registradas</p>
            </div>
          </NeonCard>
        ) : (
          <motion.ul layout className="space-y-3">
            <AnimatePresence mode="popLayout">
              {versiones.map((v, idx) => (
                <motion.li
                  layout
                  key={v.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: idx * 0.02 }}
                >
                  <article
                    className="sa-surface p-5"
                    style={
                      v.isCurrent
                        ? {
                            borderColor: "var(--neon)",
                            boxShadow: "0 0 0 1px var(--neon), 0 12px 36px var(--neon-glow-soft)",
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                          style={{
                            background: v.isCurrent
                              ? "color-mix(in srgb, var(--neon) 14%, transparent)"
                              : "var(--surface-3)",
                            border: "1px solid var(--surface-border)",
                            color: v.isCurrent ? "var(--neon)" : "var(--muted-foreground)",
                          }}
                        >
                          {getIcon("rocket", { size: 14, strokeWidth: 2 })}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{v.version}</span>
                            {v.isCurrent && (
                              <span
                                className="sa-chip"
                                style={{
                                  color: "var(--neon)",
                                  borderColor: "transparent",
                                  backgroundColor: "color-mix(in srgb, var(--neon) 14%, transparent)",
                                }}
                              >
                                <span
                                  className="inline-block w-1.5 h-1.5 rounded-full"
                                  style={{ background: "var(--neon)" }}
                                />
                                Actual
                              </span>
                            )}
                          </div>
                          {v.title && <p className="text-sm font-medium mt-0.5">{v.title}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(v)}
                          className="sa-btn sa-btn-ghost text-[11px] py-1 px-3"
                        >
                          {getIcon("edit", { size: 12, strokeWidth: 2 })}
                          <span>Editar</span>
                        </button>
                        {!v.isCurrent && (
                          <button
                            onClick={() => handleSetCurrent(v)}
                            className="sa-btn sa-btn-outline text-[11px] py-1 px-3"
                          >
                            <span>Marcar actual</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="sa-btn sa-btn-ghost text-[11px] py-1 px-3"
                          style={{ color: "#f87171" }}
                        >
                          {getIcon("trash", { size: 12, strokeWidth: 2 })}
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                    {v.description && (
                      <p className="text-sm text-[color:var(--muted-foreground)] mt-2 whitespace-pre-line">
                        {v.description}
                      </p>
                    )}
                    <p className="text-[10px] text-[color:var(--muted-foreground)] mt-3">
                      {new Date(v.createdAt).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </article>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  )
}