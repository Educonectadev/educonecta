import Link from "next/link"

const roles = [
  { id: "dev", name: "Desarrollador" },
  { id: "director", name: "Director" },
  { id: "docente", name: "Docente" },
  { id: "padre", name: "Padre de Familia" },
  { id: "alumno", name: "Alumno" },
]

export default function RoleLoginButton({ role }: { role: string }) {
  const r = roles.find((r) => r.id === role)

  return (
    <Link
      href="/login"
      className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm mt-3"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
      {r ? `Iniciar sesión como ${r.name}` : "Iniciar sesión"}
    </Link>
  )
}
