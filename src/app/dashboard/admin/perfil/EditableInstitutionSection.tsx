"use client"

import { useState } from "react"
import InstitutionModal from "../../super-admin/instituciones/InstitutionModal"

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

const levelLabels: Record<string, string> = {
  inicial: "Inicial",
  primaria: "Primaria",
  secundaria: "Secundaria",
}

const shiftLabels: Record<string, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  evening: "Noche",
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-[#1a1a1a]">{value ?? "—"}</p>
    </div>
  )
}

export default function EditableInstitutionSection({ institution }: { institution: Institution }) {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState(institution)

  const levels = data.educationalLevel ? data.educationalLevel.split(",").filter(Boolean) : []
  const shiftList = (() => {
    if (!data.shifts) return []
    try {
      const parsed = JSON.parse(data.shifts)
      if (Array.isArray(parsed)) return parsed
    } catch {}
    return data.shifts.split(",").filter(Boolean).map((id) => ({ id }))
  })()

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-500">Datos de la Institución</h2>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-[30px] bg-black px-5 py-2 text-xs font-medium text-white hover:bg-black/80 transition-all"
        >
          Editar
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[30px] p-6 space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-[25px] p-4 space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Información General</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <InfoRow label="Tipo" value={data.type === "private" ? "Privada" : "Pública"} />
              <InfoRow label="RUC" value={data.ruc} />
              <InfoRow label="Director(a)" value={data.directorName} />
              <InfoRow label="Fundación" value={data.foundedYear?.toString()} />
              <div className="col-span-2"><InfoRow label="Estado" value={data.isActive ? "Activo" : "Inactivo"} /></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-[25px] p-4 space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Ubicación</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div className="col-span-2"><InfoRow label="Dirección" value={data.address} /></div>
              <InfoRow label="Distrito" value={data.district} />
              <InfoRow label="Provincia" value={data.province} />
              <div className="col-span-2"><InfoRow label="Departamento" value={data.department} /></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-[25px] p-4 space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Contacto</h3>
            <InfoRow label="Email" value={data.email} />
            <InfoRow label="Teléfono" value={data.phone} />
            {data.website && <InfoRow label="Web" value={data.website} />}
          </div>
          <div className="bg-gray-50 rounded-[25px] p-4 space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Configuración</h3>
            {levels.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Niveles</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {levels.map((l) => (
                    <span key={l} className="inline-block rounded-[30px] bg-white border border-gray-200 px-2.5 py-0.5 text-[11px] text-gray-600">{levelLabels[l] ?? l}</span>
                  ))}
                </div>
              </div>
            )}
            {shiftList.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Turnos</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {shiftList.map((s: any) => {
                    const id = typeof s === "string" ? s : s.id
                    return (
                      <span key={id} className="inline-block rounded-[30px] bg-white border border-gray-200 px-2.5 py-0.5 text-[11px] text-gray-600">{shiftLabels[id] ?? id}</span>
                    )
                  })}
                </div>
              </div>
            )}
            {data.description && (
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Descripción</p>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{data.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
            data.type === "private" ? "bg-black text-white" : "bg-black/5 text-black/60"
          }`}>
            {data.type === "private" ? "Privada" : "Pública"}
          </span>
          <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium border ${
            data.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
          }`}>
            {data.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      {showModal && (
        <InstitutionModal
          institution={data}
          onClose={() => setShowModal(false)}
          onUpdate={(updated) => { setData(updated); setShowModal(false) }}
          readOnlyCode
        />
      )}
    </>
  )
}
