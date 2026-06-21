"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface CourseTeacher {
  id: number
  teacher: { id: number; user: { name: string } }
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

interface Course {
  id: number
  name: string
  code: string | null
  description: string | null
  teachers: CourseTeacher[]
}

interface Teacher { id: number; user: { name: string } }
interface Grade { id: number; name: string }
interface Section { id: number; name: string }

export default function CursosList({
  courses,
  teachers,
  grades,
  sections,
}: {
  courses: Course[]
  teachers: Teacher[]
  grades: Grade[]
  sections: Section[]
}) {
  const router = useRouter()

  const [editing, setEditing] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState<Course | null>(null)
  const [assigning, setAssigning] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const [form, setForm] = useState({ name: "", code: "", description: "" })
  const [assignForm, setAssignForm] = useState({ teacherId: "", gradeId: "", sectionId: "" })

  function openEdit(c: Course) {
    setEditing(c)
    setForm({ name: c.name, code: c.code ?? "", description: c.description ?? "" })
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    await fetch(`/api/admin/courses/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setLoading(false)
    setEditing(null)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    await fetch(`/api/admin/courses/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    setDeleting(null)
    router.refresh()
  }

  async function handleCreate() {
    setLoading(true)
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setLoading(false)
    setShowCreate(false)
    setForm({ name: "", code: "", description: "" })
    router.refresh()
  }

  async function handleAssign() {
    if (!assigning) return
    setLoading(true)
    await fetch("/api/admin/course-teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: assigning.id,
        teacherId: Number(assignForm.teacherId),
        gradeId: assignForm.gradeId ? Number(assignForm.gradeId) : null,
        sectionId: assignForm.sectionId ? Number(assignForm.sectionId) : null,
      }),
    })
    setLoading(false)
    setAssignForm({ teacherId: "", gradeId: "", sectionId: "" })
    router.refresh()
  }

  async function handleRemoveAssignment(ctId: number) {
    await fetch("/api/admin/course-teachers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ctId }),
    })
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Cursos</h1>
        <button onClick={() => setShowCreate(true)} className="rounded-[30px] bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 text-center">
          + Nuevo Curso
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-[30px]">
        <table className="w-full text-sm">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Profesores</th>
              <th className="px-6 py-4">Grados / Secciones</th>
              <th className="px-6 py-4 w-32">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 md:divide-y-0">
            {courses.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No hay cursos registrados.</td></tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="flex flex-col md:table-row border border-gray-200 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0">
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 font-medium">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Nombre</span>
                    <span>{c.name}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Código</span>
                    <span>{c.code ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Profesores</span>
                    <span>{c.teachers.map((t) => t.teacher.user.name).join(", ") || "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Grados / Secciones</span>
                    <span>{c.teachers.map((t) => [t.grade?.name, t.section?.name].filter(Boolean).join(" / ")).join(", ") || "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Acciones</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => { setAssigning(c); setAssignForm({ teacherId: "", gradeId: "", sectionId: "" }) }} className="text-xs text-gray-500 hover:text-black transition-all border border-gray-200 rounded-[30px] px-2.5 py-1">+ Profesor</button>
                      <button onClick={() => openEdit(c)} className="text-xs text-gray-500 hover:text-black transition-all border border-gray-200 rounded-[30px] px-2.5 py-1">Editar</button>
                      <button onClick={() => setDeleting(c)} className="text-xs text-red-500 hover:text-red-700 transition-all border border-red-200 rounded-[30px] px-2.5 py-1">Eliminar</button>
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
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-md w-full p-8 animate-fade-in">
            <h2 className="text-xl font-bold tracking-tight mb-6">Nuevo Curso</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Código</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" rows={3} />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleCreate} disabled={loading} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">{loading ? "Creando..." : "Crear"}</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-md w-full p-8 animate-fade-in">
            <h2 className="text-xl font-bold tracking-tight mb-6">Editar Curso</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Código</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all" rows={3} />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">{loading ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      {assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setAssigning(null) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-md w-full p-8 animate-fade-in">
            <h2 className="text-xl font-bold tracking-tight mb-2">Asignar Profesor</h2>
            <p className="text-sm text-gray-500 mb-6">Curso: {assigning.name}</p>

            {assigning.teachers.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Asignados actualmente</p>
                <div className="space-y-1.5">
                  {assigning.teachers.map((ct) => (
                    <div key={ct.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{ct.teacher.user.name} {ct.grade ? `(${ct.grade.name} / ${ct.section?.name ?? "—"})` : ""}</span>
                      <button onClick={() => handleRemoveAssignment(ct.id)} className="text-xs text-red-500 hover:text-red-700">Quitar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Profesor</label>
                <select value={assignForm.teacherId} onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all">
                  <option value="">Seleccionar...</option>
                  {teachers.filter((t) => !assigning.teachers.some((ct) => ct.teacher.id === t.id)).map((t) => (
                    <option key={t.id} value={t.id}>{t.user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Grado</label>
                <select value={assignForm.gradeId} onChange={(e) => setAssignForm({ ...assignForm, gradeId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all">
                  <option value="">Todos</option>
                  {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sección</label>
                <select value={assignForm.sectionId} onChange={(e) => setAssignForm({ ...assignForm, sectionId: e.target.value })} className="w-full rounded-[30px] border border-gray-200 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all">
                  <option value="">Todas</option>
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setAssigning(null)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cerrar</button>
              <button onClick={handleAssign} disabled={loading || !assignForm.teacherId} className="flex-1 rounded-[30px] bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50">
                {loading ? "Asignando..." : "Asignar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setDeleting(null) }}>
          <div className="relative bg-white rounded-[25px] border border-gray-200 shadow-xl max-w-sm w-full p-8 animate-fade-in text-center">
            <h2 className="text-lg font-bold tracking-tight mb-2">¿Eliminar curso?</h2>
            <p className="text-sm text-gray-500">Se eliminará {deleting.name} y todos sus horarios. Esta acción no se puede deshacer.</p>
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
