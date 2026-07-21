"use client"

export default function TeacherError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-8">
      <span className="material-icons text-5xl text-red-400">error_outline</span>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">Error al cargar el panel</h2>
      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md">
        Ocurrió un error inesperado. Intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="btn-primary px-6 py-2.5 rounded-[30px] text-sm font-medium"
      >
        Reintentar
      </button>
    </div>
  )
}
