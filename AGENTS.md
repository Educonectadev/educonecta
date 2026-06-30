# EduConecta Design System — Official Reference

El **Super Admin** es la referencia visual oficial. Todos los demás dashboards (Admin, Docente, Padre, Alumno) deben adaptarse a ese mismo nivel de calidad sin modificar ninguna funcionalidad existente.

## Design Tokens (CSS Variables)

Definidos en `src/app/globals.css` líneas 507–545:

| Variable | Uso |
|---|---|
| `--accent` | Sage green (#7b8a78) — CTAs, active states |
| `--accent-soft` | Tono más claro (#8fa08c) |
| `--accent-dim` | Tono más oscuro (#5e6b5b) |
| `--surface` | Fondo de cards (#ffffff / #0e0f10) |
| `--surface-2` | Fondo secundario (#fafaf8 / #16181a) |
| `--surface-3` | Fondo terciario (#f3f3f0 / #1d2023) |
| `--surface-border` | Bordes suaves |
| `--surface-shadow` | Sombra sutil |
| `--surface-shadow-hover` | Sombra hover |
| `--foreground` | Texto principal |
| `--muted-foreground` | Texto secundario |
| `--font-display` | Outfit (Google Font) para títulos |
| `--font-sans` | System-ui stack para body |
| `--radius-card` | 28px |
| `--radius-tile` | 22px |
| `--radius-pill` | 999px |

## Componentes Reutilizables (clases CSS)

Definidos en `src/app/globals.css` líneas 547–710:

- **`sa-surface`** — Card base: background, border, border-radius, shadow, transition
- **`sa-surface-hover`** — Hover: translateY(-2px), shadow elevado
- **`sa-surface-flat`** — Superficie plana con surface-2
- **`sa-glass`** — Efecto glassmorphism con backdrop-blur
- **`sa-btn`** — Botón pill base (border-radius: 999px, padding, font-weight)
- **`sa-btn-primary`** — Botón primary (foreground bg, background text)
- **`sa-btn-ghost`** — Botón ghost (surface-2 bg, border)
- **`sa-btn-outline`** — Botón outline (transparente, border)
- **`sa-tile`** — Mini card KPI (padding, hover lift)
- **`sa-chip`** — Pill tag/badge (border-radius: 999px, font-size: 0.7rem)
- **`sa-divider`** — Separador horizontal (1px, surface-border)
- **`sa-eyebrow`** — Label pequeño sobre títulos (text-[10px] md:text-[11px], tracking-wide, uppercase)
- **`sa-num`** — Número grande para estadísticas (font-bold tracking-tight)
- **`sa-input`** — Input genérico (rounded-2xl, border, padding)

## Patrones de UI

### Header de página
```
sa-eyebrow + h1 (font-bold tracking-tight, font-display) + p (muted-foreground)
```

### Stat Cards (métricas)
```
sa-tile con icono en círculo (surface-2, border), sa-eyebrow, sa-num text-3xl
```

### Badges de estado
```
sa-chip con color/bg dinámicos:
  - Activo:   color: var(--accent), bg: color-mix(in srgb, var(--accent) 14%, transparent)
  - Inactivo: color: var(--muted-foreground), bg: var(--surface-3)
  - Alerta:   color: #d97706, bg: rgba(217, 119, 6, 0.14)
  - Error:    color: #ef4444, bg: rgba(239, 68, 68, 0.12)
```

### Acciones por fila (icon buttons)
```
Iconos circulares con hover reveal:
  - Editar:   getIcon("edit", ...)
  - Eliminar: getIcon("trash", ...) con hover rojo
  - Ver:      getIcon("eye", ...)
  - Activar:  getIcon("check", ...) con hover accent
  - Suspender: getIcon("power", ...) con hover rojo
```

### Empty State
```
sa-surface py-14 md:py-16 text-center
  + icono en w-14 h-14 rounded-2xl (surface-3 bg)
  + título "text-sm font-medium"
  + descripción "text-xs max-w-xs mx-auto" (muted-foreground)
  + botón CTA opcional
```

### Micro-animaciones (framer-motion)
```
- Cards/filas: initial={{ opacity: 0, y: 10-16 }}, animate={{ opacity: 1, y: 0 }}
- Transición: duration: 0.35-0.5, ease: [0.16, 1, 0.3, 1]
- Hover lift: translateY(-2px) en onMouseEnter
- Botones: whileTap={{ scale: 0.97 }}
- Icon buttons: whileTap={{ scale: 0.9 }}
- Stagger: delay: idx * 0.02-0.025
- Layout: AnimatePresence mode="popLayout"
```

### Formularios
```
- sa-input para inputs/textareas
- sa-btn-primary para submit
- sa-btn-ghost para cancelar
- Labels: text-[11px] font-medium, muted-foreground
- Espaciado: space-y-4/5 entre campos
```

### DataTable
```
Componente: src/components/DataTable.tsx
- HeroUI Table con ScrollContainer
- Columnas con render personalizado
- onEdit/onDelete para acciones
- sortable con SortDescriptor
- Empty state integrado
```

### Modal
```
Componente: src/components/Modal.tsx
- HeroUI Modal con backdrop blur
- Props: open, onClose, title, size, children
- Formularios dentro con space-y-4
- Botones: sa-btn-primary + sa-btn-ghost
```

### Select
```
Componente: src/components/Select.tsx
- Headless UI Listbox
- sa-input style en el trigger
- Opciones con rounded-[10px], selected state
```

## Iconos

Usar `getIcon(name, options)` desde `@/components/premium/iconRegistry` (lucide-react).

Nombres comunes: `building`, `users`, `school`, `credit_card`, `wallet`, `inbox`, `search`, `plus`, `edit`, `trash`, `eye`, `check`, `x`, `power`, `refresh`, `rocket`, `history`, `clock`, `settings`, `bell`, `calendar`, `chat`, `arrow_right`, `arrow_up_right`, `more`, `filter`, `download`, `external`, `layers`, `trending`, `spark`, `zap`, `shield`, `lock`, `globe`, `map`, `tag`, `percent`, `crown`, `pulse`.

## Layout (todos los dashboards)
```
<div className="space-y-5 md:space-y-6 pt-3 md:pt-6">
  <header>...</header>
  <section>...</section>
</div>
```

## Qué NO hacer
- No cambiar lógica, endpoints, validaciones ni funcionamiento
- No modificar backend
- No crear componentes nuevos si ya existen en Super Admin
- No mezclar estilos antiguos con nuevos
- No usar clases inline no compatibles con el design system
- No usar componentes premium antiguos (NeonCard, IconTile, etc.)
