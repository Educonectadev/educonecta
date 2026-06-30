import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { findMany, query } from "@/lib/prisma"
import InstitutionList from "./InstitutionList"
import { getIcon } from "@/components/premium/iconRegistry"

export default async function InstitucionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const instituciones: any[] = await findMany("Institution", { orderBy: "createdAt", orderDir: "DESC" })

  const studentCounts = await query<{ institutionId: number; count: number }[]>(
    `SELECT "institutionId", COUNT(*)::int as count FROM "User" WHERE role = 'STUDENT' GROUP BY "institutionId"`
  )
  const countMap = new Map((studentCounts ?? []).map((r) => [r.institutionId, r.count]))

  const enriched = instituciones.map((i) => ({
    ...i,
    studentCount: countMap.get(i.id) ?? 0,
  }))

  const total = enriched.length
  const activas = enriched.filter((i) => i.isActive).length
  const inactive = total - activas

  return (
    <div className="space-y-6 md:space-y-8 pt-4 md:pt-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="sa-eyebrow">Gestión de red</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Instituciones</h1>
        </div>
        <Link
          href="/dashboard/super-admin/instituciones/nueva"
          className="sa-btn sa-btn-primary self-start md:self-auto"
        >
          {getIcon("plus", { size: 16, strokeWidth: 2.4 })}
          <span>Registrar Institución</span>
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <MetricCard
          icon="building"
          label="Total"
          value={total}
          color="var(--accent)"
        />
        <MetricCard
          icon="check"
          label="Activas"
          value={activas}
          color="#22c55e"
        />
        <MetricCard
          icon="x"
          label="Inactivas"
          value={inactive}
          color="#f87171"
        />
      </div>

      <InstitutionList institutions={enriched} total={total} active={activas} inactive={inactive} />
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string
  label: string
  value: number
  color: string
}) {
  return (
    <div className="sa-surface p-4 md:p-5 flex items-center gap-3 md:gap-4">
      <span
        className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
      >
        {getIcon(icon, { size: 20, strokeWidth: 2 })}
      </span>
      <div className="min-w-0">
        <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-[11px] text-[color:var(--muted-foreground)] font-medium">{label}</p>
      </div>
    </div>
  )
}
