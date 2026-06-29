import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getSettings, updateSettings } from "@/lib/institution-config"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const settings = await getSettings(session.user.institutionId)
    return NextResponse.json(settings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || !session.user.institutionId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const body = await req.json()
    await updateSettings(session.user.institutionId, body)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
