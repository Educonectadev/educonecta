"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Select from "@/components/Select"

const educationLevels = ["Bachiller", "Titulado", "Magíster", "Doctor"]
const contractTypes = ["Tiempo completo", "Medio tiempo", "Por horas", "CAS"]

export default function NuevoProfesorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "")
  }

  const [form, setForm] = useState({
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
      alert(data.error || "Error al registrar profesor")
    }
  }

  const previewEmail = form.firstName && form.lastName
    ? `${normalize(form.firstName)}.${normalize(form.lastName)}@colegio.edu.pe`
    : ""

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Registrar Profesor</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* Datos Personales */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Datos Personales</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">Nombres</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required
                className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Juan" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">Apellidos</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required
                className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Pérez" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">DNI / CE</label>
              <input name="documentId" value={form.documentId} onChange={handleChange}
                className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="12345678" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">Teléfono</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="987654321" />
            </div>
          </div>
        </div>

        {/* Datos Profesionales */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Datos Profesionales</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">Título Profesional</label>
              <input name="professionalTitle" value={form.professionalTitle} onChange={handleChange}
                className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Lic. en Educación" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">Especialidad</label>
              <input name="speciality" value={form.speciality} onChange={handleChange}
                className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Matemáticas" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">Nivel de Estudios</label>
              <Select value={form.educationLevel} onChange={(val) => setForm((prev) => ({ ...prev, educationLevel: val }))} options={educationLevels.map(l => ({value: l, label: l}))} placeholder="Seleccionar" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">Tipo de Contrato</label>
              <Select value={form.contractType} onChange={(val) => setForm((prev) => ({ ...prev, contractType: val }))} options={contractTypes.map(c => ({value: c, label: c}))} placeholder="Seleccionar" />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-500">Fecha de Contratación</label>
            <input type="date" name="hireDate" value={form.hireDate} onChange={handleChange}
              className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
        </div>

        {/* Contacto y Emergencia */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Contacto y Emergencia</p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">Dirección</label>
            <input name="address" value={form.address} onChange={handleChange}
              className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Av. Principal 123" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">Contacto de Emergencia</label>
              <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange}
                className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="María López" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-500">Tel. Emergencia</label>
              <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange}
                className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="987654321" />
            </div>
          </div>
        </div>

        {/* Acceso al Sistema */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Acceso al Sistema</p>
          {previewEmail && (
            <div className="bg-gray-50 rounded-[20px] px-5 py-3 mb-4">
              <p className="text-xs text-gray-400">Email generado automáticamente:</p>
              <p className="text-sm font-medium text-gray-700">{previewEmail}</p>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-500">Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="rounded-[30px] bg-black px-8 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <Link href="/dashboard/admin/profesores"
            className="rounded-[30px] border border-gray-200 px-7 py-3 text-sm font-medium text-gray-400 transition-all hover:bg-gray-50">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
