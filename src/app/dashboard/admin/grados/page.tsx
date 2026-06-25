import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findMany } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"
import GradosList from "./GradosList"

export default async function GradosPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const grades = await findMany<any>("Grade", { where: { institutionId }, orderBy: "name" })

  const gradeIds = grades.map((g: any) => g.id)
  let sections: any[] = []
  if (gradeIds.length > 0) {
    const { data, error } = await getSupabaseAdmin()
      .from("Section")
      .select("*")
      .in("gradeid", gradeIds)
      .order("name")
    if (error) throw error
    sections = data ?? []
  }

  const sectionMap = new Map<number, any[]>()
  for (const s of sections) {
    if (!sectionMap.has(s.gradeId)) sectionMap.set(s.gradeId, [])
    sectionMap.get(s.gradeId)!.push(s)
  }

  const result = grades.map((g: any) => ({
    id: g.id,
    name: g.name,
    level: g.level,
    sections: sectionMap.get(g.id) ?? [],
  }))

  return <GradosList grades={result as any} />
}
