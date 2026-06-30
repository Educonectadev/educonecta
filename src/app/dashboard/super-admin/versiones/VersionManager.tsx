"use client"

import { useState } from "react"
import { toast } from "@heroui/react"
import { motion, AnimatePresence } from "framer-motion"
import { getIcon } from "@/components/premium/iconRegistry"

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
    <div className="grid gap-5 md:gap-6 md:grid-cols-[1fr_2fr] items-start">
      {/* ── FORM ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[22px] p-5 md:p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--surface-shadow)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "color-mix(in srgb, var(--accent) 14%, transparent)",
                color: "var(--accent)",
              }}
            >
              {getIcon(editing ? "edit" : "rocket", { size: 16, strokeWidth: 2 })}
            </span>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {editing ? "Editar versión" : "Nueva versión"}
              </h2>
              <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {editing ? "Actualiza los datos de la versión" : "Registra una nueva versión del sistema"}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Versión *
            </label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="v1.0.0"
              className="sa-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lanzamiento inicial"
              className="sa-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Novedades de esta versión..."
              rows={3}
              className="sa-input"
              style={{ borderRadius: "18px", resize: "none" }}
            />
          </div>

          <label
            className="flex items-center gap-2.5 text-sm cursor-pointer select-none"
            style={{ color: "var(--muted-foreground)" }}
          >
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="size-4 rounded"
              style={{ accentColor: "var(--accent)" }}
            />
            Marcar como versión actual
          </label>

          <div className="flex gap-2 pt-2">
            <motion.button
              type="submit"
              disabled={loading || !version.trim()}
              className="sa-btn sa-btn-primary flex-1 disabled:opacity-50"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Guardando..." : editing ? "Actualizar" : "Registrar"}
            </motion.button>
            {editing && (
              <motion.button
                type="button"
                onClick={handleCancel}
                className="sa-btn sa-btn-ghost"
                whileTap={{ scale: 0.97 }}
              >
                Cancelar
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      {/* ── LIST ── */}
      <div className="space-y-3">
        {versiones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[22px] py-14 md:py-16 text-center"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--surface-border)",
              boxShadow: "var(--surface-shadow)",
            }}
          >
            <span
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: "var(--surface-3)" }}
            >
              {getIcon("history", { size: 28, strokeWidth: 1.6 })}
            </span>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
              Aún no hay versiones
            </p>
            <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>
              Las versiones del sistema aparecerán aquí. Registra la primera usando el formulario.
            </p>
          </motion.div>
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
                    className="group rounded-[22px] p-4 md:p-5 transition-all duration-200"
                    style={{
                      background: "var(--surface)",
                      border: v.isCurrent
                        ? "1px solid color-mix(in srgb, var(--accent) 30%, transparent)"
                        : "1px solid var(--surface-border)",
                      boxShadow: v.isCurrent
                        ? "0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), var(--surface-shadow)"
                        : "var(--surface-shadow)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "var(--surface-shadow-hover)"
                      e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = v.isCurrent
                        ? "0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), var(--surface-shadow)"
                        : "var(--surface-shadow)"
                      e.currentTarget.style.transform = "translateY(0)"
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: v.isCurrent
                              ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                              : "var(--surface-3)",
                            border: "1px solid var(--surface-border)",
                            color: v.isCurrent ? "var(--accent)" : "var(--muted-foreground)",
                          }}
                        >
                          {getIcon("rocket", { size: 16, strokeWidth: 2 })}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base md:text-lg font-bold" style={{ color: "var(--foreground)" }}>
                              {v.version}
                            </span>
                            {v.isCurrent && (
                              <span
                                className="sa-chip"
                                style={{
                                  color: "var(--accent)",
                                  borderColor: "transparent",
                                  backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
                                }}
                              >
                                <span
                                  className="inline-block w-1.5 h-1.5 rounded-full"
                                  style={{ background: "var(--accent)" }}
                                />
                                Actual
                              </span>
                            )}
                          </div>
                          {v.title && (
                            <p className="text-sm font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
                              {v.title}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(v)}
                          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                          style={{ color: "var(--muted-foreground)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--foreground)" }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                          title="Editar"
                        >
                          {getIcon("edit", { size: 14, strokeWidth: 2 })}
                        </motion.button>
                        {!v.isCurrent && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSetCurrent(v)}
                            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                            style={{ color: "var(--muted-foreground)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "color-mix(in srgb, var(--accent) 14%, transparent)"; e.currentTarget.style.color = "var(--accent)" }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                            title="Marcar como actual"
                          >
                            {getIcon("check", { size: 14, strokeWidth: 2 })}
                          </motion.button>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(v.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                          style={{ color: "var(--muted-foreground)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)"; e.currentTarget.style.color = "#f87171" }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                          title="Eliminar"
                        >
                          {getIcon("trash", { size: 14, strokeWidth: 2 })}
                        </motion.button>
                      </div>
                    </div>

                    {v.description && (
                      <p className="text-sm mt-3 whitespace-pre-line" style={{ color: "var(--muted-foreground)" }}>
                        {v.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 mt-3">
                      <span style={{ color: "var(--muted-foreground)" }}>
                        {getIcon("clock", { size: 11, strokeWidth: 2 })}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(v.createdAt).toLocaleDateString("es-PE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
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
