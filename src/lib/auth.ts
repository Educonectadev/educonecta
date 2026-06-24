import { createSupabaseServerClient } from "./supabase-server"
import { getSupabaseAdmin } from "./supabase"
import type { Session } from "./session"

export type { Session }

export async function getServerSession(): Promise<Session | null> {
  const supabase = await createSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()
  const authUser = authData?.user
  if (!authUser?.email) return null

  const supabaseAdmin = getSupabaseAdmin()

  const { data: user } = await supabaseAdmin
    .from("User")
    .select("id, email, name, role, institutionId")
    .eq("email", authUser.email)
    .maybeSingle()

  if (!user) return null

  let institutionName: string | null = null
  if (user.institutionId) {
    const { data: inst } = await supabaseAdmin
      .from("Institution")
      .select("name")
      .eq("id", user.institutionId)
      .maybeSingle()
    institutionName = inst?.name ?? null
  }

  const [{ data: teacher }, { data: parent }, { data: admin }] = await Promise.all([
    supabaseAdmin.from("Teacher").select("id").eq("userId", user.id).maybeSingle(),
    supabaseAdmin.from("Parent").select("id").eq("userId", user.id).maybeSingle(),
    supabaseAdmin.from("InstitutionalAdmin").select("id").eq("userId", user.id).maybeSingle(),
  ])

  return {
    user: {
      id: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institutionId ?? null,
      institutionName,
      teacherId: teacher?.id ?? null,
      parentId: parent?.id ?? null,
      adminId: admin?.id ?? null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.hash(password, 10)
}
