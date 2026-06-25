// Force all dashboard routes to be dynamically rendered at request time.
// They all use cookies() via getServerSession() and cannot be statically prerendered.
export const dynamic = "force-dynamic"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
