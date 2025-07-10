// src/components/registros/ResumenSemanaTable.tsx
import React from "react";
import type { ResumenSemana } from "../../types/resumenSemana";
import "../../styles/components/ResumenSemana.css"

interface Props {
  resumen: ResumenSemana;
}

const ResumenSemanaTable: React.FC<Props> = ({ resumen }) => {
  return (
    <table className="resumen-semana-table">
      <thead>
        <tr>
          <th>Semana</th>
          <th>Horas Normales</th>
          <th>Extras Diurnas</th>
          <th>Extras Nocturnas</th>
          <th>Dom. Diurnas</th>
          <th>Dom. Nocturnas</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{resumen.semana}</td>
          <td>{resumen.horasNormales}</td>
          <td>{resumen.extrasDiurnas}</td>
          <td>{resumen.extrasNocturnas}</td>
          <td>{resumen.extrasDomDiurnas}</td>
          <td>{resumen.extrasDomNocturnas}</td>
          <td>{resumen.total}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ResumenSemanaTable;
