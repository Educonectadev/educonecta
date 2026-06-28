"use client"

import { useState } from "react"

export default function EstudiantePublicCard({
  student,
  todayAttendance,
}: {
  student: any
  todayAttendance: any[]
}) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{ present: boolean; pendingConfirm: boolean } | null>(null)
  const [registrarNombre, setRegistrarNombre] = useState("")

  const fullName = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()

  async function takeAttendance(isPresent: boolean) {
    if (!registrarNombre.trim()) {
      alert("Ingresa el nombre de quien registra la asistencia.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/public/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrToken: student.qrToken,
          isPresent,
          registeredByName: registrarNombre.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data.error || "No se pudo registrar la asistencia.")
        return
      }
      setDone({ present: isPresent, pendingConfirm: !!data.pendingConfirm })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-black p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-6 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Carnet Estudiantil Digital</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white/90">{student.institutionName ?? "EduConecta"}</h1>
        </header>

        <div className="rounded-3xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg shadow-gray-200/40 dark:shadow-none p-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xl">
              {(student.firstName ?? "?").charAt(0)}{(student.lastName ?? "?").charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-900 dark:text-white/90 truncate">{fullName}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{student.documentId ?? "—"}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <Field label="Grado" value={student.gradeName ?? "—"} />
            <Field label="Sección" value={student.sectionName ?? "—"} />
            <Field label="Nivel" value={student.gradeLevel ?? "—"} />
            <Field label="ID" value={String(student.id)} />
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">Registrar asistencia</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            Quien registre la asistencia debe identificarse. El docente confirmará luego desde su panel.
          </p>

          {done ? (
            <div className="mt-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5 text-center">
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mb-2">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Asistencia {done.present ? "registrada como PRESENTE" : "registrada como FALTA"}
              </p>
              {done.pendingConfirm && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  Pendiente de confirmación por el docente.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Tu nombre (quien registra)</label>
                <input
                  value={registrarNombre}
                  onChange={(e) => setRegistrarNombre(e.target.value)}
                  placeholder="Ej: María López (apoderado)"
                  className="w-full rounded-[30px] border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => takeAttendance(true)}
                  disabled={loading}
                  className="rounded-[30px] bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {loading ? "..." : "Presente"}
                </button>
                <button
                  onClick={() => takeAttendance(false)}
                  disabled={loading}
                  className="rounded-[30px] border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200 py-3 text-sm font-medium text-gray-800 disabled:opacity-50"
                >
                  {loading ? "..." : "Falta"}
                </button>
              </div>
            </>
          )}
        </section>

        {todayAttendance.length > 0 && (
          <section className="mt-6 rounded-3xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">Hoy</h2>
            <ul className="mt-3 space-y-2 text-xs">
              {todayAttendance.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 dark:text-zinc-400">
                    {new Date(a.createdAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })} · {a.registeredByName ?? "—"}
                  </span>
                  <span className={
                    "rounded-full px-2 py-0.5 font-semibold " +
                    (a.isPresent
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400")
                  }>
                    {a.isPresent ? "Presente" : "Falta"}
                    {a.source === "qr" && !a.confirmedByTeacher && " · pendiente"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-8 text-center text-[10px] text-gray-400 dark:text-zinc-500">
          Generado por EduConecta · educonecta.pe
        </footer>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-zinc-800/40 p-3">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-zinc-500">{label}</p>
      <p className="mt-0.5 font-semibold text-gray-900 dark:text-white/90">{value}</p>
    </div>
  )
}