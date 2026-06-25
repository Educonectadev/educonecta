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

export default function EditableInstitutionSection({ institution }: { institution: Institution }) {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState(institution)

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
      <div className="bg-white border border-gray-100 rounded-[25px] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">Nombre</p>
            <p className="font-medium">{data.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Código</p>
            <p className="font-medium">{data.code}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Tipo</p>
            <p className="font-medium">{data.type ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">RUC</p>
            <p className="font-medium">{data.ruc ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Director</p>
            <p className="font-medium">{data.directorName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Teléfono</p>
            <p className="font-medium">{data.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="font-medium">{data.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Website</p>
            <p className="font-medium">{data.website ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Dirección</p>
            <p className="font-medium">{data.address ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Distrito</p>
            <p className="font-medium">{data.district ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Provincia</p>
            <p className="font-medium">{data.province ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Departamento</p>
            <p className="font-medium">{data.department ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Nivel Educativo</p>
            <p className="font-medium">{data.educationalLevel ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Turnos</p>
            <p className="font-medium">{data.shifts ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Año de Fundación</p>
            <p className="font-medium">{data.foundedYear ?? "—"}</p>
          </div>
        </div>
      </div>

      {showModal && (
        <InstitutionModal
          institution={data}
          onClose={() => setShowModal(false)}
          onUpdate={(updated) => { setData(updated); setShowModal(false) }}
        />
      )}
    </>
  )
}
