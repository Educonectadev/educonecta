import { createSupabaseServerClient } from "./supabase-server"
import { getSupabaseAdmin } from "./supabase"
import type { Session } from "./session"

export type { Session }

export async function getServerSession(): Promise<Session | null> {
  const supabase = await createSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()
  const authUser = authData?.user
  if (!authUser?.email) return null

  const { data: user } = await getSupabaseAdmin()
    .from("User")
    .select(`
      id, email, name, role, institutionId,
      Institution!institutionId (name),
      Teacher!userId (id),
      Parent!userId (id),
      InstitutionalAdmin!userId (id)
    `)
    .eq("email", authUser.email)
    .maybeSingle()

  if (!user) return null

  const teacherArr = (user as any).Teacher as { id: number }[] | undefined
  const parentArr = (user as any).Parent as { id: number }[] | undefined
  const adminArr = (user as any).InstitutionalAdmin as { id: number }[] | undefined

  return {
    user: {
      id: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institutionId ?? null,
      institutionName: (user as any).Institution?.name ?? null,
      teacherId: teacherArr?.[0]?.id ?? null,
      parentId: parentArr?.[0]?.id ?? null,
      adminId: adminArr?.[0]?.id ?? null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.hash(password, 10)
}
