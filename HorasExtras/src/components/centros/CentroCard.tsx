import React from "react";
import type { Centro } from "../../types/centros";
import "../../styles/components/CentroCard.css";

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
          className="btn-ver"
          onClick={() => onView(centro.id)}
        >
          👁️ Ver
        </button>
        <button
          className="btn-eliminar"
          onClick={() => onDelete(centro.id, centro.nombreCentro)}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};


export default CentroCard;
