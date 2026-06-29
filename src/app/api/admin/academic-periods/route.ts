import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const { data } = await getSupabaseAdmin()
      .from("AcademicPeriod")
      .select("*")
      .eq("institutionId", session.user.institutionId)
      .order("academicYear", { ascending: false })
      .order("order", { ascending: true })
    return NextResponse.json(data ?? [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const body = await req.json()
    const { data, error } = await getSupabaseAdmin()
      .from("AcademicPeriod")
      .insert({ ...body, institutionId: session.user.institutionId })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
