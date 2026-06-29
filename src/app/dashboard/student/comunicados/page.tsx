import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"

export default async function StudentComunicadosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) redirect("/login")

  const items = await query<any[]>(
    `SELECT c.id, c.title, c.content, c.type, c.priority, c."createdAt",
            u.name AS "authorName"
     FROM Communication c
     LEFT JOIN "User" u ON u.id = c."authorId"
     WHERE c."institutionId" = ?
       AND (c."teacherId" IS NULL OR c."teacherId" IN (
         SELECT DISTINCT ct."teacherId" FROM "CourseTeacher" ct
         WHERE (ct."gradeId" = (SELECT "gradeId" FROM Student WHERE id = ?)
                OR ct."gradeId" IS NULL)
           AND (ct."sectionId" = (SELECT "sectionId" FROM Student WHERE id = ?)
                OR ct."sectionId" IS NULL)
       ))
     ORDER BY c."createdAt" DESC
     LIMIT 50`,
    [session.user.institutionId ?? 0, session.user.studentId, session.user.studentId]
  )

  const priorityTone = (p: string) => {
    if (p === "urgente" || p === "high") return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900"
    if (p === "normal") return "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-900"
    return "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border-gray-200 dark:border-zinc-700"
  }

  return (
    <div className="space-y-6" data-tour="announcements">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Comunicados</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Avisos de tu institución y de tus docentes.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-gray-400">
          Sin comunicados por ahora.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <article key={c.id} className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">{c.title}</h2>
                  <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
                    {c.authorName ?? "Institución"} · {new Date(c.createdAt).toLocaleString("es-PE")}
                  </p>
                </div>
                <span className={"shrink-0 text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-semibold border " + priorityTone(c.priority)}>
                  {c.priority ?? "normal"}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap">{c.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}