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
  const [imageError, setImageError] = useState(false); // 👈 NUEVO ESTADO

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
        {/* Avatar e info básica - SECCIÓN MODIFICADA */}
        <div className="worker-main-info">
          <div className="worker-avatar">
            {trabajador.imagen_Url && !imageError ? (
              <img 
                src={getImageUrl(trabajador.imagen_Url)} // 👈 USAR getImageUrl
                alt={trabajador.nombre}
                className="avatar-image"
                onError={() => setImageError(true)} // 👈 MANEJAR ERROR
              />
            ) : (
              <span className="avatar-initials">{getInitials(trabajador.nombre)}</span>
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

        {/* Acciones - Solo se muestran cuando está seleccionado */}
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