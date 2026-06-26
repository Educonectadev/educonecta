"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/Modal"
import Select from "@/components/Select"
import TimePickerField from "@/components/TimePickerField"

interface StudentWithParent {
  studentId: number
  firstName: string
  lastName: string
  gradeId: number | null
  sectionId: number | null
  parentId: number | null
  parentName: string | null
}

const dayLabels: Record<number, string> = {
  1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes",
}

const shiftBlocks = {
  MAÑANA: [
    { label: "1er Bloque", start: "06:10", end: "08:00" },
    { label: "2do Bloque", start: "08:00", end: "09:45" },
    { label: "Receso", start: "09:45", end: "10:00", recess: true },
    { label: "3er Bloque", start: "10:00", end: "12:00" },
  ],
  TARDE: [
    { label: "1er Bloque", start: "12:00", end: "13:45" },
    { label: "2do Bloque", start: "13:45", end: "15:30" },
    { label: "Receso", start: "15:30", end: "15:45", recess: true },
    { label: "3er Bloque", start: "15:45", end: "18:00" },
  ],
}

interface Schedule {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  classroom: string | null
  shift: string
  course: { id: number; name: string }
  teacher: { id: number; name: string; speciality: string | null } | null
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

interface Course { id: number; name: string }
interface Classroom { id: number; name: string; code: string | null }
interface Teacher { id: number; userId: number; name: string; speciality: string | null }
interface Grade { id: number; name: string; defaultShift?: string | null }
interface Section { id: number; name: string; gradeId: number }

interface FormState {
  dayOfWeek: string
  startTime: string
  endTime: string
  classroom: string
  courseId: string
  shift: string
  teacherId: string
  gradeId: string
  sectionId: string
}

const emptyForm: FormState = {
  dayOfWeek: "1", startTime: "07:00", endTime: "08:00", classroom: "", courseId: "", shift: "MAÑANA",
  teacherId: "", gradeId: "", sectionId: "",
}

interface BlockForm {
  courseId: string
  teacherId: string
  gradeId: string
  sectionId: string
  classroom: string
}

function emptyBlock(): BlockForm {
  return { courseId: "", teacherId: "", gradeId: "", sectionId: "", classroom: "" }
}

export default function HorariosList({
  schedules, courses, classrooms, teachers, grades, sections, studentsWithParents,
}: {
  schedules: Schedule[]; courses: Course[]; classrooms: Classroom[]; teachers: Teacher[]; grades: Grade[]; sections: Section[]; studentsWithParents: StudentWithParent[]
}) {
  const router = useRouter()

  const [showCreate, setShowCreate] = useState(false)
  const [showJornada, setShowJornada] = useState(false)
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [deleting, setDeleting] = useState<Schedule | null>(null)
  const [detail, setDetail] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>({ ...emptyForm })

  const [jornadaDay, setJornadaDay] = useState("1")
  const [jornadaShift, setJornadaShift] = useState("MAÑANA")
  const [blocks, setBlocks] = useState<BlockForm[]>([emptyBlock(), emptyBlock(), emptyBlock()])

  function resetForm() { setForm({ ...emptyForm }) }

  const filteredSections = useMemo(() => {
    if (!form.gradeId) return []
    return sections.filter((s) => String(s.gradeId) === form.gradeId)
  }, [form.gradeId, sections])

  const previewStudents = useMemo(() => {
    if (!form.gradeId || !form.sectionId) return []
    const gId = Number(form.gradeId)
    const secId = Number(form.sectionId)
    const map: Record<number, { student: StudentWithParent; parents: string[] }> = {}
    for (const r of studentsWithParents) {
      if (r.gradeId !== gId || r.sectionId !== secId) continue
      if (!map[r.studentId]) {
        map[r.studentId] = { student: r, parents: [] }
      }
      if (r.parentName) {
        if (!map[r.studentId].parents.includes(r.parentName)) {
          map[r.studentId].parents.push(r.parentName)
        }
      }
    }
    return Object.values(map).sort((a, b) => a.student.lastName.localeCompare(b.student.lastName))
  }, [form.gradeId, form.sectionId, studentsWithParents])

  function openEdit(s: Schedule) {
    setEditing(s)
    setForm({
      dayOfWeek: s.dayOfWeek.toString(),
      startTime: s.startTime,
      endTime: s.endTime,
      classroom: s.classroom ?? "",
      courseId: s.course.id.toString(),
      shift: s.shift,
      teacherId: s.teacher?.id.toString() ?? "",
      gradeId: s.grade?.id.toString() ?? "",
      sectionId: s.section?.id.toString() ?? "",
    })
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCreate() {
    setLoading(true)
    const res = await fetch("/api/admin/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: Number(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        classroom: form.classroom || null,
        shift: form.shift,
        courseId: Number(form.courseId),
        teacherId: form.teacherId ? Number(form.teacherId) : null,
        gradeId: form.gradeId ? Number(form.gradeId) : null,
        sectionId: form.sectionId ? Number(form.sectionId) : null,
      }),
    })
    setLoading(false)
    if (!res.ok) return
    setShowCreate(false)
    resetForm()
    router.refresh()
  }

  function updateBlock(idx: number, field: keyof BlockForm, value: string) {
    setBlocks((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  async function handleCreateJornada() {
    setLoading(true)
    const blockDefs = shiftBlocks[jornadaShift as keyof typeof shiftBlocks]
    const courseBlocks = blockDefs.filter((b) => !b.recess)
    const requests: Promise<Response>[] = []
    for (let i = 0; i < courseBlocks.length; i++) {
      const b = blocks[i]
      if (!b.courseId) continue
      const blk = courseBlocks[i]
      requests.push(
        fetch("/api/admin/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayOfWeek: Number(jornadaDay),
            startTime: blk.start,
            endTime: blk.end,
            classroom: b.classroom || null,
            shift: jornadaShift,
            courseId: Number(b.courseId),
            teacherId: b.teacherId ? Number(b.teacherId) : null,
            gradeId: b.gradeId ? Number(b.gradeId) : null,
            sectionId: b.sectionId ? Number(b.sectionId) : null,
          }),
        })
      )
    }
    await Promise.all(requests)
    setLoading(false)
    setShowJornada(false)
    setBlocks([emptyBlock(), emptyBlock(), emptyBlock()])
    router.refresh()
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    await fetch(`/api/admin/schedules/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: Number(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        classroom: form.classroom || null,
        shift: form.shift,
        courseId: Number(form.courseId),
        teacherId: form.teacherId ? Number(form.teacherId) : null,
        gradeId: form.gradeId ? Number(form.gradeId) : null,
        sectionId: form.sectionId ? Number(form.sectionId) : null,
      }),
    })
    setLoading(false)
    setEditing(null)
    router.refresh()
  }

  async function handleDelete() {
    if (!deleting) return
    setLoading(true)
    await fetch(`/api/admin/schedules/${deleting.id}`, { method: "DELETE" })
    setLoading(false)
    setDeleting(null)
    router.refresh()
  }

  function handlePrint() {
    const printWin = window.open("", "_blank")
    if (!printWin) return
    const days = [1, 2, 3, 4, 5]
    const grouped: Record<string, Schedule[]> = {}
    for (const s of schedules) {
      const key = `${s.dayOfWeek}-${s.shift}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(s)
    }
    printWin.document.write(`
      <html><head><title>Horarios</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        .shift-title { font-weight: bold; margin: 16px 0 6px; font-size: 14px; }
        @media print { .no-print { display: none; } }
      </style></head><body>
      <h1>Horario de Clases</h1>
      ${days.map((d) => {
        const daySchedules = schedules.filter((s) => s.dayOfWeek === d)
        if (daySchedules.length === 0) return ""
        const morning = daySchedules.filter((s) => s.shift === "MAÑANA")
        const evening = daySchedules.filter((s) => s.shift === "TARDE")
        let html = `<h2 class="shift-title">${dayLabels[d]}</h2>`
        for (const shift of [morning, evening]) {
          if (shift.length === 0) continue
          html += `<p>Turno: ${shift[0].shift}</p>`
          html += `<table><thead><tr><th>Inicio</th><th>Fin</th><th>Curso</th><th>Profesor</th><th>Grado</th><th>Sección</th><th>Aula</th></tr></thead><tbody>`
          for (const s of shift) {
            html += `<tr><td>${s.startTime}</td><td>${s.endTime}</td><td>${s.course.name}</td><td>${s.teacher?.name ?? "—"}</td><td>${s.grade?.name ?? "—"}</td><td>${s.section?.name ?? "—"}</td><td>${s.classroom ?? "—"}</td></tr>`
          }
          html += `</tbody></table>`
        }
        return html
      }).join("")}
      </body></html>
    `)
    printWin.document.close()
    setTimeout(() => printWin.print(), 300)
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Horarios</h1>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="rounded-[30px] border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            Imprimir
          </button>
          <button onClick={() => { setShowJornada(true); setJornadaDay("1"); setJornadaShift("MAÑANA"); setBlocks([emptyBlock(), emptyBlock(), emptyBlock()]) }} className="rounded-[30px] border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            + Crear Jornada
          </button>
          <button onClick={() => { setShowCreate(true); resetForm() }} className="rounded-[30px] btn-primary px-5 py-2.5 text-sm font-medium">
            + Nuevo Horario
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-[30px] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4 whitespace-nowrap">Día</th>
              <th className="px-6 py-4 whitespace-nowrap">Turno</th>
              <th className="px-6 py-4 whitespace-nowrap">Curso</th>
              <th className="px-6 py-4 whitespace-nowrap">Profesor</th>
              <th className="px-6 py-4 whitespace-nowrap">Grado</th>
              <th className="px-6 py-4 whitespace-nowrap">Sección</th>
              <th className="px-6 py-4 whitespace-nowrap">Inicio</th>
              <th className="px-6 py-4 whitespace-nowrap">Fin</th>
              <th className="px-6 py-4 whitespace-nowrap">Aula</th>
              <th className="px-6 py-4 w-24 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 md:divide-y-0">
            {schedules.length === 0 ? (
              <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-500">No hay horarios registrados.</td></tr>
            ) : (
              schedules.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setDetail(s)}
                  className="flex flex-col md:table-row border border-gray-200 md:border-0 rounded-[30px] p-4 md:p-0 mb-3 md:mb-0 cursor-pointer transition-colors hover:bg-gray-100/50"
                >
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 font-medium">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Día</span>
                    <span>{dayLabels[s.dayOfWeek] ?? `Día ${s.dayOfWeek}`}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Turno</span>
                    <span className={`text-xs font-semibold uppercase ${s.shift === "MAÑANA" ? "text-amber-600" : "text-blue-600"}`}>{s.shift}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Curso</span>
                    <span>{s.course.name}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Profesor</span>
                    <span>{s.teacher?.name ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Grado</span>
                    <span>{s.grade?.name ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Sección</span>
                    <span>{s.section?.name ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Inicio</span>
                    <span>{s.startTime}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Fin</span>
                    <span>{s.endTime}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4 text-gray-500">
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Aula</span>
                    <span>{s.classroom ?? "—"}</span>
                  </td>
                  <td className="flex justify-between md:table-cell px-0 md:px-6 py-1 md:py-4" onClick={(e) => e.stopPropagation()}>
                    <span className="md:hidden text-xs uppercase tracking-widest text-gray-500">Acciones</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="text-xs text-gray-500 hover:text-black transition-all border border-gray-200 rounded-[30px] px-3 py-1">Editar</button>
                      <button onClick={() => setDeleting(s)} className="text-xs text-red-500 hover:text-red-700 transition-all border border-red-200 rounded-[30px] px-3 py-1">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          header, nav, .no-print { display: none !important; }
          body { padding: 0; margin: 0; }
        }
      `}</style>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detalle del Horario">
        {detail && (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Día</p>
                  <p className="font-medium">{dayLabels[detail.dayOfWeek]}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Turno</p>
                  <p className="font-medium">{detail.shift}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Inicio</p>
                  <p className="font-medium">{detail.startTime}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Fin</p>
                  <p className="font-medium">{detail.endTime}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Curso</p>
                <p className="font-medium text-lg">{detail.course.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Profesor</p>
                  <p className="font-medium">{detail.teacher?.name ?? "—"}</p>
                  {detail.teacher?.speciality && <p className="text-xs text-gray-400">{detail.teacher.speciality}</p>}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Aula</p>
                  <p className="font-medium">{detail.classroom ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Grado</p>
                  <p className="font-medium">{detail.grade?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Sección</p>
                  <p className="font-medium">{detail.section?.name ?? "—"}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setDetail(null); openEdit(detail) }} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Editar</button>
              <button onClick={() => setDetail(null)} className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium">Cerrar</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={showCreate || !!editing} onClose={() => { setShowCreate(false); setEditing(null) }} title={showCreate ? "Nuevo Horario" : "Editar Horario"} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Curso</label>
            <Select value={form.courseId} onChange={(val) => updateField("courseId", val)} options={courses.map(c => ({value: String(c.id), label: c.name}))} placeholder="Seleccionar..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Profesor</label>
            <Select value={form.teacherId} onChange={(val) => updateField("teacherId", val)} options={teachers.map(t => ({value: String(t.id), label: t.name + (t.speciality ? ` — ${t.speciality}` : "")}))} placeholder="Seleccionar..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Grado</label>
              <Select value={form.gradeId} onChange={(val) => {
                updateField("gradeId", val)
                updateField("sectionId", "")
                const g = grades.find((gr) => gr.id === Number(val))
                if (g?.defaultShift) {
                  const shift = g.defaultShift
                  updateField("shift", shift)
                  updateField("startTime", shift === "MAÑANA" ? "06:10" : "12:00")
                  updateField("endTime", shift === "MAÑANA" ? "12:00" : "18:00")
                }
              }} options={grades.map(g => ({value: String(g.id), label: g.name}))} placeholder="Seleccionar..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sección</label>
              <Select key={`sec-${form.gradeId}`} value={form.sectionId} onChange={(val) => updateField("sectionId", val)} options={filteredSections.map(sec => ({value: String(sec.id), label: sec.name}))} placeholder="Seleccionar..." />
            </div>
          </div>
          {previewStudents.length > 0 && (
            <div className="bg-gray-50 rounded-[20px] p-4 max-h-48 overflow-y-auto scrollbar-hide">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Alumnos ({previewStudents.length}) y sus padres
              </p>
              <div className="space-y-1.5">
                {previewStudents.map(({ student, parents }) => (
                  <div key={student.studentId} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{student.lastName}, {student.firstName}</span>
                    <span className="text-xs text-gray-400 truncate ml-2 max-w-[180px]">
                      {parents.length > 0 ? parents.join(", ") : "Sin padre asignado"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Día</label>
            <Select value={form.dayOfWeek} onChange={(val) => updateField("dayOfWeek", val)} options={Object.entries(dayLabels).map(([k, v]) => ({value: k, label: v}))} placeholder="" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Turno</label>
            <Select value={form.shift} onChange={(val) => {
              updateField("shift", val)
              updateField("startTime", val === "MAÑANA" ? "06:10" : "12:00")
              updateField("endTime", val === "MAÑANA" ? "12:00" : "18:00")
            }} options={[{value: "MAÑANA", label: "Mañana (6:10 - 12:00)"}, {value: "TARDE", label: "Tarde (12:00 - 18:00)"}]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Inicio</label>
              <TimePickerField value={form.startTime} onChange={(val) => updateField("startTime", val)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fin</label>
              <TimePickerField value={form.endTime} onChange={(val) => updateField("endTime", val)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Aula</label>
            <Select value={form.classroom} onChange={(val) => updateField("classroom", val)} options={classrooms.map(a => ({value: a.name, label: a.name + (a.code ? ` (${a.code})` : "")}))} placeholder="Sin aula" />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => { setShowCreate(false); setEditing(null) }} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={showCreate ? handleCreate : handleSave} disabled={loading || !form.courseId} className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : showCreate ? "Crear" : "Guardar"}
          </button>
        </div>
      </Modal>

      <Modal open={showJornada} onClose={() => setShowJornada(false)} title="Crear Jornada" size="2xl" scroll="inside">
        <p className="text-sm text-gray-500 mb-6">Define los bloques de curso para un día completo. El receso se agrega automáticamente.</p>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Día</label>
            <Select value={jornadaDay} onChange={setJornadaDay} options={Object.entries(dayLabels).map(([k, v]) => ({value: k, label: v}))} placeholder="" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Turno</label>
            <Select value={jornadaShift} onChange={setJornadaShift} options={[{value: "MAÑANA", label: "Mañana (6:10 - 12:00)"}, {value: "TARDE", label: "Tarde (12:00 - 18:00)"}]} />
          </div>
        </div>

        {shiftBlocks[jornadaShift as keyof typeof shiftBlocks].filter((b) => !b.recess).map((block, idx) => {
          const filteredSecs = blocks[idx]?.gradeId
            ? sections.filter((s) => String(s.gradeId) === blocks[idx].gradeId)
            : []
          return (
            <div key={idx} className="border border-gray-200 rounded-[25px] p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{block.label}</h3>
                <span className="text-xs text-gray-400">{block.start} – {block.end}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Curso</label>
                  <Select value={blocks[idx]?.courseId ?? ""} onChange={(val) => updateBlock(idx, "courseId", val)} options={courses.map(c => ({value: String(c.id), label: c.name}))} placeholder="Seleccionar..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Profesor</label>
                  <Select value={blocks[idx]?.teacherId ?? ""} onChange={(val) => updateBlock(idx, "teacherId", val)} options={teachers.map(t => ({value: String(t.id), label: t.name + (t.speciality ? ` — ${t.speciality}` : "")}))} placeholder="Seleccionar..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Grado</label>
                  <Select value={blocks[idx]?.gradeId ?? ""} onChange={(val) => { updateBlock(idx, "gradeId", val); updateBlock(idx, "sectionId", "") }} options={grades.map(g => ({value: String(g.id), label: g.name}))} placeholder="Seleccionar..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sección</label>
                  <Select key={`blk-sec-${idx}-${blocks[idx]?.gradeId ?? ""}`} value={blocks[idx]?.sectionId ?? ""} onChange={(val) => updateBlock(idx, "sectionId", val)} options={blocks[idx]?.gradeId ? sections.filter((s) => String(s.gradeId) === blocks[idx].gradeId).map(sec => ({value: String(sec.id), label: sec.name})) : []} placeholder="Seleccionar..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Aula</label>
                  <Select value={blocks[idx]?.classroom ?? ""} onChange={(val) => updateBlock(idx, "classroom", val)} options={classrooms.map(a => ({value: a.name, label: a.name + (a.code ? ` (${a.code})` : "")}))} placeholder="Sin aula" />
                </div>
                  </div>
                </div>
              )
            })}

        <div className="bg-amber-50 rounded-[20px] p-4 text-sm text-amber-700 mb-4">
          <span className="font-semibold">Receso:</span> {shiftBlocks[jornadaShift as keyof typeof shiftBlocks].find((b) => b.recess)?.start} – {shiftBlocks[jornadaShift as keyof typeof shiftBlocks].find((b) => b.recess)?.end} (15 min) — se agrega automáticamente
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowJornada(false)} className="flex-1 rounded-[30px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={handleCreateJornada} disabled={loading || blocks.every((b) => !b.courseId)} className="flex-1 rounded-[30px] btn-primary py-2.5 text-sm font-medium">
            {loading ? "Guardando..." : "Guardar Jornada"}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar horario" size="sm">
        <p className="text-sm text-gray-500 text-center">{deleting ? `${dayLabels[deleting.dayOfWeek]} — ${deleting.course.name} (${deleting.startTime} - ${deleting.endTime}). Esta acción no se puede deshacer.` : ""}</p>
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
