import BrandColorPicker from "@/components/BrandColorPicker"
import NotificationsToggle from "./NotificationsToggle"
import AccountInfo from "./AccountInfo"

interface SettingsPageProps {
  title?: string
  subtitle?: string
  showBrandColor?: boolean
  userName: string
  userEmail: string
  userRoleLabel: string
  accent: string
}

export default function SettingsPage({
  title = "Configuración",
  subtitle = "Personaliza tu cuenta y la apariencia de la aplicación",
  showBrandColor = true,
  userName,
  userEmail,
  userRoleLabel,
  accent,
}: SettingsPageProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className={`text-xs font-semibold uppercase tracking-widest ${accent} mb-3`}>Notificaciones</h2>
        <NotificationsToggle />
      </section>

      <section className="mb-8">
        <h2 className={`text-xs font-semibold uppercase tracking-widest ${accent} mb-3`}>Mi cuenta</h2>
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[25px] p-6">
          <AccountInfo name={userName} email={userEmail} roleLabel={userRoleLabel} />
        </div>
      </section>

      {showBrandColor && (
        <section className="mb-8">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[25px] p-6">
            <BrandColorPicker />
          </div>
        </section>
      )}
    </div>
  )
}