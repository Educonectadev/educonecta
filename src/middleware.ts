import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const rolePaths: Record<string, string[]> = {
  SUPER_ADMIN: ["/super-admin", "/dashboard/super-admin"],
  INSTITUTIONAL_ADMIN: ["/admin", "/dashboard/admin"],
  TEACHER: ["/profesor", "/dashboard/teacher"],
  PARENT: ["/padre", "/dashboard/parent"],
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  if (pathname === "/") {
    if (token) return NextResponse.redirect(new URL("/dashboard", req.url))
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const allowed = rolePaths[token.role as string] ?? []

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

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/profesor/:path*", "/padre/:path*", "/super-admin/:path*", "/dashboard/:path*"],
}
