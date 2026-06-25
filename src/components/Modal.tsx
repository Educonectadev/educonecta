"use client"

import { Modal as HeroModal } from "@heroui/react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: string
}

const sizeMap: Record<string, string> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "lg",
  "2xl": "full",
  cover: "full",
  full: "full",
}

export default function Modal({ open, onClose, title, children, size = "full" }: ModalProps) {
  return (
    <HeroModal isOpen={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <HeroModal.Backdrop>
        <HeroModal.Container size={(sizeMap[size] || size) as any} scroll="outside">
          <HeroModal.Dialog className="z-[60]">
            <HeroModal.CloseTrigger />
            <HeroModal.Header>
              <HeroModal.Heading>{title}</HeroModal.Heading>
            </HeroModal.Header>
            <HeroModal.Body>
              {children}
            </HeroModal.Body>
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}
