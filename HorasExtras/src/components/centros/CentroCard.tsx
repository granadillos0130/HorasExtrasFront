import React from "react";
import type { Centro } from "../../types/centros";
import "../../styles/components/centro/CentroCard.css";

interface Props {
  centro: Centro;
  onDelete: (id: string, nombre: string) => void;
  onView: (centroId: string) => void;
}

const CentroCard: React.FC<Props> = ({ centro, onDelete, onView }) => {
  return (
    <div className="centro-card">
      <div className="centro-info">
        <h3>{centro.nombreCentro}</h3>
        <p><strong>ID:</strong> {centro.id}</p>
      </div>
      <div className="centro-actions">
        <button
          className="btn btn-view"
          onClick={() => onView(centro.id)}
        >
          <span className="btn-icon">👁️</span>
          <span className="btn-text">Ver</span>
        </button>
        <button
          className="btn btn-delete"
          onClick={() => onDelete(centro.id, centro.nombreCentro)}
        >
          <span className="btn-icon">🗑️</span>
          <span className="btn-text">Eliminar</span>
        </button>
      </div>
    </div>
  );
};

export default CentroCard;