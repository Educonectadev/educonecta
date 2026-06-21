"use client"

import { useState, FormEvent, useEffect, useCallback } from "react"
import { departments, getProvinces, getDistricts } from "@/data/ubigeo"

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

interface Stats {
  total: number
  admins: number
  teachers: number
  parents: number
  students: number
  courses: number
  grades: number
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

export default function InstitutionModal({
  institution,
  onClose,
  onUpdate,
}: {
  institution: Institution
  onClose: () => void
  onUpdate: (updated: Institution) => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...institution })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [directorUser, setDirectorUser] = useState<{ id: number; email: string; name: string } | null>(null)
  const [directorLoading, setDirectorLoading] = useState(true)
  const [showCreateDirector, setShowCreateDirector] = useState(false)
  const [directorForm, setDirectorForm] = useState({ email: "", password: "", name: institution.directorName ?? "" })
  const [directorSaving, setDirectorSaving] = useState(false)
  const [directorError, setDirectorError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    setDeleting(true)
    const res = await fetch(`/api/super-admin/instituciones?id=${institution.id}`, { method: "DELETE" })
    if (res.ok) {
      onUpdate(institution)
      onClose()
      window.location.reload()
    }
    setDeleting(false)
  }, [institution.id, onUpdate, onClose])

  useEffect(() => {
    fetch(`/api/super-admin/instituciones/stats?id=${institution.id}`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setStatsLoading(false))
  }, [institution.id])

  useEffect(() => {
    setDirectorLoading(true)
    fetch(`/api/super-admin/instituciones/admin?institutionId=${institution.id}`)
      .then((r) => r.json())
      .then((data) => {
        setDirectorUser(data)
        if (data) setDirectorForm((prev) => ({ ...prev, name: data.name, email: data.email }))
      })
      .finally(() => setDirectorLoading(false))
  }, [institution.id])

  async function handleCreateDirector() {
    setDirectorError("")
    setDirectorSaving(true)
    const res = await fetch("/api/super-admin/instituciones/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ institutionId: institution.id, ...directorForm }),
    })
    const data = await res.json()
    setDirectorSaving(false)
    if (!res.ok) {
      setDirectorError(data.message ?? "Error al crear director")
      return
    }
    setDirectorUser(data.user)
    setShowCreateDirector(false)
    fetch(`/api/super-admin/instituciones/stats?id=${institution.id}`)
      .then((r) => r.json())
      .then(setStats)
  }

  function setValue(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch(`/api/super-admin/instituciones?id=${institution.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.message ?? "Error al guardar")
      return
    }

    onUpdate(data.institution)
    setEditing(false)
  }

  const levels = institution.educationalLevel ? institution.educationalLevel.split(",").filter(Boolean) : []
  const shiftList = (() => {
    if (!institution.shifts) return []
    try {
      const parsed = JSON.parse(institution.shifts)
      if (Array.isArray(parsed)) return parsed
    } catch {}
    return institution.shifts.split(",").filter(Boolean).map((id) => ({ id }))
  })()

  const labelClass = "block text-sm font-medium text-gray-500 mb-1.5"
  const inputClass = "w-full rounded-[30px] border border-gray-200 px-5 py-3 text-sm text-black placeholder:text-gray-300 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all bg-white"
  const selectClass = inputClass

  function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
    return (
      <div className="bg-white rounded-[25px] border border-gray-100 p-4 text-center">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wider">{label}</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-y-auto scrollbar-hide animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 rounded-t-[30px]">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight truncate">
              {editing ? "Editar Institución" : institution.name}
            </h2>
            {!editing && <p className="text-xs text-gray-400 mt-0.5">Código: {institution.code}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {!editing ? (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-[30px] border border-red-200 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-[30px] bg-gray-800 px-5 py-2 text-xs font-medium text-white hover:bg-black transition-all"
                >
                  Editar
                </button>
              </>
            ) : (
              <button
                onClick={() => { setEditing(false); setForm({ ...institution }); setError("") }}
                className="text-sm text-gray-400 hover:text-black transition-colors"
              >
                Cancelar
              </button>
            )}
            <button onClick={onClose} className="text-gray-300 hover:text-black transition-colors text-lg leading-none">&times;</button>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" required value={form.name} onChange={(e) => setValue("name", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Código *</label>
                <input type="text" required value={form.code} onChange={(e) => setValue("code", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo</label>
                <select value={form.type ?? "public"} onChange={(e) => setValue("type", e.target.value)} className={selectClass}>
                  <option value="public">Pública</option>
                  <option value="private">Privada</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>RUC</label>
                <input type="text" maxLength={11} value={form.ruc ?? ""} onChange={(e) => setValue("ruc", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Dirección</label>
              <input type="text" value={form.address ?? ""} onChange={(e) => setValue("address", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Departamento</label>
                <select value={form.department ?? ""} onChange={(e) => { setValue("department", e.target.value); setValue("province", ""); setValue("district", "") }} className={selectClass}>
                  <option value="">Seleccionar</option>
                  {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Provincia</label>
                <select value={form.province ?? ""} onChange={(e) => { setValue("province", e.target.value); setValue("district", "") }} className={selectClass} disabled={!form.department}>
                  <option value="">Seleccionar</option>
                  {getProvinces(form.department ?? "").map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Distrito</label>
                <select value={form.district ?? ""} onChange={(e) => setValue("district", e.target.value)} className={selectClass} disabled={!form.province}>
                  <option value="">Seleccionar</option>
                  {getDistricts(form.department ?? "", form.province ?? "").map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Teléfono</label>
                <input type="text" value={form.phone ?? ""} onChange={(e) => setValue("phone", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={form.email ?? ""} onChange={(e) => setValue("email", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Sitio Web</label>
              <input type="url" value={form.website ?? ""} onChange={(e) => setValue("website", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Director(a)</label>
                <input type="text" value={form.directorName ?? ""} onChange={(e) => setValue("directorName", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Año de Fundación</label>
                <input type="number" min={1900} max={2030} value={form.foundedYear ?? ""} onChange={(e) => setValue("foundedYear", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Nivel(es) Educativo(s)</label>
              <input type="text" value={form.educationalLevel ?? ""} onChange={(e) => setValue("educationalLevel", e.target.value)} className={inputClass} placeholder="inicial, primaria, secundaria" />
            </div>
            <div>
              <label className={labelClass}>Turno(s)</label>
              <input type="text" value={form.shifts ?? ""} onChange={(e) => setValue("shifts", e.target.value)} className={inputClass} placeholder="morning, afternoon, evening" />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea rows={3} value={form.description ?? ""} onChange={(e) => setValue("description", e.target.value)} className={inputClass} />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[30px] px-5 py-3">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-[30px] bg-gray-800 px-8 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-50 transition-all"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Usuarios y Recursos</h3>
              {statsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-[25px] p-4 animate-pulse">
                      <div className="h-6 w-10 bg-gray-200 rounded mx-auto mb-2" />
                      <div className="h-3 w-14 bg-gray-200 rounded mx-auto" />
                    </div>
                  ))}
                </div>
              ) : stats ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <StatCard value={stats.total} label="Total" color="text-gray-900" />
                  <StatCard value={stats.admins} label="Admins" color="text-blue-600" />
                  <StatCard value={stats.teachers} label="Docentes" color="text-emerald-600" />
                  <StatCard value={stats.parents} label="Padres" color="text-amber-600" />
                  <StatCard value={stats.students} label="Alumnos" color="text-violet-600" />
                  <StatCard value={stats.courses} label="Cursos" color="text-rose-600" />
                </div>
              ) : (
                <p className="text-sm text-gray-400">No se pudieron cargar las estadísticas.</p>
              )}
            </div>

            {/* Director Admin */}
            <div className="bg-gray-50 rounded-[25px] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Director(a) - Acceso al Sistema</h3>
                {!directorLoading && !directorUser && !showCreateDirector && (
                  <button onClick={() => setShowCreateDirector(true)} className="text-[11px] font-medium text-black hover:text-gray-600 transition-colors">Crear Acceso</button>
                )}
              </div>
              {directorLoading ? (
                <div className="h-10 bg-gray-200/60 rounded-[20px] animate-pulse" />
              ) : directorUser ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{directorUser.name}</p>
                    <p className="text-xs text-gray-400">{directorUser.email}</p>
                  </div>
                  <span className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-[30px] px-3 py-1 font-medium">Acceso creado</span>
                </div>
              ) : showCreateDirector ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Nombre</p>
                    <input type="text" value={directorForm.name} onChange={(e) => setDirectorForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-[20px] border border-gray-200 px-4 py-2.5 text-sm text-black placeholder:text-gray-300 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all bg-white" placeholder="Nombre del director" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Email *</p>
                      <input type="email" value={directorForm.email} onChange={(e) => setDirectorForm((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-[20px] border border-gray-200 px-4 py-2.5 text-sm text-black placeholder:text-gray-300 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all bg-white" placeholder="director@colegio.pe" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Contraseña *</p>
                      <input type="password" value={directorForm.password} onChange={(e) => setDirectorForm((p) => ({ ...p, password: e.target.value }))} className="w-full rounded-[20px] border border-gray-200 px-4 py-2.5 text-sm text-black placeholder:text-gray-300 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all bg-white" placeholder="••••••" />
                    </div>
                  </div>
                  {directorError && <p className="text-xs text-red-600">{directorError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateDirector}
                      disabled={directorSaving}
                      className="rounded-[30px] bg-gray-800 px-5 py-2 text-xs font-medium text-white hover:bg-black disabled:opacity-50 transition-all"
                    >
                      {directorSaving ? "Creando..." : "Crear Director"}
                    </button>
                    <button
                      onClick={() => { setShowCreateDirector(false); setDirectorError("") }}
                      className="text-xs text-gray-400 hover:text-black transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin acceso configurado</p>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-[25px] p-4 space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Información General</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <InfoRow label="Tipo" value={institution.type === "private" ? "Privada" : "Pública"} />
                  <InfoRow label="RUC" value={institution.ruc} />
                  <InfoRow label="Director(a)" value={institution.directorName} />
                  <InfoRow label="Fundación" value={institution.foundedYear?.toString()} />
                  <div className="col-span-2"><InfoRow label="Estado" value={institution.isActive ? "Activo" : "Inactivo"} /></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-[25px] p-4 space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Ubicación</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="col-span-2"><InfoRow label="Dirección" value={institution.address} /></div>
                  <InfoRow label="Distrito" value={institution.district} />
                  <InfoRow label="Provincia" value={institution.province} />
                  <div className="col-span-2"><InfoRow label="Departamento" value={institution.department} /></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-[25px] p-4 space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Contacto</h3>
                <InfoRow label="Email" value={institution.email} />
                <InfoRow label="Teléfono" value={institution.phone} />
                {institution.website && <InfoRow label="Web" value={institution.website} />}
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
                        const label = shiftLabels[id] ?? id
                        const times = !s.start ? "" : `${s.start} - ${s.end}`
                        return (
                          <span key={id} className="inline-block rounded-[30px] bg-white border border-gray-200 px-2.5 py-0.5 text-[11px] text-gray-600">
                            {label}{times ? ` (${times})` : ""}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
                {institution.description && (
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Descripción</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{institution.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-1.5">
              <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                institution.type === "private" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {institution.type === "private" ? "Privada" : "Pública"}
              </span>
              <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium border ${
                institution.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
              }`}>
                {institution.isActive ? "Activo" : "Inactivo"}
              </span>
              {stats && (
                <span className="inline-block rounded-[30px] bg-gray-100 text-gray-600 px-3 py-1 text-[11px] font-medium">
                  {stats.total} usuarios
                </span>
              )}
              {stats && (
                <span className="inline-block rounded-[30px] bg-gray-100 text-gray-600 px-3 py-1 text-[11px] font-medium">
                  {stats.courses} cursos · {stats.grades} grados
                </span>
              )}
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm rounded-[30px] flex items-center justify-center p-6">
            <div className="bg-white border border-red-200 rounded-[25px] shadow-xl p-6 max-w-sm w-full space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xl">!</div>
              <div>
                <h3 className="text-sm font-bold text-red-800">¿Eliminar institución?</h3>
                <p className="text-xs text-gray-500 mt-1">Se eliminarán todos los usuarios, cursos, grados y datos asociados. Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-[30px] bg-red-600 px-6 py-2.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                  {deleting ? "Eliminando..." : "Sí, eliminar"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="rounded-[30px] border border-gray-200 bg-white px-6 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-[#1a1a1a]">{value ?? "—"}</p>
    </div>
  )
}
