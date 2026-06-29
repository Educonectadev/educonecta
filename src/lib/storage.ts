import { getSupabaseAdmin } from "./supabase"

const BUCKET = "institution-files"

export type UploadedFile = {
  path: string
  url: string
  name: string
  size: number
  mimeType: string
}

export async function uploadFile(
  institutionId: number,
  file: File | Buffer,
  fileName: string,
  mimeType: string,
): Promise<UploadedFile> {
  const ext = fileName.split(".").pop() || "bin"
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = `${institutionId}/${uniqueName}`

  const { data, error } = await getSupabaseAdmin()
    .storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data: urlData } = await getSupabaseAdmin()
    .storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600 * 24 * 7)

  return {
    path: data.path,
    url: urlData?.signedUrl || "",
    name: fileName,
    size: file instanceof File ? file.size : Buffer.byteLength(file as Buffer),
    mimeType,
  }
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .storage
    .from(BUCKET)
    .remove([path])

  if (error) throw new Error(`Storage delete failed: ${error.message}`)
}

export async function getFileUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn)

  return data?.signedUrl || null
}

export async function listFiles(
  institutionId: number,
  folder?: string,
): Promise<{ name: string; url: string | null }[]> {
  const prefix = folder ? `${institutionId}/${folder}` : `${institutionId}/`
  const { data, error } = await getSupabaseAdmin()
    .storage
    .from(BUCKET)
    .list(prefix)

  if (error) throw new Error(`Storage list failed: ${error.message}`)

  return Promise.all(
    data.map(async (item) => ({
      name: item.name,
      url: await getFileUrl(`${prefix}${item.name}`),
    })),
  )
}
