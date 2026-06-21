import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/prisma"
import ProfesoresList from "./ProfesoresList"

export default async function ProfesoresPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const data = await query<any[]>(
    `SELECT t.id, t.speciality, t.documentId, t.professionalTitle, t.educationLevel, t.hireDate, t.contractType, t.address, t.emergencyContactName, t.emergencyContactPhone,
      u.id as u_id, u.name as u_name, u.email as u_email, u.phone as u_phone
    FROM Teacher t
    LEFT JOIN User u ON u.id = t.userId
    WHERE t.institutionId = ?
    ORDER BY t.createdAt DESC`,
    [institutionId]
  )

  const teachers = data.map((t: any) => ({
    id: t.id,
    speciality: t.speciality,
    documentId: t.documentId,
    professionalTitle: t.professionalTitle,
    educationLevel: t.educationLevel,
    hireDate: t.hireDate,
    contractType: t.contractType,
    address: t.address,
    emergencyContactName: t.emergencyContactName,
    emergencyContactPhone: t.emergencyContactPhone,
    user: { id: t.u_id, name: t.u_name, email: t.u_email, phone: t.u_phone },
  }))

  return <ProfesoresList teachers={teachers} />
}
