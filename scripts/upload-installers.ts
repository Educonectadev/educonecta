import { readdirSync, statSync, createReadStream } from "fs"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"

const DIR = join(import.meta.dirname, "..", "private-installers")
const BUCKET = process.env.SUPABASE_INSTALLER_BUCKET || "installers"

const roleMap: Record<string, string> = {
  alumno: "alumno",
  dev: "dev",
  director: "director",
  docente: "docente",
  padre: "padre",
}

function detectRole(filename: string): string | null {
  for (const [key] of Object.entries(roleMap)) {
    if (filename.includes(`-${key}-`) || filename.includes(`-${key}.`)) {
      return key
    }
  }
  return null
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const files = readdirSync(DIR).filter((f) => !f.startsWith("."))

  console.log(`Subiendo ${files.length} archivos a Supabase Storage (bucket: ${BUCKET})...`)

  for (const filename of files) {
    const role = detectRole(filename)
    if (!role) {
      console.warn(`  ⚠ No se pudo detectar el rol para: ${filename}`)
      continue
    }

    const filePath = join(DIR, filename)
    const { size } = statSync(filePath)
    const key = `${role}/${filename}`
    const fileStream = createReadStream(filePath)

    console.log(`  ↻ ${filename} (${(size / 1024 / 1024).toFixed(1)} MB) → ${key}`)

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, fileStream, {
        contentType: "application/octet-stream",
        upsert: true,
        duplex: "half",
      })

    if (error) {
      console.error(`  ✗ Error: ${error.message}`)
    } else {
      console.log(`  ✓ OK`)
    }
  }

  console.log("¡Completado!")
}

main().catch(console.error)
