import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { findOne } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"
import EditableInstitutionSection from "../../admin/perfil/EditableInstitutionSection"
import StatsGrid from "../../admin/perfil/StatsGrid"
import { getIcon } from "@/components/premium/iconRegistry"

export default async function SecretaryPerfilPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SECRETARY" || !session.user.institutionId) redirect("/login")

  const institutionId = session.user.institutionId
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
    <div data-tour="profile">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Mi Perfil</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Información personal y datos de la institución</p>
      </div>

      <section className="mb-8">
        <p className="sa-eyebrow mb-3">Datos de la Secretaria</p>
        <div className="sa-surface p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Nombre</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{(user as any)?.name}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Email</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>{(user as any)?.email}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Rol</p>
              <p className="font-medium" style={{ color: "var(--foreground)" }}>Secretaria</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <EditableInstitutionSection institution={institution as any} />
      </section>

      <section>
        <p className="sa-eyebrow mb-3">Estadísticas</p>
        <StatsGrid stats={[
          { label: "Estudiantes", value: studentRes.count },
          { label: "Docentes", value: teacherRes.count },
          { label: "Cursos", value: courseRes.count },
          { label: "Grados", value: gradeRes.count },
          { label: "Secciones", value: sectionRes.count },
          { label: "Horarios", value: scheduleRes.count },
        ]} />
      </section>
    </div>
  )
}
