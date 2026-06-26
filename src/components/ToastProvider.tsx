"use client"

import { Toast } from "@heroui/react"

export default function ToastProvider() {
  return (
    <Toast.Provider
      placement="top"
      width={420}
      maxVisibleToasts={3}
      gap={8}
    />
  )
}
