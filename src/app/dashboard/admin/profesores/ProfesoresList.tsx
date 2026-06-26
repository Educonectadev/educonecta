"use client"

import { useState, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import Modal from "@/components/Modal"
import Select from "@/components/Select"
import DataTable from "@/components/DataTable"

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
            <Select value={form.educationLevel} onChange={(val) => setField("educationLevel", val)} options={educationLevels.map(l => ({value: l, label: l}))} placeholder="Seleccionar" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Contrato</label>
            <Select value={form.contractType} onChange={(val) => setField("contractType", val)} options={contractTypes.map(c => ({value: c, label: c}))} placeholder="Seleccionar" />
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
      lastName: parts.slice(1).join(" "),
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
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    })
    setLoading(false)
    if (res.ok) {
      setShowCreate(false)
      resetForm()
      router.refresh()
    } else {
      const data = await res.json()
      toast.danger(data.error || "Error al registrar profesor")
    }
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    const res = await fetch(`/api/admin/teachers/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, password: form.password || undefined }),
    })
    setLoading(false)
    if (res.ok) {
      setEditing(null)
      router.refresh()
    } else {
      const data = await res.json()
      toast.danger(data.error || "Error al actualizar profesor")
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    const res = await fetch(`/api/admin/teachers/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    if (res.ok) {
      setDeleting(null)
      router.refresh()
    } else {
      toast.danger("Error al eliminar profesor")
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Profesores</h1>
        <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] bg-black dark:bg-white px-6 py-2.5 text-sm font-medium text-white dark:text-black transition-all hover:bg-gray-800 dark:hover:bg-zinc-200 text-center">+ Contratar Profesor</button>
      </div>

      <DataTable
        data={teachers}
        emptyMessage="No hay profesores registrados."
        onEdit={openEdit}
        onDelete={(t) => setDeleting(t)}
        columns={[
          {
            key: "name",
            label: "Profesor",
            sortable: true,
            render: (t) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                  {t.user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.user.name}</p>
                  <p className="text-[11px] text-gray-400">{t.user.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "speciality",
            label: "Especialidad",
            sortable: true,
            render: (t) => t.speciality ? <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5">{t.speciality}</span> : <span className="text-xs text-gray-400">—</span>,
          },
          {
            key: "contractType",
            label: "Contrato",
            sortable: true,
            render: (t) => t.contractType ? <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5">{t.contractType}</span> : <span className="text-xs text-gray-400">—</span>,
          },
          {
            key: "educationLevel",
            label: "Nivel",
            render: (t) => (t.educationLevel || t.professionalTitle) ? <span className="text-xs bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5">{t.educationLevel || t.professionalTitle}</span> : <span className="text-xs text-gray-400">—</span>,
          },
        ]}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Contratar Profesor" size="lg">
        <TeacherFormFields form={form} setField={setField} passwordRequired />
        <div className="flex gap-3 mt-8">
          <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleCreate} disabled={loading || !form.firstName || !form.lastName || !form.password} className="flex-1 rounded-[30px] bg-black dark:bg-white text-white dark:text-black py-2.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50">
            {loading ? "Guardando..." : "Contratar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Profesor" size="lg">
        <TeacherFormFields form={form} setField={setField} passwordRequired={false} />
        <div className="flex gap-3 mt-8">
          <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] bg-black dark:bg-white text-white dark:text-black py-2.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar profesor" size="sm">
        <p className="text-sm text-gray-500 text-center">Se eliminará {deleting?.user?.name}. Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setDeleting(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 rounded-[30px] bg-red-600 text-white py-2.5 text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50">
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </Modal>
    </>
  )
}
