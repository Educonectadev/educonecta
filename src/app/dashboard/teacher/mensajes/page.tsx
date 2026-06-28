import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { query } from "@/lib/prisma"
import TeacherMessagesClient from "./TeacherMessagesClient"

export const dynamic = "force-dynamic"

export default async function TeacherMensajesPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "TEACHER" || !session.user.teacherId) redirect("/login")

  const teacherUserId = Number(session.user.id)
  const teacherId = session.user.teacherId

  const parents = await query<any[]>(
    `SELECT DISTINCT p."userId" AS "userId", u.name,
            s.id AS "studentId", s."firstName" || ' ' || s."lastName" AS "studentName"
     FROM "ParentStudent" ps
     JOIN Parent p ON p.id = ps."parentId"
     JOIN "User" u ON u.id = p."userId"
     JOIN Student s ON s.id = ps."studentId"
     WHERE (s."gradeId" IN (SELECT ct."gradeId" FROM "CourseTeacher" ct WHERE ct."teacherId" = ?)
            OR EXISTS (SELECT 1 FROM "CourseTeacher" ct2 WHERE ct2."teacherId" = ? AND ct2."gradeId" IS NULL))
     ORDER BY u.name`,
    [teacherId, teacherId]
  )

  const lastMessages = await query<any[]>(
    `SELECT * FROM "ParentTeacherMessage" WHERE "teacherUserId" = ? ORDER BY "createdAt" DESC LIMIT 200`,
    [teacherUserId]
  )

  return (
    <TeacherMessagesClient
      parents={parents as any}
      lastMessages={lastMessages as any}
      teacherUserId={teacherUserId}
      teacherName={session.user.name}
    />
  )
}