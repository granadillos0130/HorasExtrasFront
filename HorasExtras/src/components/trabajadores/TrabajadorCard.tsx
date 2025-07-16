// src/components/trabajadores/TrabajadorCard.tsx
import React from "react";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/TrabajadorCard.css";

interface Props {
  trabajador: Trabajador;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const TrabajadorCard: React.FC<Props> = ({ trabajador, onDelete, onView }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
            className="btn-delete"
            onClick={() => onDelete(trabajador.id)}
            title="Eliminar trabajador"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrabajadorCard;