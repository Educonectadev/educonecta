import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { findMany } from "@/lib/prisma"
import InstitutionList from "./InstitutionList"
import { getIcon } from "@/components/premium/iconRegistry"

export default async function InstitucionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const instituciones: any[] = await findMany("Institution", { orderBy: "createdAt", orderDir: "DESC" })
  const total = instituciones.length
  const activas = instituciones.filter((i) => i.isActive).length

  return (
    <div className="space-y-6 md:space-y-8 pt-4 md:pt-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="sa-eyebrow">Gestión de red</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Instituciones</h1>
          <p className="text-sm text-[color:var(--muted-foreground)] mt-1.5">
            {total} registradas · {activas} activas
          </p>
        </div>
        <Link
          href="/dashboard/super-admin/instituciones/nueva"
          className="sa-btn sa-btn-primary self-start md:self-auto"
        >
          {getIcon("plus", { size: 16, strokeWidth: 2.4 })}
          <span>Registrar Institución</span>
        </Link>
      </header>

      <InstitutionList institutions={instituciones} />
    </div>
  )
}