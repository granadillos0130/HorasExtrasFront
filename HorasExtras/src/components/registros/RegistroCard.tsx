import React from "react";
import type { Registro } from "../../types/registros";
import "../../styles/components/registros/RegistroCard.css";

interface Props {
  registro: Registro;
  onDelete: (id: number) => void;
}

const RegistroCard: React.FC<Props> = ({ registro, onDelete }) => (
  <div className="registro-card">
    <h3>Registro #{registro.id}</h3>
    <p><strong>Trabajador:</strong> {registro.trabajadorNombre ?? registro.trabajadorId}</p>
    <p><strong>Centro:</strong> {registro.nombreCentro ?? registro.centroId}</p>
    <p><strong>Fecha:</strong> {registro.fecha} ({registro.diaSemana})</p>
    <p><strong>Horas Totales:</strong> {registro.totalHoras}</p>
    <button onClick={() => onDelete(registro.id)}>Eliminar</button>
  </div>
);

export default RegistroCard;
