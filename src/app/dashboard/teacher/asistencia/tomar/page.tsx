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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight dark:text-white">Tomar Asistencia</h1>
        <Link
          href="/dashboard/teacher/asistencia"
          className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
          Volver
        </Link>
      </div>

      {message && (
        <p className="mb-6 text-sm border border-gray-200 dark:border-zinc-800 rounded-[25px] p-4 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">{message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1.5">Curso</label>
          <select
            value={selectedCourse ?? ""}
            onChange={(e) => {
              const ct = courses.find((c) => c.courseId === Number(e.target.value))
              router.replace(
                `/dashboard/teacher/asistencia/tomar?courseId=${e.target.value}&gradeId=${ct?.gradeId ?? ""}&sectionId=${ct?.sectionId ?? ""}`
              )
            }}
            className="w-full rounded-[30px] border border-gray-200 dark:border-zinc-800 px-5 py-3 text-sm bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
          >
            {courses.map((ct) => (
              <option key={ct.id} value={ct.courseId}>
                {ct.course.name} — {ct.grade?.name ?? ""} / {ct.section?.name ?? ""}
              </option>
            ))}
          </select>
        </div>

        {students.length > 0 && (
          <div className="mb-6 space-y-2">
            {students.map((s) => {
              const record = attendance[s.id]
              const isPresent = record?.isPresent ?? true
              return (
                <div key={s.id} className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-[25px] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1a1a1a] dark:text-white">{s.firstName} {s.lastName}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPresent(s.id, true)}
                        className={`px-4 py-1.5 rounded-[30px] text-xs font-medium transition-all duration-200 ${
                          isPresent
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                        }`}
                      >
                        Presente
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresent(s.id, false)}
                        className={`px-4 py-1.5 rounded-[30px] text-xs font-medium transition-all duration-200 ${
                          !isPresent
                            ? "bg-gray-500 text-white"
                            : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                        }`}
                      >
                        Ausente
                      </button>
                      <div className="flex items-center gap-1.5 ml-2">
                        <input
                          type="number"
                          min={0}
                          value={record?.minutesLate ?? 0}
                          onChange={(e) => updateMinutes(s.id, Number(e.target.value))}
                          className="w-16 rounded-[30px] border border-gray-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-center bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-600 transition-all"
                          disabled={!isPresent}
                        />
                        <span className="text-xs text-gray-400 dark:text-zinc-500">min</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {students.length > 0 && (
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-8 py-3 rounded-[25px] text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar Asistencia"}
          </button>
        )}
      </form>
    </div>
  )
}
