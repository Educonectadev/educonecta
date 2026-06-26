import { getSupabaseAdmin } from "./supabase"

export function toSupabaseTable(table: string): string {
  return table
}

const TABLE_NAMES = ["Student", "Grade", "Section", "Teacher", "Course", "Parent", "User", "Institution", "CourseTeacher", "Schedule", "Homework", "HomeworkSubmission", "Attendance", "Tardiness", "GradeRecord", "Discipline", "Notification", "ParentStudent", "Communication", "InstitutionalAdmin", "Enrollment", "Subject", "Classroom"]

// camelCase column names that must be double-quoted so PostgreSQL preserves case
const COLUMN_NAMES = [
  "gradeId", "sectionId", "institutionId", "teacherId", "courseId",
  "studentId", "parentId", "userId", "homeworkId",
  "firstName", "lastName", "documentId", "isActive", "passwordHash",
  "createdAt", "updatedAt", "academicYear", "isPresent", "minutesLate",
  "isCurrent", "enrollmentDate", "dayOfWeek", "startTime", "endTime",
  "speciality", "submitDate", "classroomId",
  "educationLevel", "hireDate", "contractType", "emergencyContact", "emergencyPhone",
  "dueDate", "authorId", "evaluationDate",
]

function quoteTableNames(sql: string): string {
  const tableJoined = TABLE_NAMES.join("|")
  let result = sql.replace(
    new RegExp(`\\b(FROM|JOIN|INTO|UPDATE|TABLE|REFERENCES)\\s+(${tableJoined})\\b`, "g"),
    '$1 "$2"'
  )
  for (const col of COLUMN_NAMES) {
    result = result.replace(new RegExp(`(?<!["\\w'])${col}(?!["\\w'])`, "g"), `"${col}"`)
  }
  return result
}

export async function query<T = any[]>(sql: string, params?: unknown[]): Promise<T> {
  const { data, error } = await getSupabaseAdmin().rpc("exec_sql", {
    query: quoteTableNames(sql),
    params: params || [],
  })
  if (error) throw error
  return (data ?? []) as T
}

export async function execute(sql: string, params?: unknown[]): Promise<{ affectedRows: number; insertId: number }> {
  const { data, error } = await getSupabaseAdmin().rpc("exec_sql", {
    query: quoteTableNames(sql),
    params: params || [],
  })
  if (error) throw error
  return { affectedRows: 0, insertId: 0 }
}

export async function findOne<T = Record<string, unknown>>(
  table: string,
  where: Record<string, unknown>,
  select?: string[],
): Promise<T | null> {
  const cols = select?.join(", ") || "*"
  let q = getSupabaseAdmin().from(table).select(cols)
  for (const [key, value] of Object.entries(where)) {
    q = q.eq(key, value as any)
  }
  const { data, error } = await q.limit(1).maybeSingle()
  if (error) throw error
  return data as T | null
}

export async function findMany<T = Record<string, unknown>>(
  table: string,
  opts?: {
    where?: Record<string, unknown>
    select?: string[]
    orderBy?: string
    orderDir?: "ASC" | "DESC"
    limit?: number
    offset?: number
  },
): Promise<T[]> {
  const cols = opts?.select?.join(", ") || "*"
  let q = getSupabaseAdmin().from(table).select(cols)

  if (opts?.where) {
    for (const [key, value] of Object.entries(opts.where)) {
      q = q.eq(key, value as any)
    }
  }

  if (opts?.orderBy) {
    q = q.order(opts.orderBy, { ascending: opts.orderDir !== "DESC" })
  }

  if (opts?.limit) q = q.limit(opts.limit)
  if (opts?.offset) q = q.range(opts.offset, opts.offset + (opts?.limit || 10) - 1)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as T[]
}

export async function create(
  table: string,
  data: Record<string, unknown>,
): Promise<number> {
  const { data: inserted, error } = await getSupabaseAdmin()
    .from(table)
    .insert(data as any)
    .select("id")
    .single()
  if (error) throw error
  return (inserted as any).id
}

export async function update(
  table: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<number> {
  let q = getSupabaseAdmin().from(table).update(data as any)
  for (const [key, value] of Object.entries(where)) {
    q = q.eq(key, value as any)
  }
  const { error, count } = await q
  if (error) throw error
  return count || 0
}

export async function remove(
  table: string,
  where: Record<string, unknown>,
): Promise<number> {
  let q = getSupabaseAdmin().from(table).delete()
  for (const [key, value] of Object.entries(where)) {
    q = q.eq(key, value as any)
  }
  const { error, count } = await q
  if (error) throw error
  return count || 0
}

export async function count(
  table: string,
  where?: Record<string, unknown>,
): Promise<number> {
  let q = getSupabaseAdmin().from(table).select("*", { count: "exact", head: true })
  if (where) {
    for (const [key, value] of Object.entries(where)) {
      q = q.eq(key, value as any)
    }
  }
  const { count: total, error } = await q
  if (error) throw error
  return total || 0
}

export async function transaction<T>(fn: (conn?: unknown) => Promise<T>): Promise<T> {
  return fn()
}

export async function endPool(): Promise<void> {}

export const db = { query, execute, findOne, findMany, create, update, remove, count, transaction, endPool }
