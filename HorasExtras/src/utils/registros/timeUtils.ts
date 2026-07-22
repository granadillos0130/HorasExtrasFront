// Convierte un valor de tiempo ingresado por el usuario (minutos sueltos, "H:mm" o "H:mm:ss")
// al formato TimeSpan "HH:mm:ss" que espera el backend.
export const convertirATimeSpan = (valor: string | null | undefined): string => {
  if (!valor) return "";

  const parts = valor.trim().split(":");
  if (parts.length === 1 && /^\d+$/.test(parts[0])) {
    return `00:${parts[0].padStart(2, "0")}:00`;
  } else if (parts.length === 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
  } else if (parts.length === 3) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
  }
  return "";
};
