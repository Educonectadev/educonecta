import ProgressiveBlur from "./ProgressiveBlur"

type LegalLayoutProps = {
  children: React.ReactNode
}

const LegalLayout = ({ children }: LegalLayoutProps) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#f5f4f3] dark:bg-[#121212] text-black/40">
      <ProgressiveBlur position="top" />
      <ProgressiveBlur position="bottom" />
      <div className="flex h-screen w-full flex-col items-center overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default LegalLayout
