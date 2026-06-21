import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const rolePaths: Record<string, string[]> = {
  SUPER_ADMIN: ["/super-admin", "/dashboard/super-admin"],
  INSTITUTIONAL_ADMIN: ["/admin", "/dashboard/admin"],
  TEACHER: ["/profesor", "/dashboard/teacher"],
  PARENT: ["/padre", "/dashboard/parent"],
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

  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    if (authUser && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return supabaseResponse
  }

  if (pathname === "/") {
    if (authUser) return NextResponse.redirect(new URL("/dashboard", req.url))
    return supabaseResponse
  }

  if (!authUser) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Get user role from our User table via API
  const sessionRes = await fetch(new URL("/api/auth/session", req.url))
  const session = sessionRes.ok ? await sessionRes.json() : null
  const role = session?.user?.role

  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const allowed = rolePaths[role] ?? []

  const isProtected = [
    "/admin", "/profesor", "/padre", "/super-admin",
    "/dashboard/admin", "/dashboard/teacher", "/dashboard/parent", "/dashboard/super-admin",
  ].some((p) => pathname === p || pathname.startsWith(p + "/"))

  if (isProtected) {
    const hasAccess = allowed.some((p) => pathname === p || pathname.startsWith(p + "/"))
    if (!hasAccess) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/profesor/:path*", "/padre/:path*", "/super-admin/:path*", "/dashboard/:path*"],
}
