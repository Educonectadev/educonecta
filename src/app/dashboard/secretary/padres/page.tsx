import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import { findMany } from "@/lib/prisma"
import PadresList from "../../admin/padres/PadresList"

export default async function SecretaryPadresPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY") redirect("/login")

  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()

  const [{ data: parents }, { data: relations }, allStudents] = await Promise.all([
    supabase
      .from("Parent")
      .select("*, user:User(*)")
      .eq("institutionId", institutionId)
      .order("createdAt", { ascending: false }),
    supabase
      .from("ParentStudent")
      .select("*, student:Student(*)"),
    findMany("Student", { where: { institutionId }, orderBy: "firstName" }),
  ])

  return (
    <PadresList
      parents={(parents ?? []).map((p: any) => ({
        ...p,
        children: (relations ?? []).filter((r: any) => r.parentId === p.id),
      })) as any}
      allStudents={allStudents as any}
    />
  )
}
