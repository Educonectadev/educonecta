"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Student {
  id: number
  firstName: string
  lastName: string
}

interface CourseTeacher {
  id: number
  courseId: number
  gradeId: number | null
  sectionId: number | null
  course: { id: number; name: string }
  grade: { id: number; name: string } | null
  section: { id: number; name: string } | null
}

export default function TomarAsistenciaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [courses, setCourses] = useState<CourseTeacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<number, { isPresent: boolean; minutesLate: number }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const selectedCourse = searchParams.get("courseId")
  const selectedGrade = searchParams.get("gradeId")
  const selectedSection = searchParams.get("sectionId")

  useEffect(() => {
    fetch("/api/teacher/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data)
        if (!selectedCourse && data.length > 0) {
          const first = data[0]
          router.replace(
            `/dashboard/teacher/asistencia/tomar?courseId=${first.courseId}&gradeId=${first.gradeId ?? ""}&sectionId=${first.sectionId ?? ""}`
          )
        }
      })
  }, [router, selectedCourse])

  useEffect(() => {
    if (selectedGrade && selectedSection) {
      const params = new URLSearchParams({ gradeId: selectedGrade, sectionId: selectedSection })
      fetch(`/api/teacher/courses/students?${params}`)
        .then((r) => r.json())
        .then((data) => {
          setStudents(data)
          const init: Record<number, { isPresent: boolean; minutesLate: number }> = {}
          data.forEach((s: Student) => {
            init[s.id] = { isPresent: true, minutesLate: 0 }
          })
          setAttendance(init)
        })
    }
  }, [selectedGrade, selectedSection])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return
    setSubmitting(true)
    setMessage("")

    const records = Object.entries(attendance).map(([studentId, data]) => ({
      studentId: Number(studentId),
      isPresent: data.isPresent,
      minutesLate: data.minutesLate,
    }))

    const res = await fetch("/api/teacher/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: Number(selectedCourse),
        date: new Date().toISOString(),
        records,
      }),
    })

    const result = await res.json()
    setSubmitting(false)
    if (result.success) {
      setMessage("Asistencia registrada correctamente.")
    } else {
      setMessage("Error al registrar asistencia.")
    }
  }

  const setPresent = (studentId: number, present: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], isPresent: present },
    }))
  }

  const updateMinutes = (studentId: number, minutes: number) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], minutesLate: Math.max(0, minutes) },
    }))
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Tomar Asistencia</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Marca presente, ausente o tardanza</p>
        </div>
        <Link
          href="/dashboard/teacher/asistencia"
          className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Volver
        </Link>
      </div>

      {message && (
        <p className="text-sm border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-1.5">Curso</label>
          <select
            value={selectedCourse ?? ""}
            onChange={(e) => {
              const ct = courses.find((c) => c.courseId === Number(e.target.value))
              router.replace(
                `/dashboard/teacher/asistencia/tomar?courseId=${e.target.value}&gradeId=${ct?.gradeId ?? ""}&sectionId=${ct?.sectionId ?? ""}`
              )
            }}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
          >
            {courses.map((ct) => (
              <option key={ct.id} value={ct.courseId}>
                {ct.course.name} — {ct.grade?.name ?? ""} / {ct.section?.name ?? ""}
              </option>
            ))}
          </select>
        </div>

        {students.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-3">Estudiantes</p>
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {students.map((s) => {
                  const record = attendance[s.id]
                  const isPresent = record?.isPresent ?? true
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-zinc-400 shrink-0">
                          {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white/90 truncate">
                          {s.firstName} {s.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPresent(s.id, true)}
                          className={`px-3 py-1.5 rounded-[30px] text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                            isPresent
                              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                              : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          Presente
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresent(s.id, false)}
                          className={`px-3 py-1.5 rounded-[30px] text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                            !isPresent
                              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                              : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          Ausente
                        </button>
                        <div className="flex items-center gap-1.5 ml-1">
                          <input
                            type="number"
                            min={0}
                            value={record?.minutesLate ?? 0}
                            onChange={(e) => updateMinutes(s.id, Number(e.target.value))}
                            className="w-16 rounded-[30px] border border-gray-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-center bg-white dark:bg-black text-gray-900 dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all disabled:opacity-40"
                            disabled={!isPresent}
                          />
                          <span className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500">min</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {students.length > 0 && (
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary rounded-[30px] px-8 py-3 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar Asistencia"}
          </button>
        )}
      </form>
    </div>
  )
}