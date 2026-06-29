import { registerTourSteps } from "@/lib/tour"

registerTourSteps([
  {
    id: "profile-section",
    route: "/dashboard",
    selector: "[data-tour='profile']",
    title: "Tu perfil",
    description:
      "En tu perfil puedes ver y editar tu información personal: nombre, correo electrónico y datos de contacto. También puedes cambiar el color de marca de la aplicación para personalizar tu experiencia.",
    order: 10,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT"],
  },
  {
    id: "brand-color",
    route: "/dashboard",
    selector: "[data-tour='brand-color']",
    title: "Color de marca",
    description:
      "Personaliza el color principal de la aplicación. Elige un color que identifique a tu institución o simplemente el que más te guste. Este color se aplicará a los botones y elementos destacados del sistema.",
    order: 11,
    role: ["INSTITUTIONAL_ADMIN", "TEACHER", "PARENT", "STUDENT"],
  },
])
