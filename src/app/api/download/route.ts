import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getInstallerStorage, getInstallerFilename, detectPlatform } from "@/lib/storage"

const validPlatforms = ["win", "linux", "mac"]

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform") || detectPlatform(request.headers.get("user-agent") || "")

  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ error: "Plataforma no soportada" }, { status: 400 })
  }

  const storage = getInstallerStorage()
  const result = await storage.getInstaller(platform as any)

  if (result?.signedUrl) {
    return NextResponse.redirect(result.signedUrl)
  }

  if (result?.buffer) {
    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": String(result.buffer.length),
      },
    })
  }

  const baseUrl = process.env.INSTALLER_BASE_URL
  if (baseUrl) {
    const filename = getInstallerFilename(platform as any)
    return NextResponse.redirect(`${baseUrl.replace(/\/$/, "")}/${filename}`)
  }

  return NextResponse.json({ error: "Instalador no disponible" }, { status: 404 })
}
