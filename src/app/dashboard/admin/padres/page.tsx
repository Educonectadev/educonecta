import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query, findMany } from "@/lib/prisma"
import PadresList from "./PadresList"

export default async function PadresPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const [parentsData, allStudents] = await Promise.all([
    query<any[]>(
      `SELECT p.id as p_id, u.id as u_id, u.name as u_name, u.email as u_email, u.phone as u_phone,
        ps.studentId as ps_studentId, s.firstName as s_firstName, s.lastName as s_lastName
      FROM Parent p
      LEFT JOIN User u ON u.id = p.userId
      LEFT JOIN ParentStudent ps ON ps.parentId = p.id
      LEFT JOIN Student s ON s.id = ps.studentId
      WHERE p.institutionId = ?
      ORDER BY p.createdAt DESC, s.firstName ASC`,
      [institutionId]
    ),
    findMany("Student", { where: { institutionId }, orderBy: "firstName" }) as Promise<any[]>,
  ])

  const parentMap = new Map<number, any>()
  for (const row of parentsData) {
    if (!parentMap.has(row.p_id)) {
      parentMap.set(row.p_id, {
        id: row.p_id,
        user: { id: row.u_id, name: row.u_name, email: row.u_email, phone: row.u_phone },
        children: [],
      })
    }
    const parent = parentMap.get(row.p_id)!
    if (row.ps_studentId && !parent.children.some((c: any) => c.student.id === row.ps_studentId)) {
      parent.children.push({
        student: { id: row.ps_studentId, firstName: row.s_firstName, lastName: row.s_lastName },
      })
    }
  }
  const parents = Array.from(parentMap.values())

  return <PadresList parents={parents} allStudents={allStudents} />
}
