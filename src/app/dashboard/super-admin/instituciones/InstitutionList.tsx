"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import InstitutionModal from "./InstitutionModal"
import IconTile from "@/components/premium/IconTile"
import { getIcon } from "@/components/premium/iconRegistry"

interface Institution {
  id: number
  name: string
  code: string
  type: string | null
  ruc: string | null
  address: string | null
  district: string | null
  province: string | null
  department: string | null
  phone: string | null
  email: string | null
  website: string | null
  directorName: string | null
  educationalLevel: string | null
  shifts: string | null
  foundedYear: number | null
  description: string | null
  isActive: boolean | number
  studentCount?: number
  createdAt?: string
}

type FilterKey = "all" | "active" | "inactive"

export default function InstitutionList({
  institutions: initial,
  total,
  active,
  inactive,
}: {
  institutions: Institution[]
  total: number
  active: number
  inactive: number
}) {
  const [institutions, setInstitutions] = useState(initial)
  const [selected, setSelected] = useState<Institution | null>(null)
  const [toggling, setToggling] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterKey>("all")

  async function toggleActive(inst: Institution) {
    setToggling(inst.id)
    try {
      const res = await fetch(`/api/super-admin/instituciones?id=${inst.id}`, { method: "PATCH" })
      const data = await res.json()
      if (data.success) {
        setInstitutions((prev) => prev.map((i) => (i.id === inst.id ? { ...i, isActive: !i.isActive } : i)))
      }
    } finally {
      setToggling(null)
    }
  }

  function handleUpdate(updated: Institution) {
    setInstitutions((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    setSelected(updated)
  }

  const counts = { all: total, active, inactive }

  const filtered = useMemo(() => {
    let list = institutions
    if (filter === "active") list = list.filter((i) => i.isActive)
    if (filter === "inactive") list = list.filter((i) => !i.isActive)
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        (i.directorName ?? "").toLowerCase().includes(q) ||
        (i.district ?? "").toLowerCase().includes(q)
    )
  }, [institutions, query, filter])

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "Todas", count: counts.all },
    { key: "active", label: "Activas", count: counts.active },
    { key: "inactive", label: "Inactivas", count: counts.inactive },
  ]

  return (
    <div className="space-y-4">
      <div className="sa-surface p-3 md:p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <span className="flex items-center justify-center w-9 h-9 rounded-full shrink-0" style={{ background: "var(--surface-3)", border: "1px solid var(--surface-border)" }}>
            {getIcon("search", { size: 14, strokeWidth: 2 })}
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, código, director o distrito…"
            className="sa-input"
          />
        </div>

        <div className="flex items-center gap-1 sa-rail" style={{ padding: "0.3rem" }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              data-active={filter === f.key}
              className="sa-rail-item"
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}
            >
              <span>{f.label}</span>
              <span
                className="sa-chip"
                style={{
                  padding: "0.05rem 0.4rem",
                  fontSize: "0.65rem",
                  backgroundColor: filter === f.key ? "rgba(0,0,0,0.12)" : "var(--surface-3)",
                  color: filter === f.key ? "#0a0a0c" : "var(--muted-foreground)",
                  borderColor: "transparent",
                }}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="sa-surface py-14 md:py-16 text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "var(--surface-3)" }}>
            {getIcon("building", { size: 28, strokeWidth: 1.6 })}
          </span>
          <p className="text-sm font-medium mb-1">
            {query ? "Sin resultados" : "Aún no hay instituciones"}
          </p>
          <p className="text-xs text-[color:var(--muted-foreground)] max-w-xs mx-auto">
            {query
              ? "No encontramos instituciones con ese criterio. Intenta con otros términos."
              : "Las instituciones registradas aparecerán aquí. Usa el botón superior para añadir la primera."}
          </p>
        </div>
      ) : (
        <motion.ul layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((inst, idx) => (
              <motion.li
                layout
                key={inst.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: idx * 0.03 }}
              >
                <article
                  onClick={() => setSelected(inst)}
                  className="sa-surface sa-surface-hover p-5 cursor-pointer h-full flex flex-col gap-4"
                >
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-semibold text-sm shrink-0"
                        style={{
                          background: inst.isActive
                            ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                            : "var(--surface-3)",
                          border: "1px solid var(--surface-border)",
                          color: inst.isActive ? "var(--accent)" : "var(--muted-foreground)",
                        }}
                      >
                        {inst.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{inst.name}</h3>
                        <p className="text-[11px] text-[color:var(--muted-foreground)] truncate">
                          {inst.code}
                          {inst.directorName ? ` · Dir. ${inst.directorName}` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className="sa-chip"
                      style={
                        inst.isActive
                          ? {
                              color: "var(--accent)",
                              borderColor: "transparent",
                              backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
                            }
                          : {
                              color: "#f87171",
                              borderColor: "transparent",
                              backgroundColor: "rgba(248, 113, 113, 0.14)",
                            }
                      }
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: inst.isActive ? "var(--accent)" : "#f87171" }}
                      />
                      {inst.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </header>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="sa-surface-flat px-3 py-2">
                      <p className="sa-eyebrow !text-[9px] mb-0.5">Tipo</p>
                      <p className="font-medium">{inst.type === "private" ? "Privada" : "Pública"}</p>
                    </div>
                    <div className="sa-surface-flat px-3 py-2">
                      <p className="sa-eyebrow !text-[9px] mb-0.5">Niveles</p>
                      <p className="font-medium truncate">{formatLevels(inst.educationalLevel)}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-[color:var(--muted-foreground)]">
                    {(inst.district || inst.province || inst.department) && (
                      <div className="flex items-center gap-1.5">
                        {getIcon("map", { size: 12, strokeWidth: 2 })}
                        <span className="truncate">
                          {[inst.district, inst.province, inst.department].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {inst.createdAt && (
                      <div className="flex items-center gap-1.5">
                        {getIcon("calendar", { size: 12, strokeWidth: 2 })}
                        <span>{new Date(inst.createdAt).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                    )}
                  </div>

                  <footer className="flex items-center justify-between pt-2 border-t border-[color:var(--surface-border)]">
                    <div className="flex items-center gap-2 text-[11px] text-[color:var(--muted-foreground)]">
                      {inst.studentCount !== undefined && (
                        <span className="flex items-center gap-1">
                          {getIcon("person", { size: 12, strokeWidth: 2 })}
                          {inst.studentCount} alumnos
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelected(inst)
                        }}
                        className="sa-btn-ghost"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.7rem", borderRadius: "999px" }}
                      >
                        {getIcon("eye", { size: 12, strokeWidth: 2 })}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleActive(inst)
                        }}
                        disabled={toggling === inst.id}
                        className={
                          "sa-btn text-[11px] py-1 px-3 " +
                          (inst.isActive ? "sa-btn-outline" : "sa-btn-primary")
                        }
                        style={inst.isActive ? { color: "#f87171", borderColor: "rgba(248,113,113,0.4)" } : undefined}
                      >
                        {toggling === inst.id
                          ? "…"
                          : inst.isActive
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </div>
                  </footer>
                </article>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      {selected && (
        <InstitutionModal
          institution={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

function formatLevels(v: string | null): string {
  if (!v) return "—"
  const map: Record<string, string> = { inicial: "Inicial", primaria: "Primaria", secundaria: "Secundaria" }
  const labels = v.split(",").filter(Boolean).map((l) => map[l] ?? l)
  return labels.join(", ") || "—"
}
