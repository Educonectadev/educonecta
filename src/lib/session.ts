export type UserSession = {
  id: string
  email: string
  name: string
  role: string
  institutionId: number | null
  institutionName: string | null
  teacherId: number | null
  parentId: number | null
  adminId: number | null
  studentId: number | null
}

export type Session = {
  user: UserSession
  expires: string
}
