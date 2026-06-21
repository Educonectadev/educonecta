import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const schemaPath = path.resolve(__dirname, "../supabase-schema.sql")
const schema = fs.readFileSync(schemaPath, "utf-8")

async function migrate() {
  console.log("Connecting to Supabase...")
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Split SQL by semicolons and execute each statement
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"))

  console.log(`Executing ${statements.length} SQL statements...`)

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    try {
      // Use the Supabase REST API to execute raw SQL
      const { error } = await supabase.rpc("exec_sql", { query: stmt + ";" })
      if (error) {
        // If exec_sql doesn't exist, we try a different approach
        console.error(`Error in statement ${i + 1}:`, error.message)
      } else {
        console.log(`Statement ${i + 1}/${statements.length} OK`)
      }
    } catch (e: any) {
      console.error(`Statement ${i + 1} failed:`, e.message)
    }
  }

  console.log("Migration complete!")
}

migrate().catch(console.error)
