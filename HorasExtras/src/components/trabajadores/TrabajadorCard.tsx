// src/components/trabajadores/TrabajadorCard.tsx
import React from "react";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/TrabajadorCard.css";

interface Props {
  trabajador: Trabajador;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const TrabajadorCard: React.FC<Props> = ({ trabajador, onDelete, onView }) => (
  <div className="trabajador-card">
    <h3>{trabajador.nombre}</h3>
    <div className="card-actions">
      <button onClick={() => onView(trabajador.id)}>👁️ Ver más</button>
      <button onClick={() => onDelete(trabajador.id)}>🗑️ Eliminar</button>
    </div>
  </div>
);

export default TrabajadorCard;
