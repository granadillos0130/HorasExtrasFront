import { useState } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { getImageValidationError, fileToBase64 } from "../../utils/imageUtils";
import type { Trabajador } from "../../types/trabajadores";

export function useTrabajadorImagen(
  trabajador: Trabajador | null,
  setTrabajador: React.Dispatch<React.SetStateAction<Trabajador | null>>
) {
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    // Validar archivo
    const validationError = getImageValidationError(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setUploadingImage(true);

      // Mostrar preview mientras se sube
      const preview = await fileToBase64(file);
      setImagePreview(preview);

      // Subir imagen
      const result = await trabajadoresService.subirImagen(trabajador!.id, file);

      setTrabajador(prev => prev ? { ...prev, imagen_Url: result.imagenUrl } : null);
      setImagePreview(null);
      setImageError(false);

      alert("Imagen actualizada correctamente");
    } catch (error) {
      console.error("Error al subir imagen:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert("Error al subir la imagen: " + errorMessage);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!trabajador?.imagen_Url) return;

    if (!confirm("¿Estás seguro de que quieres eliminar la imagen?")) return;

    try {
      setUploadingImage(true);
      await trabajadoresService.eliminarImagen(trabajador.id);

      setTrabajador(prev => prev ? { ...prev, imagen_Url: undefined } : null);
      setImageError(false);

      alert("Imagen eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert("Error al eliminar la imagen: " + errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Limpiar input
    e.target.value = '';
  };

  return {
    imageError,
    setImageError,
    uploadingImage,
    imagePreview,
    handleImageDelete,
    handleFileInputChange,
  };
}
