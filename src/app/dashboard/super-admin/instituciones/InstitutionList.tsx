"use client"

import { useState } from "react"
import DataTable from "@/components/DataTable"
import InstitutionModal from "./InstitutionModal"

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
}

export default function InstitutionList({ institutions: initial }: { institutions: Institution[] }) {
  const [institutions, setInstitutions] = useState(initial)
  const [selected, setSelected] = useState<Institution | null>(null)
  const [toggling, setToggling] = useState<number | null>(null)

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

  const levels = (v: string | null) => {
    if (!v) return ""
    const map: Record<string, string> = { inicial: "Inicial", primaria: "Primaria", secundaria: "Secundaria" }
    return v.split(",").filter(Boolean).map((l) => map[l] ?? l).join(", ")
  }

  return (
    <>
      <DataTable
        columns={[
          {
            key: "name", label: "Institución",
            render: (inst) => (
              <div>
                <p className="font-medium text-gray-900 dark:text-white/90">{inst.name}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">{inst.code}{inst.directorName ? <> · Dir. {inst.directorName}</> : ""}</p>
              </div>
            ),
          },
          {
            key: "type", label: "Tipo",
            render: (inst) => (
              <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                inst.type === "private" ? "bg-black dark:bg-white text-white dark:text-black" : "bg-black/5 dark:bg-white/10 text-black/60 dark:text-zinc-400"
              }`}>
                {inst.type === "private" ? "Privada" : "Pública"}
              </span>
            ),
          },
          {
            key: "department", label: "Ubicación",
            render: (inst) => [inst.district, inst.province, inst.department].filter(Boolean).join(", ") || "—",
          },
          {
            key: "educationalLevel", label: "Niveles",
            render: (inst) => levels(inst.educationalLevel) || "—",
          },
          {
            key: "email", label: "Contacto",
            render: (inst) => inst.email || inst.phone || "—",
          },
          {
            key: "isActive", label: "Estado",
            render: (inst) => (
              <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                inst.isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
              }`}>
                {inst.isActive ? "Activo" : "Inactivo"}
              </span>
            ),
          },
          {
            key: "actions", label: "",
            render: (inst) => (
              <button
                onClick={(e) => { e.stopPropagation(); toggleActive(inst) }}
                disabled={toggling === inst.id}
                 className={`text-xs font-medium rounded-[30px] px-3 py-1.5 border transition-all ${
                   inst.isActive
                     ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                     : "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                 }`}
              >
                {toggling === inst.id ? "..." : inst.isActive ? "Desactivar" : "Activar"}
              </button>
            ),
          },
        ]}
        data={institutions}
        onRowClick={(inst) => setSelected(inst)}
        emptyMessage="No hay instituciones registradas."
        renderCard={(inst) => (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white/90 truncate">{inst.name}</p>
                {inst.directorName &&                 <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">Dir. {inst.directorName}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                  inst.type === "private" ? "bg-black dark:bg-white text-white dark:text-black" : "bg-black/5 dark:bg-white/10 text-black/60 dark:text-zinc-400"
                }`}>
                  {inst.type === "private" ? "Priv" : "Púb"}
                </span>
                <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                  inst.isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                }`}>
                  {inst.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-zinc-400">
              <span><span className="text-gray-300 dark:text-zinc-600">Código:</span> {inst.code}</span>
              {inst.department && <span><span className="text-gray-300 dark:text-zinc-600">Ubicación:</span> {[inst.district, inst.province, inst.department].filter(Boolean).join(", ")}</span>}
              {levels(inst.educationalLevel) && <span><span className="text-gray-300 dark:text-zinc-600">Niveles:</span> {levels(inst.educationalLevel)}</span>}
              {(inst.email || inst.phone) && <span><span className="text-gray-300 dark:text-zinc-600">Contacto:</span> {inst.email || inst.phone}</span>}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); toggleActive(inst) }}
                disabled={toggling === inst.id}
                 className={`text-xs font-medium rounded-[30px] px-4 py-1.5 border transition-all ${
                   inst.isActive
                     ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                     : "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                 }`}
              >
                {toggling === inst.id ? "..." : inst.isActive ? "Desactivar" : "Activar"}
              </button>
            </div>
          </>
        )}
      />
      {selected && (
        <InstitutionModal
          institution={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  )
}
