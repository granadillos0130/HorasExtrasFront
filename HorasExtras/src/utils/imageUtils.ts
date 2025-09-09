// src/utils/imageUtils.ts
import { api } from "../api/api";

// Obtener la base URL desde la configuración de axios
const getApiBaseUrl = (): string => {
  // Si api.defaults.baseURL está definido, lo usamos
  if (api.defaults.baseURL) {
    // Remover /api del final para archivos estáticos
    return api.defaults.baseURL.replace('/api', '');
  }
  
  // Fallback a variables de entorno
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remover /api del final si existe
  return envUrl.replace('/api', '');
};

/**
 * Construye la URL completa para una imagen de trabajador
 * @param imagePath - Ruta relativa de la imagen (ej: "/uploads/trabajadores/imagen.jpg")
 * @returns URL completa o undefined si no hay imagen
 */
export const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
  if (!imagePath) return undefined;
  
  // Si ya es una URL completa (http/https), la devolvemos tal como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const baseUrl = getApiBaseUrl();
  
  // Si es una ruta relativa que empieza con /, construimos la URL completa
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // Si no tiene barra al inicio, la agregamos
  return `${baseUrl}/${imagePath}`;
};

/**
 * Obtiene la URL completa para la imagen de un trabajador específico
 * @param imagePath - Ruta de la imagen
 * @returns URL completa de la imagen
 */
export const getTrabajadorImageUrl = (imagePath?: string | null): string | undefined => {
  return getImageUrl(imagePath);
};

/**
 * Valida si un archivo es una imagen válida
 * @param file - Archivo a validar
 * @returns true si es una imagen válida
 */
export const isValidImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

/**
 * Obtiene el mensaje de error para archivos inválidos
 * @param file - Archivo a validar
 * @returns Mensaje de error o undefined si es válido
 */
export const getImageValidationError = (file: File): string | undefined => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return 'Solo se permiten archivos JPG, PNG o GIF';
  }
  
  if (file.size > maxSize) {
    return 'La imagen no puede superar los 5MB';
  }
  
  return undefined;
};

/**
 * Convierte un archivo a base64 (útil para previsualizaciones)
 * @param file - Archivo de imagen
 * @returns Promise con la cadena base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Error al leer el archivo'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
};