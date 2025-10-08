/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react"; // 👈 AGREGAR useState
import { useNavigate } from "react-router-dom";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/trabajador/TrabajadorCard.css";
import { trabajadoresService } from "../../api/trabajadoresService";
import { getImageUrl } from "../../utils/imageUtils"; // 👈 AGREGAR IMPORT

interface Props {
  trabajador: Trabajador;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onEstadoChange?: () => void;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

const TrabajadorCard: React.FC<Props> = ({ 
  trabajador, 
  onDelete, 
  onView, 
  onEstadoChange,
  isSelected = false,
  onSelect
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true); // 👈 NUEVO: estado de carga
  const [showImage, setShowImage] = useState(true); // 👈 NUEVO: controlar visibilidad

  // Resetear estados cuando cambia el trabajador
  React.useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setShowImage(true);
  }, [trabajador.id, trabajador.imagen_Url]);

  // 👈 NUEVO: Timeout para imágenes que tardan mucho
  React.useEffect(() => {
    if (imageLoading && trabajador.imagen_Url) {
      const timeout = setTimeout(() => {
        // Si después de 5 segundos sigue cargando, mostrar iniciales
        setImageError(true);
        setImageLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [imageLoading, trabajador.imagen_Url]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // 👈 NUEVO: Función para reintentar cargar la imagen manualmente
  const retryImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageError(false);
    setImageLoading(true);
    setShowImage(false);
    // Forzar re-render
    setTimeout(() => setShowImage(true), 50);
  };

  const handleEdit = () => {
    navigate(`/trabajadores/editar/${trabajador.id}`);
  };

  const handleVerAusencias = () => {
    navigate(`/trabajadores/${trabajador.id}/ausencias`);
  };

  const cambiarEstado = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nuevoEstado = trabajador.estado === "Vigente" ? "No Vigente" : "Vigente";
    try {
      await trabajadoresService.cambiarEstado(trabajador.id, nuevoEstado);
      if (onEstadoChange) onEstadoChange();
    } catch (error) {
      // Silently handle error in production
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(trabajador.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className={`trabajador-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-content">
        {/* Avatar e info básica */}
        <div className="worker-main-info">
          <div className="worker-avatar">
            {trabajador.imagen_Url && !imageError && showImage ? (
              <>
                {/* Mostrar skeleton/spinner mientras carga */}
                {imageLoading && (
                  <div className="avatar-loading">
                    <span className="loading-spinner">⏳</span>
                  </div>
                )}
                <img 
                  src={getImageUrl(trabajador.imagen_Url)}
                  alt={trabajador.nombre}
                  className={`avatar-image ${imageLoading ? 'loading' : 'loaded'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: imageLoading ? 'none' : 'block' }} // 👈 Ocultar hasta que cargue
                />
              </>
            ) : (
              <div className="avatar-fallback">
                <span className="avatar-initials">{getInitials(trabajador.nombre)}</span>
                {/* 👈 NUEVO: Botón para reintentar si falló */}
                {imageError && trabajador.imagen_Url && (
                  <button 
                    className="retry-image-btn"
                    onClick={retryImage}
                    title="Reintentar cargar imagen"
                  >
                    🔄
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="worker-details">
            <h3 className="worker-name">{trabajador.nombre}</h3>
            <div className="worker-meta">
              <span className="worker-id">ID: {trabajador.id}</span>
              <span className="worker-cedula">CC: {trabajador.cedula}</span>
              <span className={`worker-estado ${trabajador.estado === "Vigente" ? "vigente" : "no-vigente"}`}>
                Estado: {trabajador.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de selección */}
        <div className={`selection-indicator ${isSelected ? 'active' : ''}`}>
          <div className="selection-dot"></div>
        </div>

        {/* Acciones */}
        <div className={`card-actions ${isSelected ? 'visible' : ''}`}>
          <div className="actions-grid">
            <button 
              className="btn-action btn-view-details" 
              onClick={(e) => handleActionClick(e, () => onView(trabajador.id))}
              title="Ver detalles del trabajador"
            >
              <span className="btn-icon">👁️</span>
              <span className="btn-text">Ver Detalles</span>
            </button>

            <button 
              className="btn-action btn-ausencias" 
              onClick={(e) => handleActionClick(e, handleVerAusencias)}
              title="Ver estadísticas de ausencias"
            >
              <span className="btn-icon">📊</span>
              <span className="btn-text">Ausencias</span>
            </button>

            <button 
              className="btn-action btn-intensidad" 
              onClick={(e) => handleActionClick(e, () => navigate(`/trabajadores/${trabajador.id}/intensidad`))}
              title="Ver intensidad horaria"
            >
              <span className="btn-icon">📈</span>
              <span className="btn-text">Intensidad</span>
            </button>

            <button 
              className="btn-action btn-edit" 
              onClick={(e) => handleActionClick(e, handleEdit)}
              title="Editar trabajador"
            >
              <span className="btn-icon">✏️</span>
              <span className="btn-text">Editar</span>
            </button>

            <button 
              className="btn-action btn-delete" 
              onClick={(e) => handleActionClick(e, () => onDelete(trabajador.id))}
              title="Eliminar trabajador"
            >
              <span className="btn-icon">🗑️</span>
              <span className="btn-text">Eliminar</span>
            </button>

            <button
              className="btn-action btn-estado"
              onClick={(e) => handleActionClick(e, () => cambiarEstado(e))}
              title={trabajador.estado === "Vigente" ? "Pasar a No Vigente" : "Pasar a Vigente"}
            >
              <span className="btn-icon">{trabajador.estado === "Vigente" ? "🔴" : "🟢"}</span>
              <span className="btn-text">
                {trabajador.estado === "Vigente" ? "Desactivar" : "Activar"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrabajadorCard;