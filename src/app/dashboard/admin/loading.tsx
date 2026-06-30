import { Label, ProgressBar } from "@heroui/react"

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ProgressBar isIndeterminate aria-label="Loading..." className="w-64 max-w-full">
        <Label className="text-sm" style={{ color: "var(--muted-foreground)" }}>Cargando...</Label>
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  )
}
