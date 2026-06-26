interface AccountInfoProps {
  name: string
  email: string
  roleLabel: string
}

export default function AccountInfo({ name, email, roleLabel }: AccountInfoProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
        Información de la cuenta
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 dark:text-zinc-500">Nombre</p>
          <p className="font-medium text-gray-900 dark:text-white">{name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-zinc-500">Email</p>
          <p className="font-medium text-gray-900 dark:text-white break-all">{email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-zinc-500">Rol</p>
          <p className="font-medium text-gray-900 dark:text-white">{roleLabel}</p>
        </div>
      </div>
    </div>
  )
}