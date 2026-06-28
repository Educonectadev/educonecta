import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

const DEFAULT_BRAND_COLOR = "#000000"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { data, error } = await getSupabaseAdmin()
      .from("User")
      .select("brandColor")
      .eq("id", Number(session.user.id))
      .maybeSingle()

    if (error) {
      // PGRST204: la columna no existe en la tabla. Migración 014 no aplicada.
      if (error.code === "PGRST204" || error.message?.includes("does not exist")) {
        return NextResponse.json({ brandColor: DEFAULT_BRAND_COLOR })
      }
      console.error("[brand-color GET]", error)
      return NextResponse.json({ error: "No se pudo obtener el color" }, { status: 500 })
    }

    return NextResponse.json({ brandColor: data?.brandColor ?? DEFAULT_BRAND_COLOR })
  } catch (e) {
    console.error("[brand-color GET]", e)
    return NextResponse.json({ brandColor: DEFAULT_BRAND_COLOR })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { brandColor } = await req.json()

    if (!brandColor || typeof brandColor !== "string") {
      return NextResponse.json({ error: "Color inválido" }, { status: 400 })
    }

    const { error } = await getSupabaseAdmin()
      .from("User")
      .update({ brandColor } as any)
      .eq("id", Number(session.user.id))

    if (error) {
      if (error.code === "PGRST204" || error.message?.includes("does not exist")) {
        // Sin migración aplicada: no guardamos, pero no rompemos la app.
        return NextResponse.json({ success: true, persisted: false })
      }
      console.error("[brand-color PUT]", error)
      return NextResponse.json({ error: "No se pudo guardar el color" }, { status: 500 })
    }

    return NextResponse.json({ success: true, persisted: true })
  } catch (e) {
    console.error("[brand-color PUT]", e)
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 })
  }
}
