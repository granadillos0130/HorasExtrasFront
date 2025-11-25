import React from 'react';
import { formatHours, getDiasEnRango } from '../../utils/trabajadores/fechaUtils';

interface ResumenHorasProps {
  resumen: {
    normales: number;
    extrasDiurnas: number;
    extrasNocturnas: number;
    domDiurnas: number;
    domNocturnas: number;
    total: number;
  };
  fechaInicio: string;
  fechaFin: string;
  totalRegistros: number;
  onExportarExcel: () => void;
}

export const ResumenHoras: React.FC<ResumenHorasProps> = ({
  resumen,
  fechaInicio,
  fechaFin,
  totalRegistros,
  onExportarExcel,
}) => {
  const diasEnRango = getDiasEnRango(fechaInicio, fechaFin);

  return (
    <div className="resumen-card">
      <div className="resumen-header">
        <h3>Resumen de Horas</h3>
        <div className="resumen-actions">
          <div className="total-badge">
            Total: {formatHours(resumen.total)}
          </div>
          <button className="btn-exportar" onClick={onExportarExcel} title="Exportar a Excel">
            📤 Exportar Excel
          </button>
        </div>
      </div>

      <div className="resumen-grid">
        <div className="resumen-item normal">
          <div className="resumen-icon">⏰</div>
          <div className="resumen-content">
            <div className="resumen-number">{formatHours(resumen.normales)}</div>
            <div className="resumen-label">Horas Normales</div>
          </div>
        </div>

        <div className="resumen-item extra-diurna">
          <div className="resumen-icon">☀️</div>
          <div className="resumen-content">
            <div className="resumen-number">{formatHours(resumen.extrasDiurnas)}</div>
            <div className="resumen-label">Extras Diurnas</div>
          </div>
        </div>

        <div className="resumen-item extra-nocturna">
          <div className="resumen-icon">🌙</div>
          <div className="resumen-content">
            <div className="resumen-number">{formatHours(resumen.extrasNocturnas)}</div>
            <div className="resumen-label">Extras Nocturnas</div>
          </div>
        </div>

        <div className="resumen-item dom-diurna">
          <div className="resumen-icon">🌅</div>
          <div className="resumen-content">
            <div className="resumen-number">{formatHours(resumen.domDiurnas)}</div>
            <div className="resumen-label">Dom. Diurnas</div>
          </div>
        </div>

        <div className="resumen-item dom-nocturna">
          <div className="resumen-icon">🌃</div>
          <div className="resumen-content">
            <div className="resumen-number">{formatHours(resumen.domNocturnas)}</div>
            <div className="resumen-label">Dom. Nocturnas</div>
          </div>
        </div>
      </div>

      <div className="period-summary">
        <div className="period-item">
          <span className="period-icon">📊</span>
          <span>Promedio diario: {formatHours(resumen.total / diasEnRango)}</span>
        </div>
        <div className="period-item">
          <span className="period-icon">📈</span>
          <span>{totalRegistros} día{totalRegistros !== 1 ? 's' : ''} con registro</span>
        </div>
      </div>
    </div>
  );
};