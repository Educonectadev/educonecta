import { registerTourSteps } from "@/lib/tour"

registerTourSteps([
  {
    id: "discipline-module",
    route: "/dashboard",
    selector: "[data-tour='discipline']",
    title: "Disciplina",
    description:
      "Este módulo permite registrar y dar seguimiento a incidentes de disciplina. Puedes documentar eventos, asignar medidas correctivas y notificar a los padres. Todo queda registrado para mantener un historial académico completo.",
    order: 60,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT"],
  },
])
