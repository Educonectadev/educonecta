"use client"

import { useState } from "react"
import Link from "next/link"
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

  async function toggleActive(inst: Institution, e: React.MouseEvent) {
    e.stopPropagation()
    setToggling(inst.id)
    try {
      const res = await fetch(`/api/super-admin/instituciones?id=${inst.id}`, {
        method: "PATCH",
      })
      const data = await res.json()
      if (data.success) {
        setInstitutions((prev) =>
          prev.map((i) => (i.id === inst.id ? { ...i, isActive: !i.isActive } : i))
        )
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
      <div className="grid gap-3 md:gap-2">
        {/* Desktop header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          <div className="col-span-3">Institución</div>
          <div className="col-span-1">Tipo</div>
          <div className="col-span-2">Ubicación</div>
          <div className="col-span-2">Niveles</div>
          <div className="col-span-2">Contacto</div>
          <div className="col-span-1 text-center">Estado</div>
          <div className="col-span-1 text-center"></div>
        </div>

        {institutions.map((inst) => (
          <div
            key={inst.id}
            onClick={() => setSelected(inst)}
            className="bg-white border border-gray-200 rounded-[25px] p-5 cursor-pointer transition-all hover:border-gray-300 hover:shadow-sm active:scale-[0.99]"
          >
            {/* Mobile layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1a1a1a] truncate">{inst.name}</p>
                  {inst.directorName && <p className="text-xs text-gray-400 mt-0.5">Dir. {inst.directorName}</p>}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                    inst.type === "private"
                      ? "bg-black text-white"
                      : "bg-black/5 text-black/60"
                  }`}>
                    {inst.type === "private" ? "Priv" : "Púb"}
                  </span>
                  <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                    inst.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {inst.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span><span className="text-gray-300">Código:</span> {inst.code}</span>
                {inst.department && <span><span className="text-gray-300">Ubicación:</span> {[inst.district, inst.province, inst.department].filter(Boolean).join(", ")}</span>}
                {levels(inst.educationalLevel) && <span><span className="text-gray-300">Niveles:</span> {levels(inst.educationalLevel)}</span>}
                {(inst.email || inst.phone) && <span><span className="text-gray-300">Contacto:</span> {inst.email || inst.phone}</span>}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={(e) => toggleActive(inst, e)}
                  disabled={toggling === inst.id}
                  className={`text-xs font-medium rounded-[30px] px-4 py-1.5 border transition-all ${
                    inst.isActive
                      ? "border-red-200 text-red-500 hover:bg-red-50"
                      : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {toggling === inst.id ? "..." : inst.isActive ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden md:grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3 min-w-0">
                <p className="font-semibold text-[#1a1a1a] truncate">{inst.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {inst.code}
                  {inst.directorName && <> · Dir. {inst.directorName}</>}
                </p>
              </div>
              <div className="col-span-1">
                  <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                    inst.type === "private"
                      ? "bg-black text-white"
                      : "bg-black/5 text-black/60"
                  }`}>
                    {inst.type === "private" ? "Privada" : "Pública"}
                  </span>
                </div>
              <div className="col-span-2 text-sm text-gray-600 truncate">
                {[inst.district, inst.province, inst.department].filter(Boolean).join(", ") || <span className="text-gray-300">—</span>}
              </div>
              <div className="col-span-2 text-sm text-gray-600 truncate">
                {levels(inst.educationalLevel) || <span className="text-gray-300">—</span>}
              </div>
              <div className="col-span-2 text-sm text-gray-500 truncate">
                {inst.email || inst.phone || <span className="text-gray-300">—</span>}
              </div>
              <div className="col-span-1 flex justify-center">
                <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                  inst.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}>
                  {inst.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={(e) => toggleActive(inst, e)}
                  disabled={toggling === inst.id}
                  className={`text-xs font-medium rounded-[30px] px-3 py-1.5 border transition-all ${
                    inst.isActive
                      ? "border-red-200 text-red-500 hover:bg-red-50"
                      : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {toggling === inst.id ? "..." : inst.isActive ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {institutions.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white border border-gray-200 rounded-[30px]">
            No hay instituciones registradas.
          </div>
        )}
      </div>

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
