import { registerTourSteps } from "@/lib/tour"

registerTourSteps([
  {
    id: "dashboard-home",
    route: "/dashboard",
    selector: "[data-tour='dashboard']",
    title: "Panel principal",
    description:
      "Este es tu panel de control. Desde aquí puedes ver un resumen de toda la actividad del colegio: estudiantes, docentes, cursos y horarios. Úsalo al iniciar tu jornada para tener una visión general del estado de tu institución.",
    order: 1,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT", "SUPER_ADMIN"],
  },
  {
    id: "sidebar-nav",
    route: "/dashboard",
    selector: "[data-tour='sidebar']",
    title: "Menú de navegación",
    description:
      "A la izquierda encontrarás el menú lateral con acceso a todas las secciones del sistema. Cada módulo tiene un icono distintivo. Haz clic en cualquier opción para desplazarte rápidamente entre las funcionalidades.",
    order: 2,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT", "SUPER_ADMIN"],
  },
  {
    id: "bottom-nav",
    route: "/dashboard",
    selector: "[data-tour='bottom-nav']",
    title: "Navegación móvil",
    description:
      "En dispositivos móviles, usa la barra inferior para acceder a las opciones principales. Si hay más opciones disponibles, verás un botón '+' que despliega un menú adicional. Todo está diseñado para que puedas usar la plataforma desde cualquier dispositivo.",
    order: 3,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT", "SUPER_ADMIN"],
  },
  {
    id: "theme-toggle",
    route: "/dashboard",
    selector: "[data-tour='theme-toggle']",
    title: "Modo oscuro / claro",
    description:
      "Puedes alternar entre modo claro y oscuro con este botón. Elige el que te resulte más cómodo para trabajar. La preferencia se guarda automáticamente para tu próxima visita.",
    order: 4,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT", "SUPER_ADMIN"],
  },
  {
    id: "user-menu",
    route: "/dashboard",
    selector: "[data-tour='user-menu']",
    title: "Tu perfil y sesión",
    description:
      "Aquí puedes ver tu nombre, tu rol dentro del sistema y acceder a tu perfil. Desde este menú también puedes cerrar sesión cuando termines de trabajar. Recuerda siempre cerrar sesión en dispositivos compartidos.",
    order: 5,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT", "SUPER_ADMIN"],
  },
])
