import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSupabaseAdmin } from "./supabase"

// ──────────────────────────────────────────
// File upload (Supabase Storage)
// ──────────────────────────────────────────

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

export async function deleteFile(p: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .storage
    .from(BUCKET)
    .remove([p])

  if (error) throw new Error(`Storage delete failed: ${error.message}`)
}

export async function getFileUrl(p: string, expiresIn = 3600): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .storage
    .from(BUCKET)
    .createSignedUrl(p, expiresIn)

  return data?.signedUrl || null
}

// ──────────────────────────────────────────
// Installer storage (local / S3)
// ──────────────────────────────────────────

export type InstallerPlatform = "win" | "linux" | "mac"

export type InstallerResult = {
  buffer: Buffer
  filename: string
  contentType: string
} | null

const platformExtensions: Record<InstallerPlatform, string> = {
  win: "-setup.exe",
  linux: ".deb",
  mac: ".dmg",
}

const contentTypes: Record<string, string> = {
  exe: "application/vnd.microsoft.portable-executable",
  deb: "application/vnd.debian.binary-package",
  dmg: "application/x-apple-diskimage",
}

const roleToElectron: Record<string, string> = {
  SUPER_ADMIN: "dev",
  INSTITUTIONAL_ADMIN: "director",
  TEACHER: "docente",
  PARENT: "padre",
  STUDENT: "alumno",
}

export function getElectronRole(dashboardRole: string): string | null {
  return roleToElectron[dashboardRole] ?? null
}

export function detectPlatform(userAgent: string): InstallerPlatform {
  if (userAgent.includes("Windows")) return "win"
  if (userAgent.includes("Mac OS") || userAgent.includes("iPad") || userAgent.includes("iPhone")) return "mac"
  if (userAgent.includes("Android")) return "win"
  if (userAgent.includes("Mac")) return "mac"
  return "linux"
}

export function getInstallerFilename(electronRole: string, platform: InstallerPlatform): string {
  const ext = platformExtensions[platform]
  return `educonecta-${electronRole}${ext}`
}

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.replace("-setup", "") ?? ""
  return contentTypes[ext] || "application/octet-stream"
}

export interface InstallerStorage {
  getInstaller(electronRole: string, platform: InstallerPlatform): Promise<InstallerResult>
}

class LocalInstallerStorage implements InstallerStorage {
  private dir: string

  constructor(dir: string) {
    this.dir = dir
  }

  async getInstaller(electronRole: string, platform: InstallerPlatform): Promise<InstallerResult> {
    const filename = getInstallerFilename(electronRole, platform)
    const filePath = path.join(this.dir, filename)

    if (!existsSync(filePath)) return null

    const buffer = await readFile(filePath)
    return { buffer, filename, contentType: getContentType(filename) }
  }
}

class S3InstallerStorage implements InstallerStorage {
  private client: S3Client
  private bucket: string

  constructor() {
    const endpoint = process.env.S3_ENDPOINT
    if (!endpoint) throw new Error("S3_ENDPOINT env var is required for S3 storage")

    this.bucket = process.env.S3_BUCKET || "educonecta-installers"

    this.client = new S3Client({
      endpoint,
      region: process.env.S3_REGION || "auto",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
      forcePathStyle: true,
    })
  }

  async getInstaller(electronRole: string, platform: InstallerPlatform): Promise<InstallerResult> {
    const filename = getInstallerFilename(electronRole, platform)

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: filename,
        }),
      )

      if (!response.Body) return null

      const bytes = await response.Body.transformToByteArray()
      const buffer = Buffer.from(bytes)

      return {
        buffer,
        filename,
        contentType: getContentType(filename),
      }
    } catch {
      return null
    }
  }
}

let storageInstance: InstallerStorage | null = null

export function getInstallerStorage(): InstallerStorage {
  if (!storageInstance) {
    const provider = process.env.INSTALLER_STORAGE_PROVIDER || "local"

    switch (provider) {
      case "s3":
        storageInstance = new S3InstallerStorage()
        break
      case "local":
      default:
        const dir = process.env.INSTALLERS_DIR || path.join(process.cwd(), "private-installers")
        storageInstance = new LocalInstallerStorage(dir)
        break
    }
  }
  return storageInstance
}
