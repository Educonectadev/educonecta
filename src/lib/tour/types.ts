export type TourRole = "SUPER_ADMIN" | "INSTITUTIONAL_ADMIN" | "TEACHER" | "PARENT" | "STUDENT"

export interface TourStep {
  id: string
  route: string
  selector: string
  title: string
  description: string
  order: number
  role: TourRole[]
  position?: "top" | "bottom" | "left" | "right"
}

export interface TourState {
  isOpen: boolean
  currentIndex: number
  steps: TourStep[]
  completed: boolean
}
