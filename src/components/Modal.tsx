"use client"

import { Modal as HeroModal } from "@heroui/react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: string
  scroll?: "inside" | "outside"
  dialogClassName?: string
  bodyClassName?: string
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

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "cover",
  scroll = "outside",
  dialogClassName,
  bodyClassName,
}: ModalProps) {
  return (
    <HeroModal isOpen={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <HeroModal.Backdrop className="modal__backdrop--blur">
        <HeroModal.Container size={(sizeMap[size] || size) as any} scroll={scroll} className="overflow-x-hidden">
          <HeroModal.Dialog className={`z-[60] overflow-x-hidden ${dialogClassName ?? ""}`}>
            <HeroModal.CloseTrigger />
            <HeroModal.Header>
              <HeroModal.Heading>{title}</HeroModal.Heading>
            </HeroModal.Header>
            <HeroModal.Body className={`overflow-x-hidden ${bodyClassName ?? ""}`}>
              {children}
            </HeroModal.Body>
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}
