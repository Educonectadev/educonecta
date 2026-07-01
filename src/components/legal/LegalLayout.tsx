import ProgressiveBlur from "./ProgressiveBlur"

type LegalLayoutProps = {
  children: React.ReactNode
}

const LegalLayout = ({ children }: LegalLayoutProps) => {
  return (
    <div className="legal-container relative flex min-h-screen w-full flex-col items-center justify-center bg-[#f5f4f3] dark:bg-[#121212] text-black/40">
      <ProgressiveBlur position="top" />
      <ProgressiveBlur position="bottom" />
      <div className="flex h-screen w-full flex-col items-center overflow-y-auto">
        {children}
      </div>
      <style>{`
        .legal-container { --legal-bg: #f5f4f3; }
        .dark .legal-container { --legal-bg: #121212; }
      `}</style>
    </div>
  )
}

export default LegalLayout
