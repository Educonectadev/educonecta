import mysql, { type RowDataPacket, type ResultSetHeader, type Pool } from "mysql2/promise"

let pool: Pool

function getPool(): Pool {
  if (!pool) {
    const url = new URL(process.env.DATABASE_URL ?? "mysql://root:@localhost:3306/educonecta")
    pool = mysql.createPool({
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.replace("/", ""),
      waitForConnections: true,
      connectionLimit: 10,
    })
  }
  return pool
}

type Row = Record<string, unknown>

export async function query<T extends RowDataPacket[] = RowDataPacket[]>(
  sql: string,
  params?: unknown[],
): Promise<T> {
  const [rows] = await getPool().query<T>(sql, params)
  return rows
}

export async function execute(sql: string, params?: unknown[]): Promise<ResultSetHeader> {
  const [result] = await getPool().query<ResultSetHeader>(sql, params)
  return result
}

export async function findOne<T extends Row = Row>(
  table: string,
  where: Record<string, unknown>,
  select?: string[],
): Promise<T | null> {
  const keys = Object.keys(where)
  const cols = select?.length ? select.join(", ") : "*"
  const sql = `SELECT ${cols} FROM \`${table}\` WHERE ${keys.map((k) => `\`${k}\` = ?`).join(" AND ")} LIMIT 1`
  const rows = await query<RowDataPacket[] & T[]>(sql, Object.values(where))
  return rows.length ? rows[0] : null
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
  let sql = `SELECT ${opts?.select?.length ? opts.select.join(", ") : `\`${table}\`.*`} FROM \`${table}\``
  const params: unknown[] = []

  if (opts?.joins) sql += ` ${opts.joins}`

  if (opts?.where) {
    const keys = Object.keys(opts.where)
    sql += ` WHERE ${keys.map((k) => `\`${table}\`.\`${k}\` = ?`).join(" AND ")}`
    params.push(...Object.values(opts.where))
  }

  if (opts?.orderBy) sql += ` ORDER BY \`${opts.orderBy}\` ${opts.orderDir ?? "ASC"}`
  if (opts?.limit) sql += ` LIMIT ${opts.limit}`
  if (opts?.offset) sql += ` OFFSET ${opts.offset}`

  return query<RowDataPacket[] & T[]>(sql, params)
}

export async function create<T extends Row = Row>(
  table: string,
  data: Partial<T>,
): Promise<number> {
  const keys = Object.keys(data)
  const placeholders = keys.map(() => "?")
  const sql = `INSERT INTO \`${table}\` (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${placeholders.join(", ")})`
  const result = await execute(sql, Object.values(data))
  return result.insertId
}

export async function update<T extends Row = Row>(
  table: string,
  where: Record<string, unknown>,
  data: Partial<T>,
): Promise<number> {
  const setKeys = Object.keys(data)
  const whereKeys = Object.keys(where)
  const sql = `UPDATE \`${table}\` SET ${setKeys.map((k) => `\`${k}\` = ?`).join(", ")} WHERE ${whereKeys.map((k) => `\`${k}\` = ?`).join(" AND ")}`
  const result = await execute(sql, [...Object.values(data), ...Object.values(where)])
  return result.affectedRows
}

export async function remove(
  table: string,
  where: Record<string, unknown>,
): Promise<number> {
  const keys = Object.keys(where)
  const sql = `DELETE FROM \`${table}\` WHERE ${keys.map((k) => `\`${k}\` = ?`).join(" AND ")}`
  const result = await execute(sql, Object.values(where))
  return result.affectedRows
}

export async function count(
  table: string,
  where?: Record<string, unknown>,
): Promise<number> {
  let sql = `SELECT COUNT(*) as total FROM \`${table}\``
  const params: unknown[] = []
  if (where) {
    const keys = Object.keys(where)
    sql += ` WHERE ${keys.map((k) => `\`${k}\` = ?`).join(" AND ")}`
    params.push(...Object.values(where))
  }
  const rows = await query<RowDataPacket[]>(sql, params)
  return Number(rows[0].total)
}

export async function transaction<T>(fn: (conn: unknown) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection()
  try {
    await conn.beginTransaction()
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

export async function endPool(): Promise<void> {
  if (pool) await pool.end()
}

export const db = { query, execute, findOne, findMany, create, update, remove, count, transaction, endPool }
