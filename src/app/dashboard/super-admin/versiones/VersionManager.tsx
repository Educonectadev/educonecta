"use client"

import { useState } from "react"

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
      alert(err.error)
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
    <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 h-fit">
        <h2 className="text-sm font-semibold text-gray-700">{editing ? "Editar Versión" : "Nueva Versión"}</h2>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Versión *</label>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="v1.0.0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lanzamiento inicial"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Novedades de esta versión..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
          />
          Marcar como versión actual
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !version.trim()}
            className="flex-1 bg-black text-white text-sm font-medium rounded-lg py-2 hover:bg-gray-800 disabled:opacity-40 transition-all"
          >
            {loading ? "Guardando..." : editing ? "Actualizar" : "Registrar"}
          </button>
          {editing && (
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {versiones.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">No hay versiones registradas</p>
        )}
        {versiones.map((v) => (
          <div key={v.id} className={`bg-white border rounded-xl p-4 ${v.isCurrent ? "border-black ring-1 ring-black/10" : "border-gray-200"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">{v.version}</span>
                {v.isCurrent && (
                  <span className="text-[10px] font-semibold uppercase bg-black text-white px-2 py-0.5 rounded-full">Actual</span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(v)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
                  Editar
                </button>
                {!v.isCurrent && (
                  <button onClick={() => handleSetCurrent(v)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
                    Marcar actual
                  </button>
                )}
                <button onClick={() => handleDelete(v.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">
                  Eliminar
                </button>
              </div>
            </div>
            {v.title && <p className="text-sm font-medium text-gray-700 mt-1">{v.title}</p>}
            {v.description && <p className="text-sm text-gray-500 mt-0.5 whitespace-pre-line">{v.description}</p>}
            <p className="text-[10px] text-gray-400 mt-2">
              {new Date(v.createdAt).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
