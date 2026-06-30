"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="sa-eyebrow">Estructura educativa</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Grados y Secciones</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>Administra los grados y sus secciones</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setModal("create-grade"); setForm({ name: "", level: "", capacity: "", defaultShift: "" }); setError("") }}
          className="sa-btn sa-btn-primary"
        >
          + Nuevo Grado
        </motion.button>
      </div>

      {grades.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--surface-3)" }}>
            <span className="text-xl" style={{ color: "var(--muted-foreground)" }}>📚</span>
          </div>
          <p className="text-sm font-medium mt-3" style={{ color: "var(--foreground)" }}>No hay grados registrados</p>
          <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: "var(--muted-foreground)" }}>Crea el primer grado para empezar a organizar tu institución.</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setModal("create-grade"); setForm({ name: "", level: "", capacity: "", defaultShift: "" }); setError("") }}
            className="sa-btn sa-btn-primary mt-4"
          >
            + Nuevo Grado
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
          className="space-y-4"
        >
          {grades.map((grade, idx) => (
            <motion.div
              key={grade.id}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const, delay: idx * 0.02 } } }}
              className="sa-surface overflow-hidden"
            >
              <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--surface-border)" }}>
                <div>
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>{grade.name}</span>
                  {grade.level && <span className="ml-2 text-xs" style={{ color: "var(--muted-foreground)" }}>{grade.level}</span>}
                  <span className="ml-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{grade.sections.length} secciones</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openSectionCreate(grade)}
                    className="text-xs" style={{ color: "var(--muted-foreground)" }}
                  >
                    + Sección
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openGradeEdit(grade)}
                    className="text-xs" style={{ color: "var(--muted-foreground)" }}
                  >
                    Editar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setSelected(grade); setModal("delete-grade"); setError("") }}
                    className="text-xs" style={{ color: "#ef4444" }}
                  >
                    Eliminar
                  </motion.button>
                </div>
              </div>
              {grade.sections.length > 0 ? (
                <div className="divide-y" style={{ borderColor: "var(--surface-border)" }}>
                  {grade.sections.map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Sección {s.name}</span>
                        {s.capacity && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Capacidad: {s.capacity}</span>}
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openSectionEdit(s)}
                          className="text-xs" style={{ color: "var(--muted-foreground)" }}
                        >
                          Editar
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setSelected(s); setModal("delete-section"); setError("") }}
                          className="text-xs" style={{ color: "#ef4444" }}
                        >
                          Eliminar
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>Sin secciones</p>
              )}
            </motion.div>
          ))}
        </motion.div>
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
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
              ¿Estás seguro de eliminar {modal === "delete-grade" ? "este grado" : "esta sección"}? Los estudiantes asociados perderán la asignación.
            </p>
            {error && <p className="text-xs mb-4" style={{ color: "#ef4444" }}>{error}</p>}
            <div className="flex gap-3 justify-end">
              <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={() => setModal(null)} className="sa-btn sa-btn-ghost">Cancelar</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="sa-btn" style={{ background: "#ef4444", color: "white", border: "1px solid #ef4444" }}>{loading ? "..." : "Eliminar"}</motion.button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block sa-eyebrow mb-1.5">Nombre</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="sa-input w-full"
                placeholder={modal === "create-section" ? "Ej: A, B, C..." : "Ej: 1ero, 2do..."}
                required
                autoFocus
              />
            </div>
            {(modal === "create-grade" || modal === "edit-grade") && (
              <>
                <div>
                  <label className="block sa-eyebrow mb-1.5">Nivel</label>
                  <Select value={form.level} onChange={(val) => setForm({...form, level: val})} options={[{value: "Inicial", label: "Inicial"}, {value: "Primaria", label: "Primaria"}, {value: "Secundaria", label: "Secundaria"}]} placeholder="Sin nivel" />
                </div>
                <div>
                  <label className="block sa-eyebrow mb-1.5">Turno por defecto</label>
                  <Select value={form.defaultShift} onChange={(val) => setForm({...form, defaultShift: val})} options={[{value: "MAÑANA", label: "Mañana"}, {value: "TARDE", label: "Tarde"}]} placeholder="Sin turno" />
                </div>
              </>
            )}
            {(modal === "create-section" || modal === "edit-section") && (
              <div>
                <label className="block sa-eyebrow mb-1.5">Capacidad</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="sa-input w-full"
                  placeholder="Opcional"
                />
              </div>
            )}
            {error && <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={() => setModal(null)} className="sa-btn sa-btn-ghost">Cancelar</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="sa-btn sa-btn-primary">{loading ? "..." : "Guardar"}</motion.button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  )
}
