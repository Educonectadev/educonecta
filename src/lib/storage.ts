import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

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

let storageInstance: InstallerStorage | null = null

export function getInstallerStorage(): InstallerStorage {
  if (!storageInstance) {
    const provider = process.env.INSTALLER_STORAGE_PROVIDER || "local"

    switch (provider) {
      case "local":
      default:
        const dir = process.env.INSTALLERS_DIR || path.join(process.cwd(), "private-installers")
        storageInstance = new LocalInstallerStorage(dir)
        break
    }
  }
  return storageInstance
}
