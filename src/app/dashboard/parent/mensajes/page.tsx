import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import ParentMessagesClient from "./ParentMessagesClient"

export const dynamic = "force-dynamic"

export default async function ParentMensajesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "PARENT" || !session.user.parentId) redirect("/login")

  const parentUserId = Number(session.user.id)

  const teachers = await query<any[]>(
    `SELECT DISTINCT t."userId", u.id AS "userId", u.name, t.id AS "teacherId"
     FROM "CourseTeacher" ct
     JOIN Teacher t ON t.id = ct."teacherId"
     JOIN "User" u ON u.id = t."userId"
     WHERE (ct."gradeId" IN (SELECT s."gradeId" FROM Student s
                              JOIN "ParentStudent" ps ON ps."studentId" = s.id
                              WHERE ps."parentId" = ?)
            OR ct."gradeId" IS NULL)
       AND (ct."sectionId" IN (SELECT s."sectionId" FROM Student s
                                JOIN "ParentStudent" ps ON ps."studentId" = s.id
                                WHERE ps."parentId" = ?)
            OR ct."sectionId" IS NULL)
     ORDER BY u.name`,
    [session.user.parentId, session.user.parentId]
  )

  const lastMessages = await query<any[]>(
    `SELECT * FROM "ParentTeacherMessage"
     WHERE "parentUserId" = ?
     ORDER BY "createdAt" DESC LIMIT 200`,
    [parentUserId]
  )

  return (
    <ParentMessagesClient
      teachers={teachers as any}
      lastMessages={lastMessages as any}
      parentUserId={parentUserId}
      parentName={session.user.name}
    />
  )
}