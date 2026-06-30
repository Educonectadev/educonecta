"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "@heroui/react"
import Select from "@/components/Select"

const educationLevels = ["Bachiller", "Titulado", "Magíster", "Doctor"]
const contractTypes = ["Tiempo completo", "Medio tiempo", "Por horas", "CAS"]
const assignedLevelOptions = [
  { value: "INICIAL", label: "Inicial" },
  { value: "PRIMARIA", label: "Primaria" },
  { value: "SECUNDARIA", label: "Secundaria" },
] as const

export default function NuevoProfesorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [institutionName, setInstitutionName] = useState("")

  useEffect(() => {
    fetch("/api/admin/institution-name").then(r => r.json()).then(d => setInstitutionName(d.name || "colegio"))
  }, [])

  function normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "")
  }

  const [form, setForm] = useState<{
    firstName: string
    lastName: string
    password: string
    phone: string
    speciality: string
    documentId: string
    professionalTitle: string
    educationLevel: string
    hireDate: string
    contractType: string
    address: string
    emergencyContactName: string
    emergencyContactPhone: string
    assignedLevels: string[]
  }>({
    firstName: "",
    lastName: "",
    password: "",
    phone: "",
    speciality: "",
    documentId: "",
    professionalTitle: "",
    educationLevel: "",
    hireDate: "",
    contractType: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    assignedLevels: [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (res.ok) {
      router.push("/dashboard/admin/profesores")
      router.refresh()
    } else {
      const data = await res.json()
      toast.danger(data.error || "Error al registrar profesor")
    }
  }

  const domain = normalize(institutionName) || "colegio"
  const previewEmail = form.firstName && form.lastName
    ? `${normalize(form.firstName)}.${normalize(form.lastName)}@${domain}.edu.pe`
    : ""

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}>
      <div className="mb-8">
        <p className="sa-eyebrow">Planilla docente</p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Registrar Profesor</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* Datos Personales */}
        <div>
          <p className="sa-eyebrow mb-4">Datos Personales</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block sa-eyebrow mb-1.5">Nombres</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required
                className="sa-input w-full" placeholder="Juan" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Apellidos</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required
                className="sa-input w-full" placeholder="Pérez" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block sa-eyebrow mb-1.5">DNI / CE</label>
              <input name="documentId" value={form.documentId} onChange={handleChange}
                className="sa-input w-full" placeholder="12345678" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Teléfono</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="sa-input w-full" placeholder="987654321" />
            </div>
          </div>
        </div>

        {/* Datos Profesionales */}
        <div>
          <p className="sa-eyebrow mb-4">Datos Profesionales</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block sa-eyebrow mb-1.5">Título Profesional</label>
              <input name="professionalTitle" value={form.professionalTitle} onChange={handleChange}
                className="sa-input w-full" placeholder="Lic. en Educación" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Especialidad</label>
              <input name="speciality" value={form.speciality} onChange={handleChange}
                className="sa-input w-full" placeholder="Matemáticas" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block sa-eyebrow mb-1.5">Nivel de Estudios</label>
              <Select value={form.educationLevel} onChange={(val) => setForm((prev) => ({ ...prev, educationLevel: val }))} options={educationLevels.map(l => ({value: l, label: l}))} placeholder="Seleccionar" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Tipo de Contrato</label>
              <Select value={form.contractType} onChange={(val) => setForm((prev) => ({ ...prev, contractType: val }))} options={contractTypes.map(c => ({value: c, label: c}))} placeholder="Seleccionar" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block sa-eyebrow mb-1.5">Fecha de Contratación</label>
            <input type="date" name="hireDate" value={form.hireDate} onChange={handleChange}
              className="sa-input w-full" />
          </div>
        </div>

        {/* Niveles Asignados */}
        <div>
          <p className="sa-eyebrow mb-4">Niveles Asignados</p>
          <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Selecciona los niveles educativos en los que el profesor dicta clases.</p>
          <div className="flex flex-wrap gap-2">
            {assignedLevelOptions.map((opt) => {
              const selected = form.assignedLevels.includes(opt.value)
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      assignedLevels: selected
                        ? prev.assignedLevels.filter((v) => v !== opt.value)
                        : [...prev.assignedLevels, opt.value],
                    }))
                  }
                  className={"sa-chip cursor-pointer text-sm " + (selected ? "sa-accent sa-accent-border" : "")}
                  style={selected ? { background: "var(--accent)", color: "var(--background)", borderColor: "var(--accent)" } : {}}
                >
                  {opt.label}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Contacto y Emergencia */}
        <div>
          <p className="sa-eyebrow mb-4">Contacto y Emergencia</p>
          <div>
            <label className="block sa-eyebrow mb-1.5">Dirección</label>
            <input name="address" value={form.address} onChange={handleChange}
              className="sa-input w-full" placeholder="Av. Principal 123" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block sa-eyebrow mb-1.5">Contacto de Emergencia</label>
              <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange}
                className="sa-input w-full" placeholder="María López" />
            </div>
            <div>
              <label className="block sa-eyebrow mb-1.5">Tel. Emergencia</label>
              <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange}
                className="sa-input w-full" placeholder="987654321" />
            </div>
          </div>
        </div>

        {/* Acceso al Sistema */}
        <div>
          <p className="sa-eyebrow mb-4">Acceso al Sistema</p>
          {previewEmail && (
            <div className="px-5 py-3 rounded-[var(--radius-tile)] mb-4" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Email generado automáticamente:</p>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{previewEmail}</p>
            </div>
          )}
          <div>
            <label className="block sa-eyebrow mb-1.5">Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="sa-input w-full" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="sa-btn sa-btn-primary">
            {loading ? "Guardando..." : "Guardar"}
          </motion.button>
          <Link href="/dashboard/admin/profesores"
            className="sa-btn sa-btn-ghost">
            Cancelar
          </Link>
        </div>
      </form>
    </motion.div>
  )
}
