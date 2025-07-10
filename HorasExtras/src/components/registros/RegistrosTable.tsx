// src/components/registros/RegistrosTable.tsx
import React from "react";
import type { Registro } from "../../types/registros";
import "../../styles/components/RegistrosTable.css";

interface Props {
  registros: Registro[];
}

const RegistrosTable: React.FC<Props> = ({ registros }) => {
  if (registros.length === 0) {
    return <p>No hay registros para los filtros seleccionados.</p>;
  }

  return (
    <table className="registros-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Semana</th>
          <th>Trabajador</th>
          <th>Centro</th>
          <th>OC</th>
          <th>Ingreso</th>
          <th>Salida</th>
          <th>Almuerzo</th>
          <th>Total Horas</th>
          <th>Horas Normales</th>
          <th>Extras Diurnas</th>
          <th>Extras Nocturnas</th>
          <th>Dom. Diurnas</th>
          <th>Dom. Nocturnas</th>
        </tr>
      </thead>
      <tbody>
        {registros.map((r) => (
          <tr key={r.id}>
            <td>{r.fecha}</td>
            <td>{r.semana}</td>
            <td>{r.trabajadorNombre}</td>
            <td>{r.centroNombre}</td>
            <td>{r.ordenCompraNumero}</td>
            <td>{r.horaIngreso}</td>
            <td>{r.horaSalida}</td>
            <td>{r.tiempoAlmuerzo}</td>
            <td>{r.totalHoras}</td>
            <td>{r.horasNormales}</td>
            <td>{r.horasExtrasDiurnas}</td>
            <td>{r.horasExtrasNocturnas}</td>
            <td>{r.extrasDominicalesDiurnas}</td>
            <td>{r.extrasDominicalesNocturnas}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RegistrosTable;
