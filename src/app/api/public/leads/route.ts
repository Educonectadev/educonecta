import { NextResponse } from "next/server"
import { create, query } from "@/lib/prisma"
import { broadcastPushToUsers } from "@/lib/push-broadcast"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { institutionName, directorName, email, phone, plan, message } = body ?? {}

    if (!institutionName || !directorName || !email || !phone) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    const leadId = await create("Lead", {
      institutionName: String(institutionName).trim(),
      directorName: String(directorName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      plan: plan || null,
      status: "NUEVO",
      unreadByAdmin: true,
    })

    if (message && String(message).trim()) {
      await create("LeadMessage", {
        leadId,
        authorRole: "LEAD",
        authorName: String(directorName).trim(),
        body: String(message).trim().slice(0, 2000),
        readByAdmin: false,
      })
    }

    // Push al super-admin
    try {
      const supabaseAdmins = await query<any[]>(
        `SELECT id FROM "User" WHERE role = 'SUPER_ADMIN' AND "isActive" = TRUE`
      )
      const ids = supabaseAdmins.map((u) => Number(u.id)).filter(Boolean)
      if (ids.length > 0) {
        await broadcastPushToUsers(ids, {
          title: "🏫 Nueva solicitud de colegio",
          body: `${institutionName} · ${directorName}`,
          url: "/dashboard/super-admin/solicitudes",
          tag: `lead-${leadId}`,
        })
      }
    } catch (err) {
      console.warn("[public/leads] push broadcast failed:", err)
    }

    return NextResponse.json({ success: true, leadId }, { status: 201 })
  } catch (e) {
    console.error("[public/leads] error:", e)
    return NextResponse.json({ error: "Error al enviar solicitud" }, { status: 500 })
  }
}