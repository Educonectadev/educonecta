"use client"

import { useState, useRef } from "react"
import { toast } from "@heroui/react"

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white/90">Instituciones Partners</h1>
        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
          Gestiona los logos de instituciones que aparecen en la landing page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[25px] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-black dark:text-white/90">
          {editing ? "Editar institución" : "Nueva institución"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Colegio San José"
              className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Orden</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5">Logo</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full text-sm text-gray-500 dark:text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-[30px] file:border-0 file:text-sm file:font-medium file:bg-black file:text-white dark:file:bg-white dark:file:text-black hover:file:opacity-90 transition-all"
          />
          {logoPreview && (
            <div className="mt-3 flex items-center gap-3">
              <img src={logoPreview} alt="preview" className="h-10 w-auto object-contain rounded-lg border border-gray-200 dark:border-zinc-700" />
              <span className="text-xs text-gray-400 dark:text-zinc-500">Previsualización</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading || !name.trim() || !logoUrl} className="btn-primary px-6 py-2.5 rounded-[30px] text-sm font-medium transition disabled:opacity-50">
            {loading ? "Guardando..." : editing ? "Actualizar" : "Agregar"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-[30px] text-sm font-medium border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[25px] p-12 text-center text-sm text-gray-400 dark:text-zinc-500">
            No hay instituciones partners. Agrega la primera arriba.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[25px] p-5 flex items-center gap-4">
              <img
                src={item.logoUrl}
                alt={item.name}
                className="h-10 w-10 object-contain rounded-lg border border-gray-100 dark:border-zinc-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white/90 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Orden: {item.order}</p>
              </div>
              <button
                onClick={() => toggleActive(item)}
                className={`text-[10px] font-semibold uppercase px-3 py-1.5 rounded-full transition-all ${
                  item.isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-500"
                }`}
              >
                {item.isActive ? "Activo" : "Inactivo"}
              </button>
              <button onClick={() => editItem(item)} className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-all px-3 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800">
                Editar
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-all px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30">
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
