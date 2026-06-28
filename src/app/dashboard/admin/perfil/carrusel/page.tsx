import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { query } from "@/lib/prisma"
import CarouselAdminClient from "./CarouselAdminClient"

export const dynamic = "force-dynamic"

export default async function CarruselAdminPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const images = await query<any[]>(
    `SELECT id, url, alt, "order"
     FROM "InstitutionCarouselImage"
     WHERE "institutionId" = ?
     ORDER BY "order" ASC, "createdAt" ASC`,
    [session.user.institutionId]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/admin/perfil" className="text-xs text-gray-500 dark:text-zinc-400 hover:underline">
            ← Volver al perfil
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Carrusel del colegio</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Estas imágenes aparecen en la parte superior de tu panel de control.
          </p>
        </div>
      </div>

      <CarouselAdminClient initialImages={images as any[]} />
    </div>
  )
}