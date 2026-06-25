import { getSupabaseAdmin } from "./supabase"

type Row = Record<string, unknown>

export function toSupabaseTable(table: string): string {
  return table
}

const TABLE_NAMES = ["Student", "Grade", "Section", "Teacher", "Course", "Parent", "User", "Institution", "CourseTeacher", "Schedule", "Homework", "HomeworkSubmission", "Attendance", "Tardiness", "GradeRecord", "Discipline", "Notification", "ParentStudent", "Communication", "InstitutionalAdmin", "Enrollment", "Subject", "Classroom"]

function quoteTableNames(sql: string): string {
  const joined = TABLE_NAMES.join("|")
  let result = sql.replace(new RegExp(`\\b(FROM|JOIN|INTO|UPDATE|TABLE|REFERENCES)\\s+(${joined})\\b`, "g"), '$1 "$2"')
  // Quote column identifiers that contain uppercase letters (e.g. institutionId, firstName)
  // but avoid already-quoted identifiers and string literals
  result = result.replace(/(?<!["\w'])([a-z]+[A-Z][a-zA-Z0-9_]*)\b/g, '"$1"')
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
  let query = getSupabaseAdmin().from(table).select(cols)
  for (const [key, value] of Object.entries(where)) {
    query = query.eq(key, value as any)
  }
  const { data, error } = await query.limit(1).maybeSingle()
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
    joins?: string
  },
): Promise<T[]> {
  const cols = opts?.select?.join(", ") || "*"
  let query = getSupabaseAdmin().from(table).select(cols)

  if (opts?.where) {
    for (const [key, value] of Object.entries(opts.where)) {
      query = query.eq(key, value as any)
    }
  }

  if (opts?.orderBy) {
    query = query.order(opts.orderBy, {
      ascending: opts.orderDir !== "DESC",
    })
  }

  if (opts?.limit) query = query.limit(opts.limit)
  if (opts?.offset) query = query.range(opts.offset, opts.offset + (opts?.limit || 10) - 1)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as T[]
}

export async function create<T = Record<string, unknown>>(
  table: string,
  data: Record<string, unknown>,
): Promise<number> {
  const lowerData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k.toLowerCase(), v])
  )
  const { data: inserted, error } = await getSupabaseAdmin()
    .from(table)
    .insert(lowerData as any)
    .select("id")
    .single()
  if (error) throw error
  return (inserted as any).id
}

export async function update<T = Record<string, unknown>>(
  table: string,
  where: Record<string, unknown>,
  data: Partial<T>,
): Promise<number> {
  const lowerData = Object.fromEntries(
    Object.entries(data as Record<string, unknown>).map(([k, v]) => [k.toLowerCase(), v])
  )
  let query = getSupabaseAdmin().from(table).update(lowerData as any)
  for (const [key, value] of Object.entries(where)) {
    query = query.eq(key, value as any)
  }
  const { error, count } = await query
  if (error) throw error
  return count || 0
}

export async function remove(
  table: string,
  where: Record<string, unknown>,
): Promise<number> {
  let query = getSupabaseAdmin().from(table).delete()
  for (const [key, value] of Object.entries(where)) {
    query = query.eq(key, value as any)
  }
  const { error, count } = await query
  if (error) throw error
  return count || 0
}

export async function count(
  table: string,
  where?: Record<string, unknown>,
): Promise<number> {
  let query = getSupabaseAdmin().from(table).select("*", { count: "exact", head: true })
  if (where) {
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value as any)
    }
  }
  const { count: total, error } = await query
  if (error) throw error
  return total || 0
}

export async function transaction<T>(fn: (conn?: unknown) => Promise<T>): Promise<T> {
  return fn()
}

export async function endPool(): Promise<void> {}

export const db = { query, execute, findOne, findMany, create, update, remove, count, transaction, endPool }
