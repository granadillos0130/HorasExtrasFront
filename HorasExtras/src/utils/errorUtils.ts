// Forma típica de un error de Axios devuelto por la API de este proyecto.
export interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      mensaje?: string;
      error?: string;
    } | string;
  };
  message?: string;
}

export function isApiError(error: unknown): error is ApiErrorResponse {
  return typeof error === "object" && error !== null;
}

// Devuelve el mensaje de error dentro de response.data (string u objeto), si existe.
export function getApiErrorData(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  const data = error.response?.data;
  return typeof data === "string" ? data : undefined;
}

export function getApiErrorField(
  error: unknown,
  field: "message" | "mensaje" | "error"
): string | undefined {
  if (!isApiError(error)) return undefined;
  const data = error.response?.data;
  if (typeof data === "string") return undefined;
  return data?.[field];
}

export function getErrorMessage(error: unknown): string | undefined {
  if (!isApiError(error)) return undefined;
  return error.message;
}
