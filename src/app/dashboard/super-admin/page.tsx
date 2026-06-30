import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getSupabaseAdmin } from "@/lib/supabase"
import AnimatedNumber from "@/components/premium/AnimatedNumber"
import TodayLabel from "@/components/premium/TodayLabel"
import GreetingLabel from "@/components/premium/GreetingLabel"
import { getIcon } from "@/components/premium/iconRegistry"

async function supabaseCount(table: string, match?: Record<string, unknown>): Promise<number> {
  const admin = getSupabaseAdmin()
  let query = admin.from(table).select("id", { count: "exact", head: true })
  if (match) {
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key.toLowerCase(), value)
    }
  }
  const { count, error } = await query
  if (error) return 0
  return count ?? 0
}

export const dynamic = "force-dynamic"

export default async function SuperAdminDashboardPage() {
  const session = await getServerSession()
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login")

  const supabase = getSupabaseAdmin()

  const [totalInstituciones, totalUsuarios, activas, totalProfesores, totalAlumnos, totalPadres, versiones, recientes] = await Promise.all([
    supabaseCount("Institution"),
    supabaseCount("User"),
    supabaseCount("Institution", { isActive: true }),
    supabaseCount("Teacher"),
    supabaseCount("Student"),
    supabaseCount("Parent"),
    supabase.from("Version").select("*").eq("isCurrent", true).maybeSingle(),
    supabase.from("Institution").select("id, name, isActive, createdAt").order("createdAt", { ascending: false }).limit(6),
  ])

  const versionActual = versiones.data
  const institucionesRecientes = recientes.data ?? []
  const totalSolicitudes = await supabaseCount("Lead", { status: "NUEVO" })
  const ingresos = activas * 120

  const stats = [
    { label: "Instituciones", value: totalInstituciones, icon: "building", href: "/dashboard/super-admin/instituciones" },
    { label: "Activas", value: activas, icon: "bolt", href: "/dashboard/super-admin/instituciones" },
    { label: "Usuarios", value: totalUsuarios, icon: "users", href: "/dashboard/super-admin/instituciones" },
    { label: "Solicitudes", value: totalSolicitudes, icon: "inbox", href: "/dashboard/super-admin/solicitudes" },
    { label: "Profesores", value: totalProfesores, icon: "school" },
    { label: "Alumnos", value: totalAlumnos, icon: "users" },
    { label: "Padres", value: totalPadres, icon: "users" },
    { label: "Ingresos est.", value: ingresos, icon: "wallet", format: (n: number) => "S/ " + n.toLocaleString("es-PE") },
  ]

  const initials = (session.user.name || "S")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const quickActions = [
    { href: "/dashboard/super-admin/instituciones/nueva", icon: "plus", label: "Registrar colegio" },
    { href: "/dashboard/super-admin/solicitudes", icon: "inbox", label: "Revisar solicitudes" },
    { href: "/dashboard/super-admin/planes", icon: "credit_card", label: "Asignar plan" },
    { href: "/dashboard/super-admin/versiones", icon: "rocket", label: "Publicar versión" },
  ]

  return (
    <div className="space-y-8 md:space-y-10 pt-4 md:pt-8 pb-10">
      {/* HERO */}
      <section className="sa-hero overflow-hidden rounded-[28px] border p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-semibold text-lg md:text-xl shrink-0"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--surface-border)",
              }}
              aria-hidden
            >
              {initials}
            </div>
            <div>
              <p className="sa-eyebrow mb-1">
                <GreetingLabel />, <TodayLabel />
              </p>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight sa-num">
                {session.user.name.split(" ")[0]}
              </h1>
              <p className="mt-2 text-sm md:text-base max-w-xl" style={{ color: "var(--muted-foreground)" }}>
                Aquí tienes un resumen del estado de toda la plataforma.
                Tienes <b style={{ color: "var(--foreground)" }}>{totalSolicitudes}</b> solicitudes nuevas y <b style={{ color: "var(--foreground)" }}>{activas}</b> instituciones activas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/super-admin/instituciones/nueva"
              className="sa-btn sa-btn-primary"
            >
              {getIcon("plus", { size: 16, strokeWidth: 2.2 })}
              <span>Nueva institución</span>
            </Link>
            <Link
              href="/dashboard/super-admin/solicitudes"
              className="sa-btn sa-btn-outline"
            >
              {getIcon("inbox", { size: 16, strokeWidth: 2 })}
              <span>Ver solicitudes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS GRID */}
      <section>
        <p className="sa-eyebrow mb-3">Resumen general</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s) => {
            const val =
              "format" in s && typeof s.format === "function" ? s.format(s.value) : s.value
            const Inner = (
              <div className="sa-tile group cursor-default">
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="inline-flex items-center justify-center rounded-full"
                    style={{
                      width: 30,
                      height: 30,
                      background: "var(--surface-2)",
                      border: "1px solid var(--surface-border)",
                    }}
                  >
                    {getIcon(s.icon as string, { size: 14, strokeWidth: 2 })}
                  </span>
                </div>
                <p className="sa-eyebrow">{s.label}</p>
                <p className="sa-num text-3xl mt-1.5">
                  {typeof val === "number" ? <AnimatedNumber value={val} /> : val}
                </p>
              </div>
            )
            return "href" in s ? (
              <Link key={s.label} href={s.href as string} className="block">
                {Inner}
              </Link>
            ) : (
              <div key={s.label}>{Inner}</div>
            )
          })}
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section>
        <p className="sa-eyebrow mb-3">Accesos rápidos</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="sa-surface sa-surface-hover p-4 flex items-center gap-3 group"
            >
              <span
                className="inline-flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 30,
                  height: 30,
                  background: "var(--surface-2)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                {getIcon(a.icon, { size: 14, strokeWidth: 2 })}
              </span>
              <span className="text-sm font-medium">{a.label}</span>
              <span className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity">
                {getIcon("arrow_up_right", { size: 14, strokeWidth: 2.2 })}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ACTIVIDAD + ESTADO */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="sa-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="sa-eyebrow">Actividad reciente</p>
              <h2 className="text-lg font-semibold mt-1">Últimas instituciones</h2>
            </div>
            <Link
              href="/dashboard/super-admin/instituciones"
              className="text-xs font-medium hover:underline inline-flex items-center gap-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Ver todas
              {getIcon("arrow_right", { size: 12, strokeWidth: 2.4 })}
            </Link>
          </div>

          {institucionesRecientes.length === 0 ? (
            <div className="text-center py-10">
              <span
                className="inline-flex items-center justify-center rounded-full mb-3 opacity-50"
                style={{
                  width: 42,
                  height: 42,
                  background: "var(--surface-2)",
                  border: "1px solid var(--surface-border)",
                }}
              >
                {getIcon("building", { size: 18, strokeWidth: 1.6 })}
              </span>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Aún no hay instituciones registradas.
              </p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--surface-border)" }}>
              {institucionesRecientes.map((inst: any) => (
                <li
                  key={inst.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--surface-border)",
                      }}
                    >
                      {inst.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inst.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                        Creada el{" "}
                        {new Date(inst.createdAt).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="sa-chip"
                    style={
                      inst.isActive
                        ? {
                            color: "var(--accent)",
                            borderColor: "transparent",
                            backgroundColor:
                              "color-mix(in srgb, var(--accent) 16%, transparent)",
                          }
                        : {
                            color: "#9aa39a",
                            borderColor: "transparent",
                            backgroundColor: "var(--surface-2)",
                          }
                    }
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{
                        background: inst.isActive ? "var(--accent)" : "#9aa39a",
                      }}
                    />
                    {inst.isActive ? "Activa" : "Inactiva"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sa-surface p-6">
          <p className="sa-eyebrow">Sistema</p>
          <h2 className="text-lg font-semibold mt-1 mb-4">Estado general</h2>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span style={{ color: "var(--muted-foreground)" }}>Versión actual</span>
              <span className="font-medium">{versionActual?.version ?? "—"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span style={{ color: "var(--muted-foreground)" }}>Solicitudes abiertas</span>
              <span className="font-medium">{totalSolicitudes}</span>
            </li>
            <li className="flex items-center justify-between">
              <span style={{ color: "var(--muted-foreground)" }}>Instituciones activas</span>
              <span className="font-medium">{activas} / {totalInstituciones}</span>
            </li>
            <li className="flex items-center justify-between">
              <span style={{ color: "var(--muted-foreground)" }}>Usuarios totales</span>
              <span className="font-medium">{totalUsuarios}</span>
            </li>
            <li className="flex items-center justify-between">
              <span style={{ color: "var(--muted-foreground)" }}>Ingresos estimados</span>
              <span className="font-medium">S/ {ingresos.toLocaleString("es-PE")}</span>
            </li>
          </ul>

          <div className="sa-divider my-4" />

          <div className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span className="font-medium">Operativo</span>
            <span className="ml-auto text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              Plataforma en línea
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}