import React from 'react';
import type { Registro } from '../../types/registros';
import { formatFechaSafe, formatHours, safeSubstring, formatCentroName } from '../../utils/trabajadores/fechaUtils';

interface TablaRegistrosProps {
  registros: Registro[];
}

export const TablaRegistros: React.FC<TablaRegistrosProps> = ({ registros }) => {
  return (
    <div className="registros-card">
      <div className="registros-header">
        <div className="registros-title">
          <div className="registros-icon">📋</div>
          <h3>Registros Detallados</h3>
        </div>
        <div className="registros-count">
          {registros.length} registro{registros.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="intensidad-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Día</th>
                <th>Centro</th>
                <th>Ingreso</th>
                <th>Salida</th>
                <th>Almuerzo</th>
                <th>H. Normales</th>
                <th>Ex. Diurnas</th>
                <th>Ex. Nocturnas</th>
                <th>Dom. Diurnas</th>
                <th>Dom. Nocturnas</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro, index) => (
                <tr key={registro.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="col-fecha">
                    {formatFechaSafe(registro.fecha)}
                  </td>
                  <td className="col-dia">
                    {safeSubstring(registro.diaSemana, 0, 3) || 'N/A'}
                  </td>
                  <td className="col-centro" title={registro.nombreCentro || 'Sin centro'}>
                    {formatCentroName(registro.nombreCentro)}
                  </td>
                  <td className="col-hora">
                    {safeSubstring(registro.horaIngreso, 0, 5) || 'N/A'}
                  </td>
                  <td className="col-hora">
                    {safeSubstring(registro.horaSalida, 0, 5) || 'N/A'}
                  </td>
                  <td className="col-hora">
                    {safeSubstring(registro.tiempoAlmuerzo, 0, 5) || 'N/A'}
                  </td>
                  <td className="col-horas normal">
                    <span className="hours-badge normal">
                      {formatHours(registro.horasNormales || 0)}
                    </span>
                  </td>
                  <td className="col-horas extra-diurna">
                    <span className="hours-badge extra-diurna">
                      {formatHours(registro.horasExtrasDiurnas || 0)}
                    </span>
                  </td>
                  <td className="col-horas extra-nocturna">
                    <span className="hours-badge extra-nocturna">
                      {formatHours(registro.horasExtrasNocturnas || 0)}
                    </span>
                  </td>
                  <td className="col-horas dom-diurna">
                    <span className="hours-badge dom-diurna">
                      {formatHours(registro.extrasDominicalesDiurnas || 0)}
                    </span>
                  </td>
                  <td className="col-horas dom-nocturna">
                    <span className="hours-badge dom-nocturna">
                      {formatHours(registro.extrasDominicalesNocturnas || 0)}
                    </span>
                  </td>
                  <td className="col-horas total">
                    <span className="hours-badge total">
                      {formatHours(registro.totalHoras || 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="scroll-indicator">
          💡 Desliza horizontalmente para ver todas las columnas
        </div>
      </div>
    </div>
  );
};