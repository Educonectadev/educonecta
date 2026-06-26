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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Comunicados</h1>
        <Link
          href="/dashboard/teacher/comunicados/nuevo"
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-[30px] text-sm font-medium hover:bg-emerald-700 transition-all text-center"
        >
          + Nuevo Comunicado
        </Link>
      </div>

      {communications.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-zinc-400">No hay comunicados.</p>
      ) : (
        <div className="grid gap-3">
          {communications.map((c: { id: number; title: string; content: string; priority: string; type: string; createdAt: Date; author: { name: string } }) => (
            <div key={c.id} className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-[25px] p-6">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white/90">{c.title}</p>
                <div className="flex gap-2">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-[30px] border ${
                      c.priority === "high"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    {c.priority === "high" ? "Importante" : "Normal"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 rounded-[30px] px-3 py-1">
                    {c.type === "general" ? "General" : "Importante"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">{c.content}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-3">
                {c.author.name} — {new Date(c.createdAt).toLocaleDateString("es-ES")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
