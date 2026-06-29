import { registerTourSteps } from "@/lib/tour"

registerTourSteps([
  {
    id: "announcements",
    route: "/dashboard",
    selector: "[data-tour='announcements']",
    title: "Comunicados",
    description:
      "Crea y envía comunicados a toda la comunidad educativa. Puedes dirigir mensajes a cursos específicos, grados completos o a toda la institución. Los comunicados aparecen en la bandeja de cada destinatario y también se envían como notificación push.",
    order: 70,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT"],
  },
  {
    id: "messages",
    route: "/dashboard",
    selector: "[data-tour='messages']",
    title: "Mensajes",
    description:
      "El chat interno te permite comunicarte directamente con docentes, padres y estudiantes. Es un canal privado y seguro para consultas rápidas. Los mensajes se entregan en tiempo real y quedan disponibles para su consulta posterior.",
    order: 71,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT"],
  },
])
