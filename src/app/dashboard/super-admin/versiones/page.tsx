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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/90">Versiones del Sistema</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Registra y gestiona las versiones lanzadas de EduConecta</p>
      </div>
      <VersionManager versiones={versiones ?? []} />
    </div>
  )
}
