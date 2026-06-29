import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseAdmin } from "@/lib/supabase"
import VersionManager from "./VersionManager"

export const dynamic = "force-dynamic"

export default async function VersionesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const supabase = getSupabaseAdmin()
  const { data: versiones } = await supabase
    .from("Version")
    .select("*")
    .order("createdAt", { ascending: false })

  return (
    <div className="pt-4 md:pt-6">
      <header className="mb-6 md:mb-8">
        <p className="sa-eyebrow">Release management</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Versiones del Sistema</h1>
        <p className="text-sm text-[color:var(--muted-foreground)] mt-1.5">
          Registra y gestiona las versiones lanzadas de EduConecta
        </p>
      </header>
      <VersionManager versiones={versiones ?? []} />
    </div>
  )
}
