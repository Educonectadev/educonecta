import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import SolicitudesList from "./SolicitudesList"

export const dynamic = "force-dynamic"

export default async function SolicitudesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const leads = await query(
    `SELECT * FROM "Lead" ORDER BY
       CASE WHEN status = 'NUEVO' THEN 0 ELSE 1 END,
       "createdAt" DESC LIMIT 200`
  )

  return <SolicitudesList initialLeads={leads as any[]} />
}