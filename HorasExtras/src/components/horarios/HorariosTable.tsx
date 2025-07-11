import React from "react";
import type { Horario } from "../../types/horarios";
import "../../styles/components/HorariosTable.css";

interface Props {
  horarios: Horario[];
  onDelete: (id: number) => void;
}

const HorariosTable: React.FC<Props> = ({ horarios, onDelete }) => {
  if (horarios.length === 0) {
    return <p>No hay horarios asignados.</p>;
  }

  return (
    <table className="horarios-table">
      <thead>
        <tr>
          <th>Trabajador</th>
          <th>Día</th>
          <th>Hora Inicio</th>
          <th>Hora Fin</th>
          <th>Intensidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {horarios.map((h) => (
          <tr key={h.id}>
            <td>{h.trabajadorNombre ?? `#${h.trabajadorId}`}</td>
            <td>{h.dia}</td>
            <td>{h.horaInicio}</td>
            <td>{h.horaFin}</td>
            <td>{h.intensidadHoraria}</td>
            <td>
              <button onClick={() => onDelete(h.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default HorariosTable;
