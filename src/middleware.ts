import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const rolePaths: Record<string, string[]> = {
  SUPER_ADMIN: ["/super-admin", "/dashboard/super-admin", "/developer"],
  INSTITUTIONAL_ADMIN: ["/admin", "/dashboard/admin", "/director"],
  SECRETARY: ["/dashboard/secretary"],
  TEACHER: ["/profesor", "/dashboard/teacher", "/docente"],
  PARENT: ["/padre", "/dashboard/parent", "/padres"],
  STUDENT: ["/dashboard/student", "/alumnos"],
}

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user: authUser } } = await supabase.auth.getUser()
  const { pathname } = req.nextUrl

  if (pathname === "/login" || pathname === "/super-admin/register" || pathname.startsWith("/api/auth/")) {
    return supabaseResponse
  }

  if (pathname === "/") {
    if (authUser) return NextResponse.redirect(new URL("/dashboard", req.url))
    return supabaseResponse
  }

  if (!authUser) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const { data: user } = await serviceClient
      .from("User")
      .select("role")
      .eq("email", authUser.email)
      .maybeSingle()

    const role = user?.role

    if (role) {
      const allowed = rolePaths[role] ?? []

      const isProtected = [
        "/admin", "/profesor", "/padre", "/super-admin",
        "/dashboard/admin", "/dashboard/teacher", "/dashboard/parent", "/dashboard/super-admin", "/dashboard/student", "/dashboard/secretary",
        "/developer", "/director", "/docente", "/padres", "/alumnos",
      ].some((p) => pathname === p || pathname.startsWith(p + "/"))

      if (isProtected) {
        const hasAccess = allowed.some((p) => pathname === p || pathname.startsWith(p + "/"))
        if (!hasAccess) {
          return NextResponse.redirect(new URL("/unauthorized", req.url))
        }
      }
    }
  } catch {
    // If role query fails, let the page handle auth
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/profesor/:path*", "/padre/:path*", "/super-admin/:path*", "/dashboard/:path*", "/developer", "/director", "/docente", "/padres", "/alumnos", "/secretaria"],
}
