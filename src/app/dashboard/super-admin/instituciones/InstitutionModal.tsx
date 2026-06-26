"use client"

import { useState, FormEvent, useEffect, useCallback } from "react"
import { departments, getProvinces, getDistricts } from "@/data/ubigeo"
import Select from "@/components/Select"
import { Modal } from "@heroui/react"

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
  readOnlyCode,
}: {
  institution: Institution
  onClose: () => void
  onUpdate: (updated: Institution) => void
  readOnlyCode?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...institution })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editDirectorEmail, setEditDirectorEmail] = useState("")
  const [editDirectorPassword, setEditDirectorPassword] = useState("")
  const [showEditPassword, setShowEditPassword] = useState(false)
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

  useEffect(() => {
    if (directorUser) setEditDirectorEmail(directorUser.email)
  }, [directorUser])

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

    const payload: Record<string, unknown> = { ...form }
    if (editDirectorEmail) payload.directorEmail = editDirectorEmail
    if (editDirectorPassword) payload.directorPassword = editDirectorPassword
    const res = await fetch(`/api/super-admin/instituciones?id=${institution.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

  const labelClass = "block text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1.5"
  const inputClass = "w-full rounded-[30px] border border-gray-200 dark:border-zinc-700 px-5 py-3 text-sm text-gray-900 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all bg-white dark:bg-zinc-800"
  const selectClass = inputClass

  function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-[25px] border border-gray-100 dark:border-zinc-700 p-4 text-center">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">{label}</p>
      </div>
    )
  }

  return (
    <Modal isOpen onOpenChange={(v) => { if (!v) onClose() }}>
      <Modal.Backdrop>
      <Modal.Container size="cover" scroll="inside">
        <Modal.Dialog className="z-[60]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center justify-between w-full gap-4">
                <div className="min-w-0 flex-1">
                  <span className="truncate block text-gray-900 dark:text-white/90">
                    {editing ? "Editar Institución" : institution.name}
                  </span>
                  {!editing && <span className="text-xs text-gray-400 dark:text-zinc-500 font-normal mt-0.5 block">Código: {institution.code}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!editing ? (
                    <>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-[30px] border border-red-200 dark:border-red-800 px-4 py-2 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => setEditing(true)}
                        className="rounded-[30px] bg-black dark:bg-white px-5 py-2 text-xs font-medium text-white dark:text-black hover:bg-black/80 dark:hover:bg-zinc-200 transition-all"
                      >
                        Editar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setEditing(false); setForm({ ...institution }); setError("") }}
                      className="text-sm text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body className="overflow-x-hidden">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" required value={form.name} onChange={(e) => setValue("name", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Código *</label>
                <input type="text" required value={form.code} onChange={(e) => setValue("code", e.target.value)} className={inputClass} readOnly={readOnlyCode} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo</label>
                <Select value={form.type ?? "public"} onChange={(val) => setValue("type", val)} options={[{value: "public", label: "Pública"}, {value: "private", label: "Privada"}]} className="mt-1" />
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
                <Select value={form.department ?? ""} onChange={(val) => { setValue("department", val); setValue("province", ""); setValue("district", "") }} options={[{value: "", label: "Seleccionar"}, ...departments.map(d => ({value: d, label: d}))]} className="mt-1" />
              </div>
              <div>
                <label className={labelClass}>Provincia</label>
                <Select value={form.province ?? ""} onChange={(val) => { setValue("province", val); setValue("district", "") }} options={[{value: "", label: "Seleccionar"}, ...getProvinces(form.department ?? "").map(p => ({value: p, label: p}))]} disabled={!form.department} className="mt-1" />
              </div>
              <div>
                <label className={labelClass}>Distrito</label>
                <Select value={form.district ?? ""} onChange={(val) => setValue("district", val)} options={[{value: "", label: "Seleccionar"}, ...getDistricts(form.department ?? "", form.province ?? "").map(d => ({value: d, label: d}))]} disabled={!form.province} className="mt-1" />
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

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Acceso del Director</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email de acceso</label>
                  <input type="email" value={editDirectorEmail} onChange={(e) => setEditDirectorEmail(e.target.value)} className={inputClass} placeholder="director@colegio.pe" />
                </div>
                <div>
                  <label className={labelClass}>{editDirectorPassword ? "Nueva contraseña" : "Contraseña (dejar vacío para no cambiar)"}</label>
                  <div className="relative">
                    <input type={showEditPassword ? "text" : "password"} value={editDirectorPassword} onChange={(e) => setEditDirectorPassword(e.target.value)} className={`${inputClass} pr-12`} placeholder="••••••" />
                    <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                      {showEditPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
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
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-[30px] px-5 py-3">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-[30px] bg-black dark:bg-white px-8 py-3 text-sm font-medium text-white dark:text-black hover:bg-black/80 dark:hover:bg-zinc-200 disabled:opacity-50 transition-all"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Usuarios y Recursos</h3>
              {statsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-zinc-800 rounded-[25px] p-4 animate-pulse">
                      <div className="h-6 w-10 bg-gray-200 dark:bg-zinc-700 rounded mx-auto mb-2" />
                      <div className="h-3 w-14 bg-gray-200 dark:bg-zinc-700 rounded mx-auto" />
                    </div>
                  ))}
                </div>
              ) : stats ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <StatCard value={stats.total} label="Total" color="text-gray-900 dark:text-white/90" />
                  <StatCard value={stats.admins} label="Admins" color="text-black dark:text-white" />
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
            <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-[25px] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Director(a) - Acceso al Sistema</h3>
                {!directorLoading && !directorUser && !showCreateDirector && (
                  <button                 onClick={() => setShowCreateDirector(true)} className="text-[11px] font-medium text-black dark:text-white hover:text-black/60 dark:hover:text-white/60 transition-colors">Crear Acceso</button>
                )}
              </div>
              {directorLoading ? (
                <div className="h-10 bg-gray-200/60 dark:bg-zinc-700/60 rounded-[20px] animate-pulse" />
              ) : directorUser ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white/90">{directorUser.name}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">{directorUser.email}</p>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-[30px] px-3 py-1 font-medium">Acceso creado</span>
                </div>
              ) : showCreateDirector ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Nombre</p>
                    <input type="text" value={directorForm.name} onChange={(e) => setDirectorForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-[20px] border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all bg-white dark:bg-zinc-800" placeholder="Nombre del director" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Email *</p>
                      <input type="email" value={directorForm.email} onChange={(e) => setDirectorForm((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-[20px] border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all bg-white dark:bg-zinc-800" placeholder="director@colegio.pe" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Contraseña *</p>
                      <input type="password" value={directorForm.password} onChange={(e) => setDirectorForm((p) => ({ ...p, password: e.target.value }))} className="w-full rounded-[20px] border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-zinc-600 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all bg-white dark:bg-zinc-800" placeholder="••••••" />
                    </div>
                  </div>
                  {directorError && <p className="text-xs text-red-600 dark:text-red-400">{directorError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateDirector}
                      disabled={directorSaving}
                      className="rounded-[30px] bg-black dark:bg-white px-5 py-2 text-xs font-medium text-white dark:text-black hover:bg-black/80 dark:hover:bg-zinc-200 disabled:opacity-50 transition-all"
                    >
                      {directorSaving ? "Creando..." : "Crear Director"}
                    </button>
                    <button
                      onClick={() => { setShowCreateDirector(false); setDirectorError("") }}
                      className="text-xs text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-zinc-500">Sin acceso configurado</p>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-[25px] p-4 space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Información General</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <InfoRow label="Tipo" value={institution.type === "private" ? "Privada" : "Pública"} />
                  <InfoRow label="RUC" value={institution.ruc} />
                  <InfoRow label="Director(a)" value={institution.directorName} />
                  <InfoRow label="Fundación" value={institution.foundedYear?.toString()} />
                  <div className="col-span-2"><InfoRow label="Estado" value={institution.isActive ? "Activo" : "Inactivo"} /></div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-[25px] p-4 space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Ubicación</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="col-span-2"><InfoRow label="Dirección" value={institution.address} /></div>
                  <InfoRow label="Distrito" value={institution.district} />
                  <InfoRow label="Provincia" value={institution.province} />
                  <div className="col-span-2"><InfoRow label="Departamento" value={institution.department} /></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-[25px] p-4 space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Contacto</h3>
                <InfoRow label="Email" value={institution.email} />
                <InfoRow label="Teléfono" value={institution.phone} />
                {institution.website && <InfoRow label="Web" value={institution.website} />}
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-[25px] p-4 space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Configuración</h3>
                {levels.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Niveles</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {levels.map((l) => (
                        <span key={l} className="inline-block rounded-[30px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2.5 py-0.5 text-[11px] text-gray-600 dark:text-zinc-300">{levelLabels[l] ?? l}</span>
                      ))}
                    </div>
                  </div>
                )}
                {shiftList.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Turnos</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {shiftList.map((s: any) => {
                        const id = typeof s === "string" ? s : s.id
                        const label = shiftLabels[id] ?? id
                        const times = !s.start ? "" : `${s.start} - ${s.end}`
                        return (
                          <span key={id} className="inline-block rounded-[30px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2.5 py-0.5 text-[11px] text-gray-600 dark:text-zinc-300">
                            {label}{times ? ` (${times})` : ""}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
                {institution.description && (
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Descripción</p>
                    <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1 leading-relaxed">{institution.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-1.5">
              <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium ${
                institution.type === "private" ? "bg-black dark:bg-white text-white dark:text-black" : "bg-black/5 dark:bg-white/10 text-black/60 dark:text-zinc-400"
              }`}>
                {institution.type === "private" ? "Privada" : "Pública"}
              </span>
              <span className={`inline-block rounded-[30px] px-3 py-1 text-[11px] font-medium border ${
                institution.isActive ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
              }`}>
                {institution.isActive ? "Activo" : "Inactivo"}
              </span>
              {stats && (
                <span className="inline-block rounded-[30px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-3 py-1 text-[11px] font-medium">
                  {stats.total} usuarios
                </span>
              )}
              {stats && (
                <span className="inline-block rounded-[30px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-3 py-1 text-[11px] font-medium">
                  {stats.courses} cursos · {stats.grades} grados
                </span>
              )}
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center p-6">
            <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-800 rounded-[25px] shadow-xl dark:shadow-black/50 p-6 max-w-sm w-full space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 dark:text-red-400 text-xl">!</div>
              <div>
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">¿Eliminar institución?</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Se eliminarán todos los usuarios, cursos, grados y datos asociados. Esta acción no se puede deshacer.</p>
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
                  className="rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-2.5 text-xs font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-900 dark:text-white/90">{value ?? "—"}</p>
    </div>
  )
}
