import { registerTourSteps } from "@/lib/tour"

registerTourSteps([
  {
    id: "grades-overview",
    route: "/dashboard",
    selector: "[data-tour='grades']",
    title: "Calificaciones",
    description:
      "Gestiona las calificaciones de los estudiantes por curso y bimestre. Puedes registrar notas, calcular promedios y exportar reportes. El sistema calcula automáticamente los promedios y genera las vistas para estudiantes y padres.",
    order: 50,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT"],
  },
  {
    id: "grades-register",
    route: "/dashboard/teacher/calificaciones",
    selector: "[data-tour='grades-register']",
    title: "Registro de notas",
    description:
      "Selecciona el curso y bimestre para registrar o modificar notas. Puedes ingresar notas una por una o usar la carga masiva. El sistema valida que las notas estén dentro del rango permitido y calcula automáticamente el promedio.",
    order: 51,
    role: ["TEACHER"],
  },
])
