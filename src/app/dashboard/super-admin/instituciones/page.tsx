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
    <div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="sa-eyebrow">Gestión de red</p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mt-0.5">Instituciones</h1>
        </div>
        <Link
          href="/dashboard/super-admin/instituciones/nueva"
          className="sa-btn sa-btn-primary shrink-0"
        >
          {getIcon("plus", { size: 15, strokeWidth: 2.4 })}
          <span className="hidden sm:inline">Registrar</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5 md:gap-4">
        <StatCard icon="building" label="Total" value={total} />
        <StatCard icon="check" label="Activas" value={activas} accent />
        <StatCard icon="x" label="Inactivas" value={inactive} muted />
      </div>

      <InstitutionList institutions={enriched} total={total} active={activas} inactive={inactive} />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
  muted,
}: {
  icon: string
  label: string
  value: number
  accent?: boolean
  muted?: boolean
}) {
  const color = accent ? "var(--accent)" : muted ? "#f87171" : "var(--foreground)"
  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-3.5 md:p-5 flex flex-col gap-2.5"
      style={{
        background: accent
          ? "var(--surface)"
          : muted
          ? "var(--surface)"
          : "var(--surface)",
        border: "1px solid var(--surface-border)",
        boxShadow: "var(--surface-shadow)",
      }}
    >
      <span
        className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
          color,
        }}
      >
        {getIcon(icon, { size: 18, strokeWidth: 2 })}
      </span>
      <div>
        <p className="text-xl md:text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-[10px] md:text-[11px] text-[color:var(--muted-foreground)] font-medium mt-0.5">
          {label}
        </p>
      </div>
    </div>
  )
}
