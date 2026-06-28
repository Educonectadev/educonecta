import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido" }, { status: 400 })
  }

  console.log("[LOGIN] Body recibido:", JSON.stringify({ ...body, password: body.password ? "***" : undefined }))

  const { email, password } = body as { email?: string; password?: string }

  if (!email || typeof email !== "string") {
    console.log("[LOGIN] Campo faltante o inválido: email")
    return NextResponse.json({ error: "El campo 'email' es requerido y debe ser un texto" }, { status: 400 })
  }
  if (!password || typeof password !== "string") {
    console.log("[LOGIN] Campo faltante o inválido: password")
    return NextResponse.json({ error: "El campo 'password' es requerido y debe ser un texto" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.log("[LOGIN] Supabase Auth error:", error.message)
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
  }

  console.log("[LOGIN] Inicio de sesión exitoso para:", email)
  return NextResponse.json({ ok: true })
}
