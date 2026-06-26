import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { findMany } from "@/lib/prisma"
import InstitutionList from "./InstitutionList"

export default async function InstitucionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const instituciones: any[] = await findMany("Institution", { orderBy: "createdAt", orderDir: "DESC" })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Instituciones</h1>
        <Link
          href="/dashboard/super-admin/instituciones/nueva"
          className="rounded-[30px] btn-primary px-6 py-2.5 text-sm font-medium text-center"
        >
          + Registrar Institución
        </Link>
      </div>

      <InstitutionList institutions={instituciones} />
    </div>
  )
}
