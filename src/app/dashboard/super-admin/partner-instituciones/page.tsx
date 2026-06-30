import { getSupabaseAdmin } from "@/lib/supabase"
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import PartnerList from "./PartnerList"

export const dynamic = "force-dynamic"

export default async function PartnerInstitucionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from("PartnerInstitution")
    .select("*")
    .order("order", { ascending: true })

  const partners = (data ?? []).map((item: Record<string, unknown>) => ({
    id: item.id as number,
    name: item.name as string,
    logoUrl: item.logourl as string,
    order: item.order as number,
    isActive: item.isactive as boolean,
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string,
  }))

  return <PartnerList partners={partners} />
}
