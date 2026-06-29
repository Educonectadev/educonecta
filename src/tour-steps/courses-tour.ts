import { registerTourSteps } from "@/lib/tour"

registerTourSteps([
  {
    id: "courses-list",
    route: "/dashboard",
    selector: "[data-tour='courses']",
    title: "Cursos",
    description:
      "Aquí puedes gestionar todos los cursos de la institución. Puedes crear nuevos cursos, asignar docentes, definir horarios y organizar las materias por grado. Cada curso puede tener múltiples secciones y horarios personalizados.",
    order: 20,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER"],
  },
  {
    id: "student-courses",
    route: "/dashboard/student",
    selector: "[data-tour='courses']",
    title: "Mis cursos",
    description:
      "Desde aquí puedes ver todos los cursos en los que estás matriculado. Cada curso muestra tus tareas pendientes, calificaciones y materiales compartidos por el docente. Es tu centro de aprendizaje personal.",
    order: 20,
    role: ["STUDENT"],
  },
])
