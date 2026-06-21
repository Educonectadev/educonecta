"use client"
import type { ReactNode } from "react"

function Mi({ name, size = 20 }: { name: string; size?: number }) {
  return <span className="material-icons" style={{ fontSize: size }}>{name}</span>
}

export const icons: Record<string, ReactNode> = {
  dashboard: <Mi name="dashboard" />,
  home: <Mi name="home" />,
  school: <Mi name="school" />,
  badge: <Mi name="verified_user" />,
  group: <Mi name="group" />,
  menu_book: <Mi name="menu_book" />,
  layers: <Mi name="layers" />,
  calendar_month: <Mi name="calendar_month" />,
  fact_check: <Mi name="fact_check" />,
  assignment: <Mi name="assignment" />,
  star: <Mi name="star" />,
  grade: <Mi name="star" />,
  gavel: <Mi name="gavel" />,
  mail: <Mi name="mail" />,
  notifications: <Mi name="notifications" />,
  account_balance: <Mi name="account_balance" />,
  students: <Mi name="people" />,
  teachers: <Mi name="school" />,
  parents: <Mi name="supervisor_account" />,
  courses: <Mi name="book" />,
  institution: <Mi name="business" />,
  attendance: <Mi name="how_to_reg" />,
  tasks: <Mi name="checklist" />,
  grades: <Mi name="bar_chart" />,
  messages: <Mi name="chat" />,
}
