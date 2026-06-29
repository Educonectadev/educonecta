import { registerTourSteps } from "@/lib/tour"

registerTourSteps([
  {
    id: "attendance-take",
    route: "/dashboard",
    selector: "[data-tour='attendance']",
    title: "Asistencia",
    description:
      "Registra la asistencia diaria de los estudiantes de forma rápida. Puedes marcar presente, tarde o faltante. También puedes usar el escáner QR para un registro más ágil. La asistencia se guarda automáticamente y está disponible para consulta de los padres.",
    order: 40,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT"],
  },
  {
    id: "attendance-qr",
    route: "/dashboard",
    selector: "[data-tour='attendance-qr']",
    title: "Escáner QR",
    description:
      "Usa el escáner QR para registrar asistencia de forma masiva y sin contacto. Cada estudiante tiene un código QR único. Simplemente escanea y la asistencia se registra al instante. Ideal para entradas y salidas rápidas.",
    order: 41,
    role: ["TEACHER"],
  },
])
