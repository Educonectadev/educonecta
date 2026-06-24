"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { departments, getProvinces, getDistricts } from "@/data/ubigeo"
import Link from "next/link"

const levelOptions = [
  { value: "inicial", label: "Inicial" },
  { value: "primaria", label: "Primaria" },
  { value: "secundaria", label: "Secundaria" },
]

const shiftOptions = [
  { value: "morning", label: "Mañana", defaultStart: "07:30", defaultEnd: "13:00" },
  { value: "afternoon", label: "Tarde", defaultStart: "13:30", defaultEnd: "17:00" },
  { value: "evening", label: "Noche", defaultStart: "18:00", defaultEnd: "21:00" },
]

const gradeStructure: Record<string, { name: string; grades: string[] }> = {
  inicial: { name: "Inicial", grades: ["3 años", "4 años", "5 años"] },
  primaria: { name: "Primaria", grades: ["1ero", "2do", "3ero", "4to", "5to", "6to"] },
  secundaria: { name: "Secundaria", grades: ["1ero", "2do", "3ero", "4to", "5to"] },
}

export default function NuevaInstitucionPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "public",
    ruc: "",
    address: "",
    district: "",
    province: "",
    department: "",
    phone: "",
    email: "",
    website: "",
    directorName: "",
    directorEmail: "",
    directorPassword: "",
    foundedYear: "",
    description: "",
    educationalLevel: [] as string[],
    shifts: [] as string[],
    sectionsPerGrade: 8,
    shiftTimes: {} as Record<string, { start: string; end: string }>,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<{
    institution: { name: string; code: string }
    user: { email: string; password: string } | null
    grades?: Record<string, string[]>
    sectionCount?: number
  } | null>(null)

  function toggleArray(field: "educationalLevel" | "shifts", value: string) {
    setForm((prev) => {
      const active = prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value]
      if (field === "shifts") {
        const times = { ...prev.shiftTimes }
        if (!active.includes(value)) {
          delete times[value]
        } else if (!times[value]) {
          const opt = shiftOptions.find((o) => o.value === value)
          times[value] = { start: opt?.defaultStart ?? "08:00", end: opt?.defaultEnd ?? "17:00" }
        }
        return { ...prev, shifts: active, shiftTimes: times }
      }
      return { ...prev, [field]: active }
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const shiftsPayload = form.shifts.map((id) => ({
      id,
      ...(form.shiftTimes[id] ?? { start: "08:00", end: "17:00" }),
    }))

    const payload = {
      ...form,
      foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
      educationalLevel: form.educationalLevel.join(","),
      shifts: JSON.stringify(shiftsPayload),
      directorEmail: form.directorEmail || null,
      directorPassword: form.directorPassword || null,
      sectionsPerGrade: form.sectionsPerGrade,
    }

    const res = await fetch("/api/super-admin/instituciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message ?? "Error al crear la institución.")
      setLoading(false)
      return
    }

    setCreated({
      institution: { name: data.institution.name, code: data.institution.code },
      user: data.user ? { email: form.directorEmail, password: form.directorPassword } : null,
      grades: data.grades,
      sectionCount: data.sectionCount,
    })
  }

  function setValue(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const inputClass = "mt-1 block w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm text-black placeholder:text-gray-300 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all bg-white"
  const labelClass = "block text-sm font-medium text-gray-500 mb-1.5"
  const selectClass = inputClass

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Nueva Institución</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-black transition-colors"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información General */}
          <section className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Información General</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-[30px] p-6 space-y-4">
              <div>
                <label htmlFor="name" className={labelClass}>Nombre de la Institución *</label>
                <input id="name" type="text" required value={form.name} onChange={(e) => setValue("name", e.target.value)} className={inputClass} placeholder="Ej: Colegio San José" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="code" className={labelClass}>Código *</label>
                  <input id="code" type="text" required value={form.code} onChange={(e) => setValue("code", e.target.value)} className={inputClass} placeholder="Ej: SJ-001" />
                </div>
                <div>
                  <label htmlFor="type" className={labelClass}>Tipo</label>
                  <select id="type" value={form.type} onChange={(e) => setValue("type", e.target.value)} className={selectClass}>
                    <option value="public">Pública</option>
                    <option value="private">Privada</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ruc" className={labelClass}>RUC</label>
                  <input id="ruc" type="text" maxLength={11} value={form.ruc} onChange={(e) => setValue("ruc", e.target.value)} className={inputClass} placeholder="11 dígitos" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Nivel(es) Educativo(s)</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {levelOptions.map((opt) => {
                    const selected = form.educationalLevel.includes(opt.value)
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleArray("educationalLevel", opt.value)}
                        className={`rounded-[30px] px-4 py-2 text-xs font-medium transition-all ${
                          selected
                            ? "bg-black text-white"
                            : "bg-white border border-black/10 text-black/50 hover:border-black/30"
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                {form.educationalLevel.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {form.educationalLevel.map((key) => {
                      const info = gradeStructure[key]
                      if (!info) return null
                      return (
                        <div key={key} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="inline-block w-2 h-2 rounded-full bg-black/20" />
                          <span className="font-medium">{info.name}:</span>
                          <span>{info.grades.length} grados</span>
                          <span className="text-gray-300">·</span>
                          <span>
                            {info.grades.map((g, i) => (
                              <span key={g}>
                                {i > 0 && ", "}
                                <span className="text-gray-600">{g}</span>
                              </span>
                            ))}
                          </span>
                        </div>
                      )
                    })}
                    <p className="text-[11px] text-gray-400 pt-1">
                      Se crearán {form.sectionsPerGrade} secciones (A-
                      {String.fromCharCode(64 + form.sectionsPerGrade)}) por cada grado.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Ubicación */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Ubicación</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-[30px] p-6 space-y-4 h-full">
              <div>
                <label htmlFor="address" className={labelClass}>Dirección</label>
                <input id="address" type="text" value={form.address} onChange={(e) => setValue("address", e.target.value)} className={inputClass} placeholder="Av. Principal 123" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="department" className={labelClass}>Departamento</label>
                  <select
                    id="department"
                    value={form.department}
                    onChange={(e) => {
                      setValue("department", e.target.value)
                      setValue("province", "")
                      setValue("district", "")
                    }}
                    className={selectClass}
                  >
                    <option value="">Seleccionar departamento</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="province" className={labelClass}>Provincia</label>
                  <select
                    id="province"
                    value={form.province}
                    onChange={(e) => {
                      setValue("province", e.target.value)
                      setValue("district", "")
                    }}
                    className={selectClass}
                    disabled={!form.department}
                  >
                    <option value="">Seleccionar provincia</option>
                    {getProvinces(form.department).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="district" className={labelClass}>Distrito</label>
                  <select
                    id="district"
                    value={form.district}
                    onChange={(e) => setValue("district", e.target.value)}
                    className={selectClass}
                    disabled={!form.province}
                  >
                    <option value="">Seleccionar distrito</option>
                    {getDistricts(form.department, form.province).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Contacto</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-[30px] p-6 space-y-4 h-full">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="phone" className={labelClass}>Teléfono</label>
                  <input id="phone" type="text" value={form.phone} onChange={(e) => setValue("phone", e.target.value)} className={inputClass} placeholder="+51 999 888 777" />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input id="email" type="email" value={form.email} onChange={(e) => setValue("email", e.target.value)} className={inputClass} placeholder="contacto@colegio.edu.pe" />
                </div>
                <div>
                  <label htmlFor="website" className={labelClass}>Sitio Web</label>
                  <input id="website" type="url" value={form.website} onChange={(e) => setValue("website", e.target.value)} className={inputClass} placeholder="https://colegio.edu.pe" />
                </div>
              </div>
            </div>
          </section>

          {/* Configuración */}
          <section className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4 -mt-2">Configuración</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-[30px] p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="directorName" className={labelClass}>Director(a)</label>
                  <input id="directorName" type="text" value={form.directorName} onChange={(e) => setValue("directorName", e.target.value)} className={inputClass} placeholder="Nombre del director" />
                </div>
                <div>
                  <label htmlFor="foundedYear" className={labelClass}>Año de Fundación</label>
                  <input id="foundedYear" type="number" min={1900} max={2030} value={form.foundedYear} onChange={(e) => setValue("foundedYear", e.target.value)} className={inputClass} placeholder="Ej: 1990" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Acceso del Director al Sistema</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="directorEmail" className={labelClass}>Email de acceso *</label>
                    <input id="directorEmail" type="email" value={form.directorEmail} onChange={(e) => setValue("directorEmail", e.target.value)} className={inputClass} placeholder="director@colegio.pe" />
                  </div>
                  <div>
                    <label htmlFor="directorPassword" className={labelClass}>Contraseña *</label>
                    <div className="relative">
                      <input id="directorPassword" type={showPassword ? "text" : "password"} value={form.directorPassword} onChange={(e) => setValue("directorPassword", e.target.value)} className={`${inputClass} pr-12`} placeholder="••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Si completas ambos campos, se creará automáticamente el usuario del director con acceso al dashboard.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Turno(s) y Horarios</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {shiftOptions.map((opt) => {
                      const selected = form.shifts.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleArray("shifts", opt.value)}
                          className={`rounded-[30px] px-4 py-2 text-xs font-medium transition-all ${
                            selected
                              ? "bg-black text-white"
                              : "bg-white border border-black/10 text-black/50 hover:border-black/30"
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                  {form.shifts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {form.shifts.map((id) => {
                        const opt = shiftOptions.find((o) => o.value === id)
                        const time = form.shiftTimes[id] ?? { start: "08:00", end: "17:00" }
                        return (
                          <div key={id} className="flex items-center gap-3 bg-white rounded-[20px] border border-gray-200 px-4 py-2.5">
                            <span className="text-xs font-medium text-gray-600 w-14 shrink-0">{opt?.label ?? id}</span>
                            <div className="flex items-center gap-2 flex-1">
                              <input type="time" value={time.start} onChange={(e) => setForm((p) => ({ ...p, shiftTimes: { ...p.shiftTimes, [id]: { ...(p.shiftTimes[id] ?? { start: "08:00", end: "17:00" }), start: e.target.value } } }))} className="flex-1 min-w-0 rounded-[15px] border border-gray-200 px-3 py-1.5 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black bg-white" />
                              <span className="text-xs text-gray-400 shrink-0">a</span>
                              <input type="time" value={time.end} onChange={(e) => setForm((p) => ({ ...p, shiftTimes: { ...p.shiftTimes, [id]: { ...(p.shiftTimes[id] ?? { start: "08:00", end: "17:00" }), end: e.target.value } } }))} className="flex-1 min-w-0 rounded-[15px] border border-gray-200 px-3 py-1.5 text-xs text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black bg-white" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Secciones por Grado</label>
                  <div className="flex items-center gap-3 mt-1">
                    <input type="range" min={1} max={20} value={form.sectionsPerGrade} onChange={(e) => setForm((p) => ({ ...p, sectionsPerGrade: Number(e.target.value) }))} className="flex-1 accent-black" />
                    <span className="text-sm font-medium text-black/70 w-8 text-center">{form.sectionsPerGrade}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Se crearán A-{String.fromCharCode(64 + form.sectionsPerGrade)}</p>
                </div>
              </div>
              <div>
                <label htmlFor="description" className={labelClass}>Descripción</label>
                <textarea id="description" rows={2} value={form.description} onChange={(e) => setValue("description", e.target.value)} className={inputClass} placeholder="Breve descripción o misión de la institución" />
              </div>
            </div>
          </section>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[30px] px-5 py-3">{error}</p>
        )}

        {!created && (
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-[30px] bg-black px-8 py-3 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Guardando..." : "Guardar Institución"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-[30px] border border-gray-200 bg-white px-7 py-3 text-sm font-medium text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        )}
      </form>

      {created && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-[30px] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg font-bold">✓</div>
            <div>
              <h3 className="text-sm font-bold text-emerald-800">
                {created.user ? "Institución y Director creados" : "Institución creada"}
              </h3>
              <p className="text-xs text-emerald-600">{created.institution.name} ({created.institution.code})</p>
            </div>
          </div>
          {created.user && (
            <div className="bg-white rounded-[20px] p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Credenciales del Director</p>
              <p className="text-sm"><span className="text-gray-400">Email:</span> <strong className="text-black">{created.user.email}</strong></p>
              <p className="text-sm"><span className="text-gray-400">Contraseña:</span> <strong className="text-black">{created.user.password}</strong></p>
            </div>
          )}
          {created.grades && Object.keys(created.grades).length > 0 && (
            <div className="bg-white rounded-[20px] p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Grados y secciones creados automáticamente</p>
              {Object.entries(created.grades).map(([level, grades]) => (
                <p key={level} className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{level}:</span> {grades.length} grados ({grades.join(", ")}) · {created.sectionCount ?? form.sectionsPerGrade} secciones c/u
                </p>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/super-admin/instituciones"
            className="inline-block rounded-[30px] bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 transition-all"
          >
            Ir a Instituciones
          </Link>
        </div>
      )}
    </div>
  )
}
