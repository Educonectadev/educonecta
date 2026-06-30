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
    <div className="pt-4 md:pt-6 space-y-6 md:space-y-8">
      <header>
        <p className="sa-eyebrow">Release management</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1" style={{ fontFamily: "var(--font-display)" }}>
          Versiones del Sistema
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--muted-foreground)" }}>
          Registra y gestiona las versiones lanzadas de EduConecta
        </p>
      </header>
      <VersionManager versiones={versiones ?? []} />
    </div>
  )
}
