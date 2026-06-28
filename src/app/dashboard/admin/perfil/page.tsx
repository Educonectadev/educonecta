import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { findOne } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"
import EditableInstitutionSection from "./EditableInstitutionSection"
import BrandColorPicker from "@/components/BrandColorPicker"

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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Mi Perfil</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Información personal y datos de la institución</p>
        </div>
        <Link
          href="/dashboard/admin/perfil/carrusel"
          className="rounded-[30px] border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-600 transition-colors duration-200 inline-flex items-center gap-2"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
          </svg>
          Gestionar carrusel
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">Datos del Administrador</h2>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-[25px] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Nombre</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{(user as any)?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Email</p>
              <p className="font-medium text-gray-900 dark:text-white/90">{(user as any)?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Rol</p>
              <p className="font-medium text-gray-900 dark:text-white/90">Administrador Institucional</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <EditableInstitutionSection institution={institution as any} />
      </section>

      <section className="mb-8">
        <BrandColorPicker />
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3">Estadísticas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Estudiantes", value: studentRes.count },
            { label: "Docentes", value: teacherRes.count },
            { label: "Cursos", value: courseRes.count },
            { label: "Grados", value: gradeRes.count },
            { label: "Secciones", value: sectionRes.count },
            { label: "Horarios", value: scheduleRes.count },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-[20px] p-5 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{s.value ?? 0}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
