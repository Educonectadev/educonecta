"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/Modal"
import Select from "@/components/Select"

interface Grade {
  id: number
  name: string
  level: string | null
  sections: Section[]
}

interface Section {
  id: number
  name: string
  gradeId: number
  capacity: number | null
}

type ModalMode = "create-grade" | "edit-grade" | "create-section" | "edit-section" | "delete-grade" | "delete-section" | null

export default function GradosList({ grades: initial }: { grades: Grade[] }) {
  const router = useRouter()
  const [grades, setGrades] = useState<Grade[]>(initial)
  const [modal, setModal] = useState<ModalMode>(null)
  const [selected, setSelected] = useState<Grade | Section | null>(null)
  const [form, setForm] = useState({ name: "", level: "", capacity: "", defaultShift: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function refresh() { router.refresh() }

  function openGradeEdit(g: Grade) {
    setSelected(g)
    setForm({ name: g.name, level: g.level ?? "", capacity: "", defaultShift: (g as any).defaultShift ?? "" })
    setModal("edit-grade")
    setError("")
  }

  function openSectionCreate(g: Grade) {
    setSelected(g)
    setForm({ name: "", level: "", capacity: "", defaultShift: "" })
    setModal("create-section")
    setError("")
  }

  function openSectionEdit(s: Section) {
    setSelected(s)
    setForm({ name: s.name, level: "", capacity: s.capacity?.toString() ?? "", defaultShift: "" })
    setModal("edit-section")
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (modal === "create-grade") {
        const res = await fetch("/api/admin/grades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, level: form.level || null, defaultShift: form.defaultShift || null }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
        const created = await res.json()
        setGrades((prev) => [...prev, created])
        setModal(null)
        setForm({ name: "", level: "", capacity: "", defaultShift: "" })
      } else if (modal === "edit-grade") {
        const g = selected as Grade
        const res = await fetch(`/api/admin/grades/${g.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, level: form.level || null, defaultShift: form.defaultShift || null }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
        const updated = await res.json()
        setGrades((prev) => prev.map((g2) => (g2.id === g.id ? updated : g2)))
        setModal(null)
      } else if (modal === "create-section") {
        const g = selected as Grade
        const res = await fetch("/api/admin/sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, gradeId: g.id, capacity: form.capacity || null }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
        const created = await res.json()
        setGrades((prev) =>
          prev.map((g2) =>
            g2.id === g.id ? { ...g2, sections: [...g2.sections, created].sort((a, b) => a.name.localeCompare(b.name)) } : g2
          )
        )
        setModal(null)
        setForm({ name: "", level: "", capacity: "", defaultShift: "" })
      } else if (modal === "edit-section") {
        const s = selected as Section
        const res = await fetch(`/api/admin/sections/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, capacity: form.capacity || null }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
        const updated = await res.json()
        setGrades((prev) =>
          prev.map((g2) =>
            g2.id === s.gradeId
              ? { ...g2, sections: g2.sections.map((s2) => (s2.id === s.id ? updated : s2)) }
              : g2
          )
        )
        setModal(null)
      } else if (modal === "delete-grade") {
        const g = selected as Grade
        const res = await fetch(`/api/admin/grades/${g.id}`, { method: "DELETE" })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
        setGrades((prev) => prev.filter((g2) => g2.id !== g.id))
        setModal(null)
      } else if (modal === "delete-section") {
        const s = selected as Section
        const res = await fetch(`/api/admin/sections/${s.id}`, { method: "DELETE" })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
        setGrades((prev) =>
          prev.map((g2) =>
            g2.id === s.gradeId ? { ...g2, sections: g2.sections.filter((s2) => s2.id !== s.id) } : g2
          )
        )
        setModal(null)
      }
      refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 pt-3 md:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Grados y Secciones</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Administra los grados y sus secciones</p>
        </div>
        <button
          onClick={() => { setModal("create-grade"); setForm({ name: "", level: "", capacity: "", defaultShift: "" }); setError("") }}
          className="sa-btn sa-btn-primary px-5 py-2 rounded-[30px] text-sm font-medium"
        >
          + Nuevo Grado
        </button>
      </div>

      {grades.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No hay grados registrados. Crea el primer grado.</p>
      ) : (
        <div className="space-y-4">
          {grades.map((grade) => (
            <div key={grade.id} className="sa-surface overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[var(--surface-border)]">
                <div>
                  <span className="font-semibold text-[var(--foreground)]">{grade.name}</span>
                  {grade.level && <span className="ml-2 text-xs text-[var(--muted-foreground)]">{grade.level}</span>}
                  <span className="ml-3 text-xs text-[var(--muted-foreground)]">{grade.sections.length} secciones</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openSectionCreate(grade)}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
                  >
                    + Sección
                  </button>
                  <button
                    onClick={() => openGradeEdit(grade)}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => { setSelected(grade); setModal("delete-grade"); setError("") }}
                    className="text-xs text-red-400 hover:text-red-600 transition-all"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {grade.sections.length > 0 ? (
                <div className="divide-y divide-[var(--surface-border)]">
                  {grade.sections.map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--muted-foreground)]">Sección {s.name}</span>
                        {s.capacity && <span className="text-xs text-[var(--muted-foreground)]">Capacidad: {s.capacity}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openSectionEdit(s)}
                          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => { setSelected(s); setModal("delete-section"); setError("") }}
                          className="text-xs text-red-400 hover:text-red-600 transition-all"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-3 text-sm text-[var(--muted-foreground)]">Sin secciones</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={
          modal === "create-grade" ? "Nuevo Grado"
          : modal === "edit-grade" ? "Editar Grado"
          : modal === "create-section" ? `Nueva Sección en ${(selected as Grade).name}`
          : modal === "edit-section" ? "Editar Sección"
          : modal === "delete-grade" ? `Eliminar ${(selected as Grade).name}`
          : modal === "delete-section" ? `Eliminar Sección ${(selected as Section).name}`
          : ""
        }
      >
        {(modal === "delete-grade" || modal === "delete-section") ? (
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              ¿Estás seguro de eliminar {modal === "delete-grade" ? "este grado" : "esta sección"}? Los estudiantes asociados perderán la asignación.
            </p>
            {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">Cancelar</button>
              <button type="submit" disabled={loading} className="bg-red-600 text-white px-5 py-2 rounded-[30px] text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50">{loading ? "..." : "Eliminar"}</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Nombre</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[var(--surface-border)] rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                placeholder={modal === "create-section" ? "Ej: A, B, C..." : "Ej: 1ero, 2do..."}
                required
                autoFocus
              />
            </div>
            {(modal === "create-grade" || modal === "edit-grade") && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Nivel</label>
                  <Select value={form.level} onChange={(val) => setForm({...form, level: val})} options={[{value: "Inicial", label: "Inicial"}, {value: "Primaria", label: "Primaria"}, {value: "Secundaria", label: "Secundaria"}]} placeholder="Sin nivel" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Turno por defecto</label>
                  <Select value={form.defaultShift} onChange={(val) => setForm({...form, defaultShift: val})} options={[{value: "MAÑANA", label: "Mañana"}, {value: "TARDE", label: "Tarde"}]} placeholder="Sin turno" />
                </div>
              </>
            )}
            {(modal === "create-section" || modal === "edit-section") && (
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Capacidad</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full border border-[var(--surface-border)] rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Opcional"
                />
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">Cancelar</button>
              <button type="submit" disabled={loading} className="sa-btn sa-btn-primary px-5 py-2 rounded-[30px] text-sm font-medium">{loading ? "..." : "Guardar"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
