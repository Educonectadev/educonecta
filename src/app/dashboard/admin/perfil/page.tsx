import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findOne } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"
import EditableInstitutionSection from "./EditableInstitutionSection"

export default async function AdminPerfilPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") redirect("/login")

  const institutionId = session.user.institutionId!

  const supabase = getSupabaseAdmin()

  const [user, institution, studentRes, teacherRes, courseRes, scheduleRes, gradeRes, gradeIds] = await Promise.all([
    findOne("User", { id: Number(session.user.id) }, ["id", "email", "name", "role", "createdAt"]),
    findOne("Institution", { id: institutionId }),
    supabase.from("Student").select("id", { count: "exact", head: true }).eq("institutionId", institutionId).eq("isActive", true),
    supabase.from("Teacher").select("id", { count: "exact", head: true }).eq("institutionId", institutionId),
    supabase.from("Course").select("id", { count: "exact", head: true }).eq("institutionId", institutionId),
    supabase.from("Schedule").select("id", { count: "exact", head: true }).eq("institutionId", institutionId),
    supabase.from("Grade").select("id", { count: "exact", head: true }).eq("institutionId", institutionId),
    supabase.from("Grade").select("id").eq("institutionId", institutionId),
  ])

  const gIds = (gradeIds.data ?? []).map((g: any) => g.id)
  const sectionRes = gIds.length > 0
    ? await supabase.from("Section").select("id", { count: "exact", head: true }).in("gradeId", gIds)
    : { count: 0 }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">Información personal y datos de la institución</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">Datos del Administrador</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-[25px] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Nombre</p>
              <p className="font-medium">{(user as any)?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-medium">{(user as any)?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Rol</p>
              <p className="font-medium">Administrador Institucional</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <EditableInstitutionSection institution={institution as any} />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Estadísticas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{studentRes.count ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Estudiantes</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{teacherRes.count ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Docentes</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{courseRes.count ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Cursos</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{gradeRes.count ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Grados</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{sectionRes.count ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Secciones</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-5 text-center">
            <p className="text-2xl font-bold">{scheduleRes.count ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Horarios</p>
          </div>
        </div>
      </section>
    </div>
  )
}
