import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { query } from "@/lib/prisma"

export async function POST() {
  try {
    const supabase = getSupabaseAdmin()
    const users = await query<any[]>(`SELECT id, email, name, role FROM "User"`)

    const { data: authList } = await supabase.auth.admin.listUsers()
    const authEmails = new Set(authList?.users?.map((u) => u.email) ?? [])

    const results: { email: string; name: string; role: string; status: string; password?: string }[] = []

    for (const user of users) {
      if (authEmails.has(user.email)) {
        results.push({ email: user.email, name: user.name, role: user.role, status: "already_exists" })
        continue
      }

      const tempPassword = generatePassword()
      await supabase.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true,
      })

      results.push({
        email: user.email,
        name: user.name,
        role: user.role,
        status: "created",
        password: tempPassword,
      })
    }

    return NextResponse.json({
      success: true,
      total: users.length,
      synced: results.filter((r) => r.status === "created").length,
      results,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const digits = "0123456789"
  const all = upper + lower + digits
  let pw = ""
  for (let i = 0; i < 10; i++) {
    pw += all.charAt(Math.floor(Math.random() * all.length))
  }
  pw += "A1"
  return pw
}
