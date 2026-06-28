import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { query, execute, create, update, remove } from "@/lib/prisma"
import { getSupabaseAdmin } from "@/lib/supabase"

async function deleteAuthUserByEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin()
    // listUsers es paginado; buscamos el email en todas las páginas
    let page = 1
    const perPage = 200
    while (page <= 50) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) return { ok: false, error: error.message }
      const users = (data as any)?.users ?? []
      const match = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
      if (match?.id) {
        const { error: delErr } = await supabase.auth.admin.deleteUser(match.id)
        if (delErr) return { ok: false, error: delErr.message }
        return { ok: true }
      }
      if (users.length < perPage) return { ok: true }
      page++
    }
    return { ok: true } // no encontrado en Auth, OK continuar
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) }
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const parentRows = await query(
    `SELECT p.*, jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
    FROM Parent p
    JOIN User u ON p.userId = u.id
    WHERE p.id = ? AND p.institutionId = ?`,
    [id, institutionId]
  )
  if (parentRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const parent = parentRows[0]

  try {
    const body = await request.json()
    const { firstName, lastName, password, phone, studentIds } = body

    const userData: Record<string, unknown> = {}
    if (firstName || lastName) {
      userData.name = `${firstName?.trim() ?? ""} ${lastName?.trim() ?? ""}`.trim()
    }
    if (phone !== undefined) userData.phone = phone
    if (password) userData.passwordHash = await bcrypt.hash(password, 10)

    if (Object.keys(userData).length > 0) {
      await update("User", { id: parent.userId }, userData)
    }

    if (studentIds !== undefined) {
      await execute("DELETE FROM ParentStudent WHERE parentId = ?", [id])
      if (Array.isArray(studentIds) && studentIds.length > 0) {
        for (const studentId of studentIds) {
          await create("ParentStudent", { parentId: id, studentId })
        }
      }
    }

    const updated = await query(
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
      [id]
    )
    return NextResponse.json(updated[0])
  } catch (e: any) {
    console.error("[admin/parents PUT]", e?.message ?? e)
    return NextResponse.json({ error: e?.message ?? "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || session.user.role !== "INSTITUTIONAL_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const institutionId = session.user.institutionId!
  const id = Number((await params).id)

  const parentRows = await query(
    `SELECT p.id, p."userId", u.email
     FROM Parent p
     JOIN "User" u ON u.id = p."userId"
     WHERE p.id = ? AND p."institutionId" = ?`,
    [id, institutionId]
  )
  if (parentRows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const parent = parentRows[0] as { id: number; userId: number; email: string }

  try {
    // 1) Borrar dependencias en la BD.
    await execute("DELETE FROM \"ParentStudent\" WHERE \"parentId\" = ?", [id])
    await execute("DELETE FROM \"Notification\" WHERE \"parentId\" = ?", [id])

    // 2) Borrar Parent y User de la BD.
    await remove("Parent", { id })
    await remove("User", { id: parent.userId })

    // 3) Borrar el usuario de Supabase Auth para liberar el email.
    //    Si esto falla, no revertimos la BD: el email queda ocupado en Auth
    //    pero la BD ya está limpia. Logueamos el error para diagnóstico.
    const authResult = await deleteAuthUserByEmail(parent.email)
    if (!authResult.ok) {
      console.warn(`[admin/parents DELETE] Auth cleanup failed for ${parent.email}: ${authResult.error}`)
    }

    return NextResponse.json({ success: true, authDeleted: authResult.ok })
  } catch (e: any) {
    console.error("[admin/parents DELETE]", e?.message ?? e)
    return NextResponse.json({ error: "Error al eliminar: el padre tiene registros asociados" }, { status: 500 })
  }
}
