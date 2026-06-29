import { registerTourSteps } from "@/lib/tour"

registerTourSteps([
  {
    id: "settings-config",
    route: "/dashboard",
    selector: "[data-tour='settings']",
    title: "Configuración",
    description:
      "En configuración puedes ajustar los parámetros generales de tu cuenta y de la institución. Aquí también encontrarás la opción de volver a ver esta guía turística cuando la necesites.",
    order: 80,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT", "SUPER_ADMIN"],
  },
  {
    id: "tour-restart",
    route: "/dashboard",
    selector: "[data-tour='restart-tour']",
    title: "Volver a ver la guía",
    description:
      "Si en algún momento necesitas repasar cómo funciona alguna sección, puedes volver a iniciar esta guía desde Configuración. La guía te llevará paso a paso por todas las funcionalidades nuevamente.",
    order: 81,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT", "SUPER_ADMIN"],
  },
])
