import { registerTourSteps } from "@/lib/tour"

registerTourSteps([
  {
    id: "schedule-view",
    route: "/dashboard",
    selector: "[data-tour='schedule']",
    title: "Horarios",
    description:
      "El módulo de horarios te permite visualizar la distribución de clases por día, aula y docente. Puedes agregar, editar o reasignar horarios fácilmente. Los cambios se reflejan en tiempo real para todos los involucrados.",
    order: 30,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT"],
  },
])
