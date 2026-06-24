import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import { findMany } from "@/lib/prisma"
import PadresList from "./PadresList"

export default async function PadresPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const [parentsResult, parentStudentsResult, allStudents] = await Promise.all([
    getSupabaseAdmin()
      .from("Parent")
      .select("*, user:User(*)")
      .eq("institutionId", institutionId)
      .order("createdAt", { ascending: false }),
    getSupabaseAdmin()
      .from("ParentStudent")
      .select("*, student:Student(*)"),
    findMany("Student", { where: { institutionId }, orderBy: "firstName" }) as Promise<any[]>,
  ])

  if (parentsResult.error) throw parentsResult.error
  if (parentStudentsResult.error) throw parentStudentsResult.error

  const parentMap = new Map<number, any>()
  for (const row of parentsResult.data) {
    parentMap.set(row.id, {
      id: row.id,
      user: { id: row.user.id, name: row.user.name, email: row.user.email, phone: row.user.phone },
      children: [],
    })
  }
  for (const ps of parentStudentsResult.data) {
    const parent = parentMap.get(ps.parentId)
    if (parent) {
      parent.children.push({
        student: { id: ps.student.id, firstName: ps.student.firstName, lastName: ps.student.lastName },
      })
    }
  }
  const parents = Array.from(parentMap.values())

  return <PadresList parents={parents} allStudents={allStudents} />
}
