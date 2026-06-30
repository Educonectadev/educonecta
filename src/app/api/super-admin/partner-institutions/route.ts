import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { getServerSession } from "@/lib/auth"

function toDb(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k === "logoUrl") out.logourl = v
    else if (k === "isActive") out.isactive = v
    else out[k] = v
  }
  return out
}

function fromDb(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k === "logourl") out.logoUrl = v
    else if (k === "isactive") out.isActive = v
    else out[k] = v
  }
  return out
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("PartnerInstitution")
      .select("*")
      .order("order", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json((data ?? []).map(fromDb))
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { name, logoUrl, order } = body
    if (!name || !logoUrl) {
      return NextResponse.json({ error: "Nombre y logo son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("PartnerInstitution")
      .insert(toDb({ name, logoUrl, order: order ?? 0 }))
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(fromDb(data), { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    const body = await req.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from("PartnerInstitution")
      .update(toDb(body))
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(fromDb(data))
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("PartnerInstitution").delete().eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
