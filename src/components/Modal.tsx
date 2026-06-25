"use client"

import { Modal as HeroModal } from "@heroui/react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: string
  scroll?: "inside" | "outside"
}

const sizeMap: Record<string, string> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "lg",
  "2xl": "cover",
  cover: "cover",
  full: "full",
}

export default function Modal({ open, onClose, title, children, size = "cover", scroll = "outside" }: ModalProps) {
  return (
    <HeroModal isOpen={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <HeroModal.Backdrop>
        <HeroModal.Container size={(sizeMap[size] || size) as any} scroll={scroll} style={{ overflowX: "hidden" }}>
          <HeroModal.Dialog className="z-[60]" style={{ overflowX: "hidden" }}>
            <HeroModal.CloseTrigger />
            <HeroModal.Header>
              <HeroModal.Heading>{title}</HeroModal.Heading>
            </HeroModal.Header>
            <HeroModal.Body className="overflow-x-hidden">
              {children}
            </HeroModal.Body>
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}
