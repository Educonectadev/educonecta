import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { getServerSession } from "@/lib/auth"

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
    return NextResponse.json(data)
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

    const { name, logoUrl, order } = await req.json()
    if (!name || !logoUrl) {
      return NextResponse.json({ error: "Nombre y logo son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("PartnerInstitution")
      .insert({ name, logoUrl, order: order ?? 0 })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
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
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
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
