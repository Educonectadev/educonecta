import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const id = Number((await params).id)
    const body = await req.json()
    const { error } = await getSupabaseAdmin()
      .from("AcademicPeriod")
      .update(body)
      .eq("id", id)
      .eq("institutionId", session.user.institutionId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const id = Number((await params).id)
    const { error } = await getSupabaseAdmin()
      .from("AcademicPeriod")
      .delete()
      .eq("id", id)
      .eq("institutionId", session.user.institutionId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
