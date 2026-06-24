import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"

async function supabaseCount(table: string, match?: Record<string, unknown>): Promise<number> {
  const admin = getSupabaseAdmin()
  let query = admin.from(table).select("id", { count: "exact", head: true })
  if (match) {
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key, value)
    }
  }
  const { count, error } = await query
  if (error) return 0
  return count ?? 0
}

export default async function SuperAdminDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const [totalInstituciones, totalUsuarios, activas] = await Promise.all([
    supabaseCount("Institution"),
    supabaseCount("User"),
    supabaseCount("Institution", { isActive: true }),
  ])

  const stats = [
    { label: "Total instituciones", value: totalInstituciones },
    { label: "Total usuarios", value: totalUsuarios },
    { label: "Instituciones activas", value: activas },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-black border border-white/10 rounded-[25px] p-6 hover:bg-black/80 transition-all duration-200">
            <p className="text-xs uppercase tracking-widest text-white/50">{s.label}</p>
            <p className="text-3xl font-bold mt-2 text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
