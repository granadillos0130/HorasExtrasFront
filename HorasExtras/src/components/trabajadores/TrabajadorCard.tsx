// src/components/trabajadores/TrabajadorCard.tsx
import React from "react";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/TrabajadorCard.css"

interface Props {
  trabajador: Trabajador;
  onDelete: (id: number) => void;
}

const TrabajadorCard: React.FC<Props> = ({ trabajador, onDelete }) => (
  <div className="trabajador-card">
    <h3>{trabajador.nombre}</h3>
    <button onClick={() => onDelete(trabajador.id)}>Eliminar</button>
  </div>
);

export default TrabajadorCard;
