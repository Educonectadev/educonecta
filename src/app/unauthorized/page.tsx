import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <h1 className="text-6xl font-bold text-black">401</h1>
      <p className="mt-4 text-xl text-gray-700">Acceso no autorizado</p>
      <p className="mt-2 text-sm text-gray-500">
        No tienes permisos para acceder a esta página.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 rounded-md bg-black dark:bg-white px-6 py-2 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
