"use client"

import { useState, useRef } from "react"
import { toast } from "@heroui/react"
import { motion, AnimatePresence } from "framer-motion"
import NeonCard from "@/components/premium/NeonCard"
import GlowButton from "@/components/premium/GlowButton"
import IconTile from "@/components/premium/IconTile"
import { getIcon } from "@/components/premium/iconRegistry"

interface Partner {
  id: number
  name: string
  logoUrl: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PartnerList({ partners: initial }: { partners: Partner[] }) {
  const [items, setItems] = useState<Partner[]>(initial)
  const [name, setName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [logoPreview, setLogoPreview] = useState("")
  const [order, setOrder] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.danger("Solo imágenes")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.danger("Máximo 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setLogoPreview(dataUrl)
      setLogoUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  function resetForm() {
    setName("")
    setLogoUrl("")
    setLogoPreview("")
    setOrder(0)
    setEditing(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  function editItem(item: Partner) {
    setName(item.name)
    setLogoUrl(item.logoUrl)
    setLogoPreview(item.logoUrl)
    setOrder(item.order)
    setEditing(item.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !logoUrl) return
    setLoading(true)

    const method = editing ? "PUT" : "POST"
    const url = editing ? `/api/super-admin/partner-institutions?id=${editing}` : "/api/super-admin/partner-institutions"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), logoUrl, order }),
    })

    if (res.ok) {
      const data = await res.json()
      if (editing) {
        setItems((prev) => prev.map((p) => (p.id === editing ? data : p)))
      } else {
        setItems((prev) => [...prev, data])
      }
      resetForm()
    } else {
      const err = await res.json()
      toast.danger(err.error || "Error al guardar")
    }
    setLoading(false)
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta institución?")) return
    const res = await fetch(`/api/super-admin/partner-institutions?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      setItems((prev) => prev.filter((p) => p.id !== id))
    } else {
      const err = await res.json()
      toast.danger(err.error || "Error al eliminar")
    }
  }

  async function toggleActive(item: Partner) {
    const res = await fetch(`/api/super-admin/partner-institutions?id=${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    })
    if (res.ok) {
      const data = await res.json()
      setItems((prev) => prev.map((p) => (p.id === item.id ? data : p)))
    } else {
      const err = await res.json()
      toast.danger(err.error || "Error al actualizar")
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 pt-4 md:pt-6">
      <header>
        <p className="sa-eyebrow">Landing pública</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Instituciones Partners</h1>
        <p className="text-sm text-[color:var(--muted-foreground)] mt-1.5">
          Gestiona los logos de instituciones que aparecen en la landing page.
        </p>
      </header>

      <NeonCard hoverable={false} delay={0.05}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <IconTile name={editing ? "edit" : "plus"} size={16} filled active />
            <h2 className="text-base font-semibold">
              {editing ? "Editar institución" : "Nueva institución"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block sa-eyebrow mb-1.5">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Colegio San José"
                className="sa-input"
              />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Orden</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="sa-input"
              />
            </div>
          </div>

          <div>
            <label className="block sa-eyebrow mb-1.5">Logo</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="w-full text-sm text-[color:var(--muted-foreground)] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold sa-btn-primary"
            />
            {logoPreview && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={logoPreview}
                  alt="preview"
                  className="h-10 w-auto object-contain rounded-xl border border-[color:var(--surface-border)]"
                  style={{ background: "var(--surface-3)" }}
                />
                <span className="text-xs text-[color:var(--muted-foreground)]">Previsualización</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !name.trim() || !logoUrl}
              className="sa-btn sa-btn-primary disabled:opacity-50"
            >
              {loading ? "Guardando..." : editing ? "Actualizar" : "Agregar"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="sa-btn sa-btn-ghost"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </NeonCard>

      {items.length === 0 ? (
        <NeonCard hoverable={false} className="text-center">
          <div className="py-8">
            {getIcon("users", { size: 28, strokeWidth: 1.6, className: "mx-auto mb-3 opacity-50" })}
            <p className="text-sm text-[color:var(--muted-foreground)]">
              No hay instituciones partners. Agrega la primera arriba.
            </p>
          </div>
        </NeonCard>
      ) : (
        <motion.ul layout className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.li
                layout
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: idx * 0.02 }}
              >
                <article className="sa-surface sa-surface-hover p-4 flex items-center gap-4">
                  <span
                    className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: "var(--surface-3)", border: "1px solid var(--surface-border)" }}
                  >
                    <img
                      src={item.logoUrl}
                      alt={item.name}
                      className="h-8 w-8 object-contain"
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-[11px] text-[color:var(--muted-foreground)]">
                      Orden: {item.order}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleActive(item)}
                    className="sa-chip"
                    style={
                      item.isActive
                        ? {
                            color: "var(--neon)",
                            borderColor: "transparent",
                            backgroundColor: "color-mix(in srgb, var(--neon) 14%, transparent)",
                          }
                        : undefined
                    }
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: item.isActive ? "var(--neon)" : "var(--muted-foreground)" }}
                    />
                    {item.isActive ? "Activo" : "Inactivo"}
                  </button>
                  <button
                    onClick={() => editItem(item)}
                    className="sa-btn sa-btn-ghost text-[11px] py-1 px-3"
                  >
                    {getIcon("edit", { size: 12, strokeWidth: 2 })}
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="sa-btn sa-btn-ghost text-[11px] py-1 px-3"
                    style={{ color: "#f87171" }}
                  >
                    {getIcon("trash", { size: 12, strokeWidth: 2 })}
                    <span>Eliminar</span>
                  </button>
                </article>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  )
}