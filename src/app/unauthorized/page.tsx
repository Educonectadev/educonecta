import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black px-6">
      <h1 className="text-6xl font-bold text-black dark:text-white">401</h1>
      <p className="mt-4 text-xl text-gray-700 dark:text-zinc-300">Acceso no autorizado</p>
      <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
        No tienes permisos para acceder a esta página.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 rounded-md btn-primary px-6 py-2 text-sm font-medium"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
