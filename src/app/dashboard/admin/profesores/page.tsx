import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import ProfesoresList from "./ProfesoresList"

export default async function ProfesoresPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("Teacher")
    .select("*, user:User(id, name, email, phone)")
    .eq("institutionid", institutionId)
    .order("createdat", { ascending: false })

  if (error) throw error

  const teachers = (data ?? []).map((t: any) => ({
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
    user: t.user,
  }))

  return <ProfesoresList teachers={teachers as any} />
}
