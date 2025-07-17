import React from "react";
import { useNavigate } from "react-router-dom";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/TrabajadorCard.css";

interface Props {
  trabajador: Trabajador;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const TrabajadorCard: React.FC<Props> = ({ trabajador, onDelete, onView }) => {
  const navigate = useNavigate();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleEdit = () => {
    navigate(`/trabajadores/editar/${trabajador.id}`);
  };

  return (
    <div className="trabajador-card">
      <div className="card-content">
        {/* Avatar y información básica */}
        <div className="worker-main-info">
          <div className="worker-avatar">
            <span className="avatar-initials">{getInitials(trabajador.nombre)}</span>
          </div>
          <div className="worker-details">
            <h3 className="worker-name">{trabajador.nombre}</h3>
            <div className="worker-meta">
              <span className="worker-id">ID: {trabajador.id}</span>
              <span className="worker-cedula">CC: {trabajador.cedula}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="card-actions">
          <button
            className="btn-view-details"
            onClick={() => onView(trabajador.id)}
          >
            <span className="btn-icon">👁️</span>
            Ver Detalles
          </button>
          
          <button
            className="btn-edit"
            onClick={handleEdit}
            title="Editar trabajador"
          >
            <span className="btn-icon">✏️</span>
            Editar
          </button>
          
          <button
            className="btn-delete"
            onClick={() => onDelete(trabajador.id)}
            title="Eliminar trabajador"
          >
            🗑️
          </button>
          <button
  className="btn-intensidad"
  onClick={() => navigate(`/trabajadores/${trabajador.id}/intensidad`)}
  title="Ver intensidad horaria"
>
  <span className="btn-icon">📊</span>
  Intensidad Horaria
</button>

        </div>
      </div>
    </div>
  );
};

export default TrabajadorCard;