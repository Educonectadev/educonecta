import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import Link from "next/link"

export default async function ComunicadosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER") redirect("/login")

  const teacherId = session.user.teacherId!

  const data = await query<any[]>(
    "SELECT comm.*, u.name as authorName FROM Communication comm LEFT JOIN User u ON u.id = comm.authorId WHERE comm.teacherId = ? ORDER BY comm.createdAt DESC LIMIT 50",
    [teacherId]
  )

  const communications = data.map((c) => ({
    id: c.id,
    title: c.title,
    content: c.content,
    priority: c.priority,
    type: c.type,
    createdAt: c.createdAt,
    author: { name: c.authorName },
  }))

  return (
    <div className="space-y-8" data-tour="announcements">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Comunicados</h1>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{communications.length} comunicados</p>
        </div>
        <Link
          href="/dashboard/teacher/comunicados/nuevo"
          className="btn-primary rounded-[30px] px-6 py-2.5 text-sm font-medium text-center"
        >
          + Nuevo Comunicado
        </Link>
      </div>

      {communications.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-12 text-center text-gray-400 dark:text-zinc-500 text-sm">
          No hay comunicados.
        </div>
      ) : (
        <div className="space-y-3">
          {communications.map((c: { id: number; title: string; content: string; priority: string; type: string; createdAt: Date; author: { name: string } }) => (
            <div key={c.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-black/20 transition-all duration-200">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-semibold text-gray-900 dark:text-white/90">{c.title}</p>
                <div className="flex gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    c.priority === "high"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                      : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}>
                    {c.priority === "high" ? "Importante" : "Normal"}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400 border border-gray-100 dark:border-zinc-700">
                    {c.type === "general" ? "General" : "Importante"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{c.content}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-3">
                {c.author.name} — {new Date(c.createdAt).toLocaleDateString("es-ES")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}