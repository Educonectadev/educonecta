"use client"

import { useState, useRef } from "react"
import { toast } from "@heroui/react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file: File | null) {
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

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
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
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <header>
        <p className="sa-eyebrow">Landing pública</p>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mt-0.5">Instituciones Partners</h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--muted-foreground)" }}>
          Gestiona los logos de instituciones que aparecen en la landing page.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[22px] p-4 md:p-6 space-y-5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--surface-shadow)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "color-mix(in srgb, var(--accent) 14%, transparent)",
              color: "var(--accent)",
            }}
          >
            {getIcon(editing ? "edit" : "plus", { size: 16, strokeWidth: 2.5 })}
          </span>
          <div>
            <h2 className="text-sm md:text-base font-semibold" style={{ color: "var(--foreground)" }}>
              {editing ? "Editar institución" : "Nueva institución partner"}
            </h2>
            <p className="text-[11px] md:text-xs" style={{ color: "var(--muted-foreground)" }}>
              {editing ? "Actualiza los datos de la institución" : "Agrega una institución para mostrar su logo en la landing"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Nombre"
              value={name}
              onChange={(v) => setName(v)}
              placeholder="Ej: Colegio San José"
            />
            <InputField
              label="Orden"
              value={String(order)}
              onChange={(v) => setOrder(Number(v))}
              type="number"
              placeholder="Ej: 1"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Logo
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="relative rounded-2xl border-2 border-dashed p-4 md:p-6 text-center cursor-pointer transition-all duration-200"
              style={{
                borderColor: dragOver ? "var(--accent)" : "var(--surface-border)",
                background: dragOver
                  ? "color-mix(in srgb, var(--accent) 6%, transparent)"
                  : "var(--surface-2)",
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              {logoPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      border: "1px solid var(--surface-border)",
                      background: "var(--surface-3)",
                    }}
                  >
                    <img
                      src={logoPreview}
                      alt="preview"
                      className="h-16 md:h-20 w-auto object-contain p-2"
                    />
                  </div>
                  <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                    {fileRef.current?.files?.[0]?.name || "Logo seleccionado"}
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setLogoPreview("")
                      setLogoUrl("")
                      if (fileRef.current) fileRef.current.value = ""
                    }}
                    className="text-[11px] font-medium transition-colors"
                    style={{ color: "#f87171" }}
                  >
                    Eliminar y reemplazar
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--surface-3)" }}
                  >
                    {getIcon("upload", { size: 18, strokeWidth: 2, style: { color: "var(--muted-foreground)" } })}
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      Subir logo
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      Arrastra una imagen o haz clic para seleccionar
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium"
                    style={{ background: "var(--surface-3)", color: "var(--muted-foreground)", border: "1px solid var(--surface-border)" }}
                  >
                    PNG, JPG · Máx 2MB
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading || !name.trim() || !logoUrl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-full text-sm font-semibold transition-all duration-150 disabled:opacity-50"
              style={{
                background: "var(--foreground)",
                color: "var(--background)",
                border: "1px solid var(--foreground)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--background)", borderRightColor: "var(--background)" }} />
                  Guardando…
                </span>
              ) : editing ? (
                <>
                  {getIcon("edit", { size: 15, strokeWidth: 2.5 })}
                  Actualizar
                </>
              ) : (
                <>
                  {getIcon("plus", { size: 15, strokeWidth: 2.5 })}
                  Agregar
                </>
              )}
            </motion.button>
            {editing && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={resetForm}
                className="px-5 py-2.5 md:py-3 rounded-full text-sm font-medium transition-all duration-150"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--muted-foreground)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                Cancelar
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
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
            {getIcon("users", { size: 28, strokeWidth: 1.6 })}
          </span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
            Aún no hay partners
          </p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>
            Las instituciones partner aparecerán aquí. Agrega la primera usando el formulario de arriba.
          </p>
        </motion.div>
      ) : (
        <motion.ul layout className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4">
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
                <article
                  className="group rounded-[20px] p-3.5 md:p-4 flex items-center gap-3 transition-all duration-200"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--surface-border)",
                    boxShadow: "var(--surface-shadow)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "var(--surface-shadow-hover)"
                    e.currentTarget.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "var(--surface-shadow)"
                    e.currentTarget.style.transform = "translateY(0)"
                  }}
                >
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: "var(--surface-3)", border: "1px solid var(--surface-border)" }}
                  >
                    <img
                      src={item.logoUrl}
                      alt={item.name}
                      className="h-7 w-7 md:h-8 md:w-8 object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] md:text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      <span>Orden {item.order}</span>
                      {item.createdAt && (
                        <>
                          <span>·</span>
                          <span>{new Date(item.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => toggleActive(item)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-200"
                    style={{
                      color: item.isActive ? "var(--accent)" : "var(--muted-foreground)",
                      background: item.isActive
                        ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                        : "var(--surface-3)",
                    }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: item.isActive ? "var(--accent)" : "var(--muted-foreground)" }}
                    />
                    {item.isActive ? "Activo" : "Inactivo"}
                  </motion.button>

                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => editItem(item)}
                      className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                      style={{ color: "var(--muted-foreground)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--foreground)" }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                    >
                      {getIcon("edit", { size: 13, strokeWidth: 2 })}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
                      style={{ color: "var(--muted-foreground)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)"; e.currentTarget.style.color = "#f87171" }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                    >
                      {getIcon("trash", { size: 13, strokeWidth: 2 })}
                    </motion.button>
                  </div>
                </article>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </label>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full outline-none border transition-all duration-200 rounded-2xl px-4 py-2.5 md:py-3 text-sm"
        style={{
          background: "var(--surface-2)",
          borderColor: focused ? "var(--foreground)" : "var(--surface-border)",
          color: "var(--foreground)",
          boxShadow: focused ? "0 0 0 3px color-mix(in srgb, var(--foreground) 10%, transparent)" : "none",
        }}
      />
    </div>
  )
}
