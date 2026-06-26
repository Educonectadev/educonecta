import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getSupabaseAdmin } from "@/lib/supabase"

async function supabaseCount(table: string, match?: Record<string, unknown>): Promise<number> {
  const admin = getSupabaseAdmin()
  let query = admin.from(table).select("id", { count: "exact", head: true })
  if (match) {
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key.toLowerCase(), value)
    }
  }
  const { count, error } = await query
  if (error) return 0
  return count ?? 0
}

export const dynamic = "force-dynamic"

export default async function SuperAdminDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const supabase = getSupabaseAdmin()

  const [totalInstituciones, totalUsuarios, activas, totalProfesores, totalAlumnos, totalPadres, versiones, recientes] = await Promise.all([
    supabaseCount("Institution"),
    supabaseCount("User"),
    supabaseCount("Institution", { isActive: true }),
    supabaseCount("Teacher"),
    supabaseCount("Student"),
    supabaseCount("Parent"),
    supabase.from("Version").select("*").eq("isCurrent", true).maybeSingle(),
    supabase.from("Institution").select("id, name, isActive, createdAt").order("createdAt", { ascending: false }).limit(5),
  ])

  const stats = [
    { label: "Instituciones", value: totalInstituciones, href: "/dashboard/super-admin/instituciones" },
    { label: "Usuarios", value: totalUsuarios, href: "/dashboard/super-admin/instituciones" },
    { label: "Activas", value: activas, href: "/dashboard/super-admin/instituciones" },
    { label: "Profesores", value: totalProfesores, href: "/dashboard/super-admin/instituciones" },
    { label: "Alumnos", value: totalAlumnos, href: "/dashboard/super-admin/instituciones" },
    { label: "Padres", value: totalPadres, href: "/dashboard/super-admin/instituciones" },
  ]

  const versionActual = versiones.data
  const institucionesRecientes = recientes.data ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Dashboard</h1>
        {versionActual && (
          <span className="text-xs text-gray-400 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700 rounded-full px-3 py-1">
            {versionActual.version}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-black dark:bg-zinc-900 border border-white/10 dark:border-zinc-800 rounded-[25px] p-5 hover:bg-black/80 dark:hover:bg-zinc-800 transition-all duration-200"
          >
            <p className="text-[10px] uppercase tracking-widest text-white/50 dark:text-zinc-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1.5 text-white dark:text-white">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[25px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Últimas instituciones</h2>
            <Link href="/dashboard/super-admin/instituciones" className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
              Ver todas
            </Link>
          </div>
          {institucionesRecientes.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-8">No hay instituciones registradas</p>
          ) : (
            <div className="space-y-2">
              {institucionesRecientes.map((inst: any) => (
                <Link
                  key={inst.id}
                  href="/dashboard/super-admin/instituciones"
                  className="flex items-center justify-between p-3 rounded-[20px] hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white/90">{inst.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${inst.isActive ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"}`}>
                      {inst.isActive ? "Activa" : "Inactiva"}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                      {new Date(inst.createdAt).toLocaleDateString("es-PE")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[25px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Versión actual</h2>
            <Link href="/dashboard/super-admin/versiones" className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
              Ver todas
            </Link>
          </div>
          {versionActual ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white/90">{versionActual.version}</span>
                <span className="text-[10px] font-semibold uppercase bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full">Actual</span>
              </div>
              {versionActual.title && (
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{versionActual.title}</p>
              )}
              {versionActual.description && (
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 whitespace-pre-line">{versionActual.description}</p>
              )}
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-3">
                Lanzada el {new Date(versionActual.createdAt).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 dark:text-zinc-500 mb-3">No hay versión registrada</p>
              <Link
                href="/dashboard/super-admin/versiones"
                className="text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-full px-4 py-2 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Registrar versión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
