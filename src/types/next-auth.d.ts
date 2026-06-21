import "next-auth"

declare module "next-auth" {
  interface User {
    role: string
    institutionId?: number | null
    institutionName?: string | null
    teacherId?: number | null
    parentId?: number | null
    adminId?: number | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      institutionId: number | null
      institutionName: string | null
      teacherId: number | null
      parentId: number | null
      adminId: number | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    institutionId: number | null
    institutionName: string | null
    teacherId: number | null
    parentId: number | null
    adminId: number | null
  }
}
