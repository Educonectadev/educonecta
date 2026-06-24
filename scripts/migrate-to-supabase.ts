import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const databaseUrl = process.env.SUPABASE_DATABASE_URL

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const schemaPath = resolve(__dirname, "../supabase-schema.sql")
const schema = readFileSync(schemaPath, "utf-8")

async function migrateViaPg() {
  const { Client } = await import("pg")
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  console.log("Connected to PostgreSQL directly")
  await client.query(schema)
  console.log("Schema executed successfully via PostgreSQL")
  await client.end()
}

async function migrateViaRpc() {
  console.log("Connecting to Supabase...")
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const statements = splitSQL(schema)

  console.log(`Executing ${statements.length} SQL statements via RPC...`)

  for (let i = 0; i < statements.length; i++) {
    const { error } = await supabase.rpc("exec_sql", { query: statements[i] })
    if (error) {
      console.error(`Statement ${i + 1} failed:`, error.message)
      console.error("SQL was:", statements[i].slice(0, 200))
    } else {
      console.log(`Statement ${i + 1}/${statements.length} OK`)
    }
  }
  console.log("Migration complete!")
}

function splitSQL(sql: string): string[] {
  const statements: string[] = []
  let current = ""
  let inDollar = false
  let dollarTag = ""

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]

    if (!inDollar && ch === "$") {
      const match = sql.slice(i).match(/^\$([^$]*)\$/)
      if (match) {
        inDollar = true
        dollarTag = match[1]
        current += match[0]
        i += match[0].length - 1
        continue
      }
    }

    if (inDollar && ch === "$") {
      const endMatch = sql.slice(i).match(new RegExp(`^\\$\\{dollarTag}\\$`))
      if (endMatch) {
        inDollar = false
        dollarTag = ""
        current += endMatch[0]
        i += endMatch[0].length - 1
        continue
      }
    }

    if (!inDollar && ch === ";") {
      const trimmed = current.trim()
      if (trimmed && !trimmed.startsWith("--")) {
        statements.push(trimmed + ";")
      }
      current = ""
      continue
    }

    current += ch
  }

  const trimmed = current.trim()
  if (trimmed && !trimmed.startsWith("--")) {
    statements.push(trimmed + ";")
  }

  return statements
}

async function migrate() {
  if (databaseUrl) {
    try {
      await migrateViaPg()
      return
    } catch (err) {
      console.error("PostgreSQL direct connection failed:", err)
      console.log("Falling back to RPC method...")
    }
  }

  try {
    await migrateViaRpc()
  } catch (err) {
    console.error("RPC migration also failed")
    console.log("\nCould not execute SQL automatically. Please run supabase-schema.sql manually in the Supabase SQL Editor.")
    console.log("File location:", schemaPath)
    process.exit(1)
  }
}

migrate()
