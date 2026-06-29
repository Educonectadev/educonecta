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

  return <PartnerList partners={data ?? []} />
}
