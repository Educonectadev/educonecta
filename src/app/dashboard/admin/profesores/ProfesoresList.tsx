"use client"

import { useState, useCallback, memo } from "react"
import { useRouter } from "next/navigation"

interface Teacher {
  id: number
  speciality: string | null
  documentId: string | null
  professionalTitle: string | null
  educationLevel: string | null
  hireDate: string | null
  contractType: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  user: { id: number; name: string; email: string; phone: string | null }
}

interface FormState {
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
}

const emptyForm: FormState = {
  firstName: "", lastName: "", password: "", phone: "", speciality: "",
  documentId: "", professionalTitle: "", educationLevel: "", hireDate: "",
  contractType: "", address: "", emergencyContactName: "", emergencyContactPhone: "",
}

const educationLevels = ["Bachiller", "Titulado", "Magíster", "Doctor"]
const contractTypes = ["Tiempo completo", "Medio tiempo", "Por horas", "CAS"]

function previewEmail(firstName: string, lastName: string) {
  if (!firstName || !lastName) return ""
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return `${norm(firstName)}.${norm(lastName)}@colegio.edu.pe`
}

const TeacherFormFields = memo(function TeacherFormFields({
  form,
  setField,
  passwordRequired,
}: {
  form: FormState
  setField: (field: keyof FormState, value: string) => void
  passwordRequired: boolean
}) {
  const email = previewEmail(form.firstName, form.lastName)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Datos Personales</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nombres</label>
            <input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Juan" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Apellidos</label>
            <input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Pérez" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">DNI / CE</label>
            <input value={form.documentId} onChange={(e) => setField("documentId", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="12345678" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
            <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="987654321" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Datos Profesionales</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Título Profesional</label>
            <input value={form.professionalTitle} onChange={(e) => setField("professionalTitle", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Lic. en Educación" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Especialidad</label>
            <input value={form.speciality} onChange={(e) => setField("speciality", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Matemáticas" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nivel de Estudios</label>
            <select value={form.educationLevel} onChange={(e) => setField("educationLevel", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all">
              <option value="">Seleccionar</option>
              {educationLevels.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Contrato</label>
            <select value={form.contractType} onChange={(e) => setField("contractType", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all">
              <option value="">Seleccionar</option>
              {contractTypes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Contratación</label>
          <input type="date" value={form.hireDate} onChange={(e) => setField("hireDate", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Contacto y Emergencia</p>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
          <input value={form.address} onChange={(e) => setField("address", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="Av. Principal 123" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Contacto de Emergencia</label>
            <input value={form.emergencyContactName} onChange={(e) => setField("emergencyContactName", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="María López" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tel. Emergencia</label>
            <input value={form.emergencyContactPhone} onChange={(e) => setField("emergencyContactPhone", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" placeholder="987654321" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Acceso al Sistema</p>
        {email && (
          <div className="bg-gray-50 rounded-[20px] px-4 py-2.5 mb-3">
            <p className="text-[11px] text-gray-400">Email generado automáticamente:</p>
            <p className="text-sm font-medium text-gray-700">{email}</p>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{passwordRequired ? "Contraseña" : "Nueva contraseña (dejar vacío para mantener)"}</label>
          <input type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
        </div>
      </div>
    </div>
  )
})

export default function ProfesoresList({ teachers }: { teachers: Teacher[] }) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [deleting, setDeleting] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>({ ...emptyForm })

  function resetForm() { setForm({ ...emptyForm }) }

  function openEdit(t: Teacher) {
    const parts = t.user.name.split(" ")
    setEditing(t)
    setForm({
      firstName: parts[0] ?? "",
      lastName: (parts.slice(1).join(" ") || parts[0]) ?? "",
      password: "",
      phone: t.user.phone ?? "",
      speciality: t.speciality ?? "",
      documentId: t.documentId ?? "",
      professionalTitle: t.professionalTitle ?? "",
      educationLevel: t.educationLevel ?? "",
      hireDate: t.hireDate ?? "",
      contractType: t.contractType ?? "",
      address: t.address ?? "",
      emergencyContactName: t.emergencyContactName ?? "",
      emergencyContactPhone: t.emergencyContactPhone ?? "",
    })
  }

  const setField = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  async function handleCreate() {
    setLoading(true)
    await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    })
    setLoading(false)
    setShowCreate(false)
    resetForm()
    router.refresh()
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    await fetch(`/api/admin/teachers/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, password: form.password || undefined }),
    })
    setLoading(false)
    setEditing(null)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    await fetch(`/api/admin/teachers/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    setDeleting(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Profesores</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 text-center">+ Contratar Profesor</button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-[30px] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4 whitespace-nowrap">Nombre</th>
              <th className="px-6 py-4 whitespace-nowrap">Email</th>
              <th className="px-6 py-4 whitespace-nowrap">DNI / CE</th>
              <th className="px-6 py-4 whitespace-nowrap">Especialidad</th>
              <th className="px-6 py-4 whitespace-nowrap">Nivel / Título</th>
              <th className="px-6 py-4 whitespace-nowrap">Contrato</th>
              <th className="px-6 py-4 w-24 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 md:divide-y-0">
            {teachers.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No hay profesores registrados.</td></tr>
            ) : (
              teachers.map((t) => (
                <tr key={t.id} className="flex flex-col md:table-row border border-gray-200 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0">
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 font-medium">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Nombre</span>
                    <span>{t.user.name}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Email</span>
                    <span className="text-xs">{t.user.email}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">DNI / CE</span>
                    <span>{t.documentId ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Especialidad</span>
                    <span>{t.speciality ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Nivel / Título</span>
                    <span>{(t.educationLevel ?? t.professionalTitle) ? `${t.educationLevel ?? ""}${t.educationLevel && t.professionalTitle ? " · " : ""}${t.professionalTitle ?? ""}` : "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Contrato</span>
                    <span>{t.contractType ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Acciones</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="text-xs text-gray-500 hover:text-black transition-all border border-gray-200 rounded-[30px] px-3 py-1">Editar</button>
                      <button onClick={() => setDeleting(t)} className="text-xs text-red-500 hover:text-red-700 transition-all border border-red-200 rounded-[30px] px-3 py-1">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-lg w-full p-8 animate-fade-in max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h2 className="text-xl font-bold tracking-tight mb-6">Contratar Profesor</h2>
            <TeacherFormFields form={form} setField={setField} passwordRequired />
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleCreate} disabled={loading || !form.firstName || !form.lastName || !form.password} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
                {loading ? "Guardando..." : "Contratar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-lg w-full p-8 animate-fade-in max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h2 className="text-xl font-bold tracking-tight mb-6">Editar Profesor</h2>
            <TeacherFormFields form={form} setField={setField} passwordRequired={false} />
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setDeleting(null) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-sm w-full p-8 animate-fade-in text-center">
            <h2 className="text-lg font-bold tracking-tight mb-2">¿Eliminar profesor?</h2>
            <p className="text-sm text-gray-500">Se eliminará {deleting.user.name}. Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleting(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 rounded-[30px] bg-red-600 text-white py-2.5 text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50">
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
