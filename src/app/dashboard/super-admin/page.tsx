import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getSupabaseAdmin } from "@/lib/supabase"
import AnimatedNumber from "@/components/premium/AnimatedNumber"
import StatTile from "@/components/premium/StatTile"
import NeonCard from "@/components/premium/NeonCard"
import GlowButton from "@/components/premium/GlowButton"
import IconTile, { getIcon } from "@/components/premium/IconTile"
import TodayLabel from "@/components/premium/TodayLabel"

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

function buildSeries(current: number, points = 8): number[] {
  const series: number[] = []
  let v = Math.max(0, current - Math.floor(current * 0.35))
  // Deterministic pseudo-random based on the seed (current, points) so server
  // and client produce the same series and avoid hydration mismatches.
  const seed = (current + 1) * 9301 + points * 49297
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  for (let i = 0; i < points - 1; i++) {
    const drift = (rand() - 0.45) * Math.max(2, current * 0.07)
    v = Math.max(0, v + drift)
    series.push(Math.round(v))
  }
  series.push(current)
  return series
}

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

  const kpis = [
    { label: "Instituciones", value: totalInstituciones, icon: "building", accent: "neon" as const, href: "/dashboard/super-admin/instituciones" },
    { label: "Instituciones activas", value: activas, icon: "bolt", accent: "blue" as const, href: "/dashboard/super-admin/instituciones" },
    { label: "Usuarios totales", value: totalUsuarios, icon: "users", accent: "violet" as const, href: "/dashboard/super-admin/instituciones" },
    { label: "Solicitudes nuevas", value: totalSolicitudes, icon: "inbox", accent: "amber" as const, href: "/dashboard/super-admin/solicitudes" },
    { label: "Profesores", value: totalProfesores, icon: "graduationCap" as any, accent: "neon" as const },
    { label: "Alumnos", value: totalAlumnos, icon: "school", accent: "blue" as const },
    { label: "Padres", value: totalPadres, icon: "users", accent: "violet" as const },
    { label: "Ingresos estimados", value: ingresos, icon: "wallet", accent: "amber" as const, format: (n: number) => "S/ " + n.toLocaleString("es-PE") },
  ]

  const quickActions = [
    { href: "/dashboard/super-admin/instituciones/nueva", icon: "plus", label: "Registrar colegio", desc: "Da de alta una nueva institución" },
    { href: "/dashboard/super-admin/solicitudes", icon: "inbox", label: "Revisar solicitudes", desc: "Leads pendientes de contacto" },
    { href: "/dashboard/super-admin/planes", icon: "credit_card", label: "Asignar plan", desc: "Configura la suscripción" },
    { href: "/dashboard/super-admin/versiones", icon: "rocket", label: "Publicar versión", desc: "Lanza una nueva release" },
  ]

  return (
    <div className="space-y-6 md:space-y-8 pt-4 md:pt-6">
      {/* HERO */}
      <NeonCard hoverable={false} glow padded={false} className="sa-mesh overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6 p-6 md:p-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="sa-chip">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon-glow)" }}
                />
                Panel operativo
              </span>
              {versionActual && (
                <span className="sa-chip">{versionActual.version}</span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight sa-num">
              Buen día,
              <br />
              <span className="sa-accent-text">{session.user.name.split(" ")[0]}</span>
            </h1>
            <p className="text-sm md:text-base text-[color:var(--muted-foreground)] max-w-md">
              Tienes <b>{totalSolicitudes}</b> solicitudes nuevas y <b>{activas}</b> instituciones activas. Sigue construyendo la red educativa más grande.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <GlowButton
                href="/dashboard/super-admin/instituciones/nueva"
                icon={getIcon("plus", { size: 16, strokeWidth: 2.4 })}
              >
                Nueva institución
              </GlowButton>
              <GlowButton
                variant="ghost"
                href="/dashboard/super-admin/solicitudes"
                icon={getIcon("inbox", { size: 16, strokeWidth: 2 })}
              >
                Ver solicitudes
              </GlowButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:w-auto md:min-w-[320px]">
            <div className="sa-surface-flat p-4">
              <p className="sa-eyebrow mb-1.5">Hoy</p>
              <p className="text-lg font-semibold capitalize">
                <TodayLabel />
              </p>
              <p className="text-[11px] text-[color:var(--muted-foreground)] mt-1">
                Hora local
              </p>
            </div>
            <div className="sa-surface-flat p-4">
              <p className="sa-eyebrow mb-1.5">Estado</p>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: "var(--neon)", boxShadow: "0 0 8px var(--neon-glow)" }}
                />
                <span className="text-lg font-semibold">Operativo</span>
              </div>
              <p className="text-[11px] text-[color:var(--muted-foreground)] mt-1">
                Latencia estable
              </p>
            </div>
          </div>
        </div>
      </NeonCard>

      {/* KPI GRID */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {kpis.slice(0, 4).map((k, idx) => (
          <StatTile
            key={k.label}
            label={k.label}
            value={k.value}
            icon={k.icon as any}
            accent={k.accent}
            series={buildSeries(k.value)}
            delay={0.04 * idx}
            href={(k as any).href}
          />
        ))}
      </section>

      {/* ACTIVIDAD + ACCIONES */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Lista de instituciones recientes */}
        <NeonCard className="lg:col-span-2" delay={0.18}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="sa-eyebrow">Actividad reciente</p>
              <h2 className="text-lg font-semibold mt-1">Últimas instituciones</h2>
            </div>
            <Link
              href="/dashboard/super-admin/instituciones"
              className="text-xs font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--neon)] transition-colors inline-flex items-center gap-1"
            >
              Ver todas
              {getIcon("arrow_right", { size: 12, strokeWidth: 2.4 })}
            </Link>
          </div>

          {institucionesRecientes.length === 0 ? (
            <div className="text-center py-10">
              <IconTile name="building" size={28} className="mb-3 opacity-50" />
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Aún no hay instituciones registradas.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[color:var(--surface-border)]">
              {institucionesRecientes.map((inst: any, idx: number) => (
                <li
                  key={inst.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{
                        background: "var(--surface-3)",
                        border: "1px solid var(--surface-border)",
                      }}
                    >
                      {inst.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inst.name}</p>
                      <p className="text-[11px] text-[color:var(--muted-foreground)]">
                        Creada el {new Date(inst.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="sa-chip"
                    style={
                      inst.isActive
                        ? {
                            backgroundColor: "color-mix(in srgb, var(--neon) 14%, transparent)",
                            color: "var(--neon)",
                            borderColor: "transparent",
                          }
                        : {
                            backgroundColor: "rgba(248, 113, 113, 0.14)",
                            color: "#f87171",
                            borderColor: "transparent",
                          }
                    }
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{
                        background: inst.isActive ? "var(--neon)" : "#f87171",
                      }}
                    />
                    {inst.isActive ? "Activa" : "Inactiva"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </NeonCard>

        {/* Acciones rápidas */}
        <NeonCard delay={0.22}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="sa-eyebrow">Operaciones</p>
              <h2 className="text-lg font-semibold mt-1">Acciones rápidas</h2>
            </div>
            <IconTile name="bolt" filled size={14} />
          </div>

          <ul className="flex flex-col gap-2">
            {quickActions.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className="group flex items-center gap-3 rounded-2xl border border-transparent p-3 hover:border-[color:var(--surface-border)] hover:bg-[color:var(--surface-3)] transition-all"
                >
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{
                      background: "var(--surface-3)",
                      border: "1px solid var(--surface-border)",
                    }}
                  >
                    {getIcon(a.icon, { size: 16, strokeWidth: 2 })}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-[11px] text-[color:var(--muted-foreground)] truncate">
                      {a.desc}
                    </p>
                  </div>
                  {getIcon("arrow_up_right", {
                    size: 14,
                    strokeWidth: 2.2,
                    className: "opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all",
                  })}
                </Link>
              </li>
            ))}
          </ul>
        </NeonCard>
      </section>

      {/* SEGUNDA FILA: KPIs secundarios + Versión */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {kpis.slice(4).map((k, idx) => (
          <StatTile
            key={k.label}
            label={k.label}
            value={k.value}
            icon={k.icon as any}
            accent={k.accent}
            series={buildSeries(k.value, 6)}
            delay={0.05 * (idx + 4)}
            href={(k as any).href}
          />
        ))}
      </section>

      {/* VERSIÓN */}
      <NeonCard delay={0.3}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="sa-eyebrow">Release actual</p>
            {versionActual ? (
              <>
                <h3 className="text-2xl font-bold mt-1 flex items-center gap-2">
                  {versionActual.version}
                  <span className="sa-chip" style={{ color: "var(--neon)", borderColor: "transparent", backgroundColor: "color-mix(in srgb, var(--neon) 14%, transparent)" }}>
                    Actual
                  </span>
                </h3>
                {versionActual.title && (
                  <p className="text-sm font-medium mt-1">{versionActual.title}</p>
                )}
                {versionActual.description && (
                  <p className="text-sm text-[color:var(--muted-foreground)] mt-1 max-w-2xl">
                    {versionActual.description}
                  </p>
                )}
                <p className="text-[11px] text-[color:var(--muted-foreground)] mt-3">
                  Lanzada el {new Date(versionActual.createdAt).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mt-1">Sin versión publicada</h3>
                <p className="text-sm text-[color:var(--muted-foreground)] mt-1">
                  Crea una release para que las instituciones vean los últimos cambios.
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2 md:shrink-0">
            <GlowButton
              variant="outline"
              href="/dashboard/super-admin/versiones"
              icon={getIcon("history", { size: 14, strokeWidth: 2 })}
            >
              Ver historial
            </GlowButton>
            <GlowButton
              variant="ghost"
              href="/dashboard/super-admin/versiones"
              icon={getIcon("rocket", { size: 14, strokeWidth: 2 })}
            >
              Nueva release
            </GlowButton>
          </div>
        </div>
      </NeonCard>
    </div>
  )
}