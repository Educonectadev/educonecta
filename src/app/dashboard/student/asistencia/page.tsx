import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"

export default async function StudentAsistenciaPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) redirect("/login")

  const studentId = session.user.studentId
  const attendance = await query<any[]>(
    `SELECT a.id, a.date, a."isPresent", a.note
     FROM Attendance a
     WHERE a."studentId" = ?
     ORDER BY a.date DESC
     LIMIT 60`,
    [studentId]
  )

  const total = attendance.length
  const presentes = attendance.filter((a) => a.isPresent).length
  const faltas = total - presentes
  const pct = total > 0 ? Math.round((presentes / total) * 100) : null

  return (
    <div className="space-y-6" data-tour="attendance">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mi asistencia</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Últimos 60 registros.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Asistencia" value={pct !== null ? `${pct}%` : "—"} tone="emerald" />
        <Stat label="Presentes" value={presentes} tone="sky" />
        <Stat label="Faltas" value={faltas} tone="red" />
      </div>

      {attendance.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-gray-400">
          Aún no hay registros de asistencia.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {attendance.map((a) => (
              <li key={a.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">
                    {new Date(a.date).toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" })}
                  </p>
                  {a.note && <p className="text-xs text-gray-400 dark:text-zinc-500">{a.note}</p>}
                </div>
                {a.isPresent ? (
                  <span className="text-[11px] rounded-full px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-semibold">Presente</span>
                ) : (
                  <span className="text-[11px] rounded-full px-2.5 py-0.5 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 font-semibold">Falta</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: "emerald" | "sky" | "red" }) {
  const tones: Record<string, string> = {
    emerald: "text-emerald-700 dark:text-emerald-400",
    sky: "text-sky-700 dark:text-sky-400",
    red: "text-red-700 dark:text-red-400",
  }
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">{label}</p>
      <p className={"mt-2 text-2xl font-bold tracking-tight " + (tones[tone] ?? "")}>{value}</p>
    </div>
  )
}