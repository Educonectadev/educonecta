import { getSupabaseAdmin } from "./supabase"

export type CursorPaginationParams = {
  cursor?: string
  limit?: number
  orderBy: string
  orderDir?: "ASC" | "DESC"
}

export type PaginatedResult<T> = {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
  total?: number
}

export async function paginate<T extends Record<string, any>>(
  table: string,
  opts: {
    where?: Record<string, unknown>
    select?: string[]
    orderBy: string
    orderDir?: "ASC" | "DESC"
    limit?: number
    cursor?: string
    includeTotal?: boolean
  },
): Promise<PaginatedResult<T>> {
  const limit = opts.limit ?? 50
  const orderDir = opts.orderDir ?? "ASC"
  const cols = opts.select?.join(", ") || "*"

  let q = getSupabaseAdmin()
    .from(table)
    .select(cols)

  if (opts.where) {
    for (const [key, value] of Object.entries(opts.where)) {
      q = q.eq(key, value as any)
    }
  }

  if (opts.cursor) {
    const operator = orderDir === "ASC" ? "gt" : "lt"
    q = q.filter(opts.orderBy, operator, opts.cursor)
  }

  q = q.order(opts.orderBy, { ascending: orderDir !== "DESC" })
  q = q.limit(limit + 1)

  const { data, error } = await q
  if (error) throw error

  const rows = (data ?? []) as unknown as T[]
  const hasMore = rows.length > limit
  const result = rows.slice(0, limit)
  const nextCursor = hasMore
    ? String(result[result.length - 1]?.[opts.orderBy] ?? "")
    : null

  let total: number | undefined
  if (opts.includeTotal) {
    let countQ = getSupabaseAdmin()
      .from(table)
      .select("*", { count: "exact", head: true })
    if (opts.where) {
      for (const [key, value] of Object.entries(opts.where)) {
        countQ = countQ.eq(key, value as any)
      }
    }
    const { count } = await countQ
    total = count ?? 0
  }

  return { data: result, nextCursor, hasMore, total }
}

export function encodeCursor(value: string | number): string {
  return Buffer.from(String(value)).toString("base64")
}

export function decodeCursor(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8")
}
