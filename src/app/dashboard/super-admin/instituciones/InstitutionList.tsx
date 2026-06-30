"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import InstitutionModal from "./InstitutionModal"
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

const FILTERS_CONFIG: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Activas" },
  { key: "inactive", label: "Inactivas" },
]

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
  const [focused, setFocused] = useState(false)

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

  return (
    <div className="space-y-3 md:space-y-4">
      <div
        className="flex flex-col gap-3 p-3 md:p-4 rounded-[22px]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--surface-shadow)",
        }}
      >
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all duration-200"
          style={{
            background: focused ? "var(--surface-2)" : "var(--surface-3)",
            border: `1px solid ${focused ? "var(--foreground)" : "var(--surface-border)"}`,
            boxShadow: focused ? "0 0 0 3px color-mix(in srgb, var(--foreground) 10%, transparent)" : "none",
          }}
        >
          <span className="shrink-0" style={{ color: focused ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {getIcon("search", { size: 15, strokeWidth: 2 })}
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Buscar por nombre, código o director…"
            className="flex-1 bg-transparent text-sm outline-none border-none"
            style={{ color: "var(--foreground)", minHeight: 20 }}
          />
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setQuery("")}
              className="shrink-0 p-0.5 rounded-full opacity-50 hover:opacity-100 transition-opacity"
            >
              {getIcon("x", { size: 14, strokeWidth: 2.5 })}
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {FILTERS_CONFIG.map((f) => {
            const isActive = filter === f.key
            const count = counts[f.key]
            return (
              <motion.button
                key={f.key}
                onClick={() => setFilter(f.key)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: isActive
                    ? "var(--foreground)"
                    : "var(--surface-3)",
                  color: isActive
                    ? "var(--background)"
                    : "var(--muted-foreground)",
                  border: "1px solid transparent",
                }}
              >
                <span>{f.label}</span>
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold px-1"
                  style={{
                    background: isActive
                      ? "color-mix(in srgb, var(--background) 20%, transparent)"
                      : "color-mix(in srgb, var(--muted-foreground) 15%, transparent)",
                    color: isActive ? "var(--background)" : "var(--muted-foreground)",
                  }}
                >
                  {count}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
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
            {getIcon("building", { size: 28, strokeWidth: 1.6 })}
          </span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
            {query ? "Sin resultados" : "Aún no hay instituciones"}
          </p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-foreground)" }}>
            {query
              ? "No encontramos instituciones con ese criterio. Intenta con otros términos."
              : "Las instituciones registradas aparecerán aquí. Usa el botón superior para añadir la primera."}
          </p>
        </motion.div>
      ) : (
        <motion.ul layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 md:gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((inst, idx) => (
              <motion.li
                layout
                key={inst.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: idx * 0.025 }}
              >
                <article
                  onClick={() => setSelected(inst)}
                  className="group cursor-pointer h-full flex flex-col rounded-[22px] transition-all duration-200"
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
                  <div className="p-3.5 md:p-5 flex flex-col gap-2.5 md:gap-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-xs md:text-sm shrink-0 transition-all duration-200"
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
                          <h3
                            className="font-semibold text-sm md:text-base truncate leading-tight"
                            style={{ color: "var(--foreground)" }}
                          >
                            {inst.name}
                          </h3>
                          <p
                            className="text-[10px] md:text-[11px] truncate mt-0.5"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {inst.code}
                          </p>
                        </div>
                      </div>
                      <motion.span
                        whileTap={{ scale: 0.93 }}
                        className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-200"
                        style={{
                          color: inst.isActive ? "var(--accent)" : "#f87171",
                          background: inst.isActive
                            ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                            : "rgba(248, 113, 113, 0.14)",
                        }}
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full"
                          style={{ background: inst.isActive ? "var(--accent)" : "#f87171" }}
                        />
                        {inst.isActive ? "Activa" : "Inactiva"}
                      </motion.span>
                    </div>

                    {(inst.district || inst.province || inst.department) && (
                      <div
                        className="flex items-center gap-1.5 text-[10px] md:text-[11px]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {getIcon("map", { size: 11, strokeWidth: 2 })}
                        <span className="truncate">
                          {[inst.district, inst.province, inst.department].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 mt-auto">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[9px] md:text-[10px] font-medium"
                        style={{
                          background: "var(--surface-3)",
                          border: "1px solid var(--surface-border)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {inst.type === "private" ? "Privada" : "Pública"}
                      </span>
                      {inst.educationalLevel && (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-[9px] md:text-[10px] font-medium"
                          style={{
                            background: "var(--surface-3)",
                            border: "1px solid var(--surface-border)",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {formatLevels(inst.educationalLevel)}
                        </span>
                      )}
                      {inst.studentCount !== undefined && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] md:text-[10px] font-medium"
                          style={{
                            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                            border: "1px solid transparent",
                            color: "var(--accent)",
                          }}
                        >
                          {getIcon("person", { size: 10, strokeWidth: 2.5 })}
                          {inst.studentCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between gap-2 px-3.5 md:px-5 py-2.5 md:py-3 rounded-b-[22px]"
                    style={{
                      borderTop: "1px solid var(--surface-border)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] md:text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      {inst.createdAt ? (
                        <span className="flex items-center gap-1">
                          {getIcon("calendar", { size: 10, strokeWidth: 2 })}
                          {new Date(inst.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => { e.stopPropagation(); setSelected(inst) }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] md:text-[11px] font-medium transition-all duration-150"
                        style={{
                          background: "transparent",
                          color: "var(--muted-foreground)",
                          border: "1px solid var(--surface-border)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--foreground)" }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)" }}
                      >
                        {getIcon("eye", { size: 11, strokeWidth: 2 })}
                        <span className="hidden sm:inline">Ver</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => { e.stopPropagation(); toggleActive(inst) }}
                        disabled={toggling === inst.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] md:text-[11px] font-medium transition-all duration-150"
                        style={{
                          background: inst.isActive ? "rgba(248, 113, 113, 0.1)" : "color-mix(in srgb, var(--accent) 14%, transparent)",
                          color: inst.isActive ? "#f87171" : "var(--accent)",
                          border: `1px solid ${inst.isActive ? "rgba(248, 113, 113, 0.3)" : "transparent"}`,
                        }}
                      >
                        {toggling === inst.id
                          ? "…"
                          : getIcon(inst.isActive ? "power" : "check", { size: 11, strokeWidth: 2.5 })}
                        <span>{toggling === inst.id ? "" : inst.isActive ? "Desactivar" : "Activar"}</span>
                      </motion.button>
                    </div>
                  </div>
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
