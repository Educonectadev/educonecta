import { supabaseAdmin } from "./supabase"
import bcrypt from "bcryptjs"

type Row = Record<string, unknown>

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function convertKeysToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[toSnakeCase(key)] = value
  }
  return result
}

function convertKeysToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[toCamelCase(key)] = value
  }
  return result
}

export function toSupabaseTable(table: string): string {
  return table
}

export async function query<T extends Row[] = Row[]>(
  sql: string,
  params?: unknown[],
): Promise<T> {
  // For raw SQL queries, we use rpc with exec_sql
  // If exec_sql is not available, this will fail
  const { data, error } = await supabaseAdmin.rpc("exec_sql", {
    query: sql,
    params: params || [],
  })
  if (error) throw error
  return (data as T) || ([] as T)
}

export async function execute(sql: string, params?: unknown[]): Promise<{ affectedRows: number; insertId: number }> {
  const { data, error } = await supabaseAdmin.rpc("exec_sql", {
    query: sql,
    params: params || [],
  })
  if (error) throw error
  return { affectedRows: 0, insertId: 0 }
}

export async function findOne<T extends Row = Row>(
  table: string,
  where: Record<string, unknown>,
  select?: string[],
): Promise<T | null> {
  const cols = select?.join(", ") || "*"
  let query = supabaseAdmin.from(table).select(cols)
  for (const [key, value] of Object.entries(where)) {
    query = query.eq(key, value)
  }
  const { data, error } = await query.limit(1).maybeSingle()
  if (error) throw error
  return data as T | null
}

export async function findMany<T extends Row = Row>(
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
  let query = supabaseAdmin.from(table).select(cols)

  if (opts?.where) {
    for (const [key, value] of Object.entries(opts.where)) {
      query = query.eq(key, value)
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
  return (data as T[]) || []
}

export async function create<T extends Row = Row>(
  table: string,
  data: Partial<T>,
): Promise<number> {
  const { data: inserted, error } = await supabaseAdmin
    .from(table)
    .insert(data)
    .select("id")
    .single()
  if (error) throw error
  return (inserted as any).id
}

export async function update<T extends Row = Row>(
  table: string,
  where: Record<string, unknown>,
  data: Partial<T>,
): Promise<number> {
  let query = supabaseAdmin.from(table).update(data)
  for (const [key, value] of Object.entries(where)) {
    query = query.eq(key, value)
  }
  const { error, count } = await query
  if (error) throw error
  return count || 0
}

export async function remove(
  table: string,
  where: Record<string, unknown>,
): Promise<number> {
  let query = supabaseAdmin.from(table).delete()
  for (const [key, value] of Object.entries(where)) {
    query = query.eq(key, value)
  }
  const { error, count } = await query
  if (error) throw error
  return count || 0
}

export async function count(
  table: string,
  where?: Record<string, unknown>,
): Promise<number> {
  let query = supabaseAdmin.from(table).select("*", { count: "exact", head: true })
  if (where) {
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value)
    }
  }
  const { count: total, error } = await query
  if (error) throw error
  return total || 0
}

export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  return fn()
}

export async function endPool(): Promise<void> {
  // no-op for Supabase
}
