"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import InstitutionModal from "../../super-admin/instituciones/InstitutionModal"
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
      <p className="sa-eyebrow mb-0.5">{label}</p>
      <p className="text-sm" style={{ color: "var(--foreground)" }}>{value ?? "—"}</p>
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
        <p className="sa-eyebrow">Datos de la Institución</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}
          className="sa-btn sa-btn-primary">
          {getIcon("edit", { size: 14 })}
          Editar
        </motion.button>
      </div>

      <div className="sa-surface p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sa-surface-flat p-4 space-y-2.5">
            <p className="sa-eyebrow">Información General</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <InfoRow label="Tipo" value={data.type === "private" ? "Privada" : "Pública"} />
              <InfoRow label="RUC" value={data.ruc} />
              <InfoRow label="Director(a)" value={data.directorName} />
              <InfoRow label="Fundación" value={data.foundedYear?.toString()} />
              <div className="col-span-2"><InfoRow label="Estado" value={data.isActive ? "Activo" : "Inactivo"} /></div>
            </div>
          </div>
          <div className="sa-surface-flat p-4 space-y-2.5">
            <p className="sa-eyebrow">Ubicación</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div className="col-span-2"><InfoRow label="Dirección" value={data.address} /></div>
              <InfoRow label="Distrito" value={data.district} />
              <InfoRow label="Provincia" value={data.province} />
              <div className="col-span-2"><InfoRow label="Departamento" value={data.department} /></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sa-surface-flat p-4 space-y-2.5">
            <p className="sa-eyebrow">Contacto</p>
            <InfoRow label="Email" value={data.email} />
            <InfoRow label="Teléfono" value={data.phone} />
            {data.website && <InfoRow label="Web" value={data.website} />}
          </div>
          <div className="sa-surface-flat p-4 space-y-2.5">
            <p className="sa-eyebrow">Configuración</p>
            {levels.length > 0 && (
              <div>
                <p className="sa-eyebrow mb-1">Niveles</p>
                <div className="flex flex-wrap gap-1.5">
                  {levels.map((l) => (
                    <span key={l} className="sa-chip" style={{ background: "var(--surface-3)", color: "var(--foreground)" }}>{levelLabels[l] ?? l}</span>
                  ))}
                </div>
              </div>
            )}
            {shiftList.length > 0 && (
              <div>
                <p className="sa-eyebrow mb-1">Turnos</p>
                <div className="flex flex-wrap gap-1.5">
                  {shiftList.map((s: any) => {
                    const id = typeof s === "string" ? s : s.id
                    return (
                      <span key={id} className="sa-chip" style={{ background: "var(--surface-3)", color: "var(--foreground)" }}>{shiftLabels[id] ?? id}</span>
                    )
                  })}
                </div>
              </div>
            )}
            {data.description && (
              <div>
                <p className="sa-eyebrow mb-1">Descripción</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{data.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="sa-chip" style={{ background: data.type === "private" ? "var(--foreground)" : "var(--surface-3)", color: data.type === "private" ? "var(--background)" : "var(--muted-foreground)" }}>
            {data.type === "private" ? "Privada" : "Pública"}
          </span>
          <span className="sa-chip" style={{
            background: data.isActive ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "var(--surface-3)",
            color: data.isActive ? "var(--accent)" : "var(--muted-foreground)"
          }}>
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
