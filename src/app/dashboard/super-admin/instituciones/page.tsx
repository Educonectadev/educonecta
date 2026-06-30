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

      <InstitutionList institutions={enriched} />
    </div>
  )
}


