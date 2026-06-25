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
      .from("Version")
      .select("*")
      .order("createdat", { ascending: false })

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

    const { version, title, description, isCurrent } = await req.json()
    if (!version) {
      return NextResponse.json({ error: "Versión es requerida" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    if (isCurrent) {
      await supabase.from("Version").update({ iscurrent: false }).neq("id", 0)
    }

    const { data, error } = await supabase
      .from("Version")
      .insert({ version, title, description, iscurrent: isCurrent ?? false })
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

    if (body.isCurrent) {
      await supabase.from("Version").update({ iscurrent: false }).neq("id", 0)
    }

    const { data, error } = await supabase
      .from("Version")
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
    const { error } = await supabase.from("Version").delete().eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
