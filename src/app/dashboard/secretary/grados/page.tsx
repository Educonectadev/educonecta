import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findMany } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"
import GradosList from "../../admin/grados/GradosList"

export default async function SecretaryGradosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY") redirect("/login")

  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()

  const grades = await findMany<any>("Grade", { where: { institutionId }, orderBy: "name" })

  const gradeIds = (grades as any[]).map((g: any) => g.id)
  const sections = gradeIds.length
    ? (await supabase.from("Section").select("*").in("gradeId", gradeIds).order("name")).data ?? []
    : []

  const result = (grades as any[]).map((g: any) => ({
    ...g,
    sections: sections.filter((s: any) => s.gradeId === g.id),
  }))

  return <GradosList grades={result as any} />
}
