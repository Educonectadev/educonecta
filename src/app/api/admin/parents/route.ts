import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { query, create } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
}

async function emailExistsInDb(email: string): Promise<boolean> {
  const rows = await query("SELECT id FROM \"User\" WHERE email = ?", [email])
  return (rows as any[]).length > 0
}

async function emailExistsInAuth(email: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
    // listUsers paginado: hacemos búsqueda más precisa usando getUserByEmail si está disponible;
    // como fallback, paginamos hasta encontrarlo o agotar.
    let page = 1
    const perPage = 200
    while (true) {
      const { data: users } = await supabase.auth.admin.listUsers({ page, perPage })
      const list = (users as any)?.users ?? []
      if (list.some((u: any) => u.email?.toLowerCase() === email.toLowerCase())) return true
      if (list.length < perPage) return false
      page++
      if (page > 50) return false // safety: no paginar indefinidamente
    }
  } catch {
    // Si falla la consulta, no bloqueamos; lo capturaremos al intentar crear.
    return false
  }
}

async function findAvailableEmail(base: string, domain: string): Promise<string> {
  const MAX = 999
  for (let counter = 0; counter <= MAX; counter++) {
    const candidate = counter === 0 ? `${base}@${domain}.edu.pe` : `${base}${counter}@${domain}.edu.pe`
    const inDb = await emailExistsInDb(candidate)
    if (inDb) continue
    const inAuth = await emailExistsInAuth(candidate)
    if (inAuth) continue
    return candidate
  }
  throw new Error("No fue posible generar un email único para el padre")
}

async function generateEmail(firstName: string, lastName: string, institutionId: number): Promise<string> {
  const base = `${normalize(firstName)}.${normalize(lastName)}`
  const inst = await query("SELECT name FROM \"Institution\" WHERE id = ?", [institutionId])
  const domain = normalize((inst as any[])[0]?.name || "colegio")
  return findAvailableEmail(base, domain)
}

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!
  const parents = await query(
    `SELECT p.id,
            p."userId",
            p."institutionId",
            p."occupation",
            p."createdAt",
            p."updatedAt",
            jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user,
            COALESCE(
              JSON_AGG(
                jsonb_build_object(
                  'parentId', ps."parentId",
                  'studentId', ps."studentId",
                  'student', jsonb_build_object(
                    'id', st.id,
                    'firstName', st."firstName",
                    'lastName', st."lastName",
                    'documentId', st."documentId"
                  )
                )
              ) FILTER (WHERE ps."parentId" IS NOT NULL),
              JSON_ARRAY()
            ) AS children
     FROM "Parent" p
     JOIN "User" u ON p."userId" = u.id
     LEFT JOIN "ParentStudent" ps ON ps."parentId" = p.id
     LEFT JOIN "Student" st ON ps."studentId" = st.id
     WHERE p."institutionId" = ?
     GROUP BY p.id, u.id
     ORDER BY p."createdAt" DESC`,
    [institutionId]
  )

  return NextResponse.json(parents)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const institutionId = session.user.institutionId!

  try {
    const body = await request.json()
    const { firstName, lastName, password, phone, studentIds } = body

    if (!firstName || !lastName || !password) {
      return NextResponse.json({ error: "Nombres, apellidos y contraseña son requeridos" }, { status: 400 })
    }

    const name = `${firstName.trim()} ${lastName.trim()}`
    const passwordHash = await bcrypt.hash(password, 10)

    const supabase = getSupabaseAdmin()

    // 1) Genera email base y encuentra uno disponible checando BD + Auth.
    const base = `${normalize(firstName)}.${normalize(lastName)}`
    const inst = await query("SELECT name FROM \"Institution\" WHERE id = ?", [institutionId])
    const domain = normalize((inst as any[])[0]?.name || "colegio")

    const MAX_RETRIES = 5
    let email = ""
    let attempt = 0
    while (attempt <= MAX_RETRIES) {
      try {
        const candidate = attempt === 0
          ? `${base}@${domain}.edu.pe`
          : `${base}${attempt}@${domain}.edu.pe`

        // Verifica primero en BD y en Auth para evitar el 400.
        if (await emailExistsInDb(candidate)) {
          attempt++
          continue
        }
        if (await emailExistsInAuth(candidate)) {
          attempt++
          continue
        }

        // Crea el usuario en Supabase Auth primero.
        const { error: authError } = await supabase.auth.admin.createUser({
          email: candidate,
          password,
          email_confirm: true,
        })
        if (authError) {
          // Si Auth reporta duplicado (caso de race condition), reintenta con otro email.
          if (/already been registered|already exists|duplicate/i.test(authError.message ?? "")) {
            attempt++
            continue
          }
          return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        email = candidate
        break
      } catch (e: any) {
        attempt++
        if (attempt > MAX_RETRIES) throw e
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: "No fue posible asignar un email único al padre. Intenta con otro nombre/apellido." },
        { status: 409 }
      )
    }

    // 2) Crea el User en nuestra BD.
    let userId: number
    try {
      userId = await create("User", {
        name,
        email,
        passwordHash,
        phone: phone || null,
        role: "PARENT",
        institutionId,
      })
    } catch (e: any) {
      // Si falla el insert en BD, elimina el usuario de Auth para no dejar huérfano.
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
        const match = (authUsers as any)?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
        if (match?.id) await supabase.auth.admin.deleteUser(match.id)
      } catch {}
      throw e
    }

    // 3) Crea el Parent.
    let parentId: number
    try {
      parentId = await create("Parent", {
        institutionId,
        userId,
      })
    } catch (e: any) {
      // Rollback: elimina User y Auth user.
      try {
        await query("DELETE FROM \"User\" WHERE id = ?", [userId])
      } catch {}
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
        const match = (authUsers as any)?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
        if (match?.id) await supabase.auth.admin.deleteUser(match.id)
      } catch {}
      throw e
    }

    // 4) Asocia hijos (si los hay).
    if (Array.isArray(studentIds)) {
      for (const studentId of studentIds) {
        try {
          await create("ParentStudent", { parentId, studentId: Number(studentId) })
        } catch (e: any) {
          // Si el student ya estaba asociado (UNIQUE), no rompemos el flujo.
          if (!/duplicate|unique/i.test(e?.message ?? "")) throw e
        }
      }
    }

    const parent = await query(
      `SELECT p.id,
              p."userId",
              p."institutionId",
              p."occupation",
              p."createdAt",
              p."updatedAt",
              jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user,
              COALESCE(
                JSON_AGG(
                  jsonb_build_object(
                    'parentId', ps."parentId",
                    'studentId', ps."studentId",
                    'student', jsonb_build_object(
                      'id', st.id,
                      'firstName', st."firstName",
                      'lastName', st."lastName",
                      'documentId', st."documentId"
                    )
                  )
                ) FILTER (WHERE ps."parentId" IS NOT NULL),
                JSON_ARRAY()
              ) AS children
       FROM "Parent" p
       JOIN "User" u ON p."userId" = u.id
       LEFT JOIN "ParentStudent" ps ON ps."parentId" = p.id
       LEFT JOIN "Student" st ON ps."studentId" = st.id
       WHERE p.id = ?
       GROUP BY p.id, u.id`,
      [parentId]
    )

    return NextResponse.json(parent[0], { status: 201 })
  } catch (e: any) {
    console.error("[admin/parents POST]", e?.message ?? e)
    const msg = e?.message ?? "Error al crear padre"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
