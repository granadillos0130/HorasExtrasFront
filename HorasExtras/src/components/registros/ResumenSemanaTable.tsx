import React from "react";
import type { ResumenSemana } from "../../types/ResumenSemana";
import "../../styles/components/ResumenSemana.css";

interface Props {
  resumen: ResumenSemana;
}

const ResumenSemanaTable: React.FC<Props> = ({ resumen }) => {
  const formatHours = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const getProgressBar = (hours: number, total: number, color: string) => {
    const percentage = total > 0 ? (hours / total) * 100 : 0;
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: color 
            }}
          />
        </div>
        <span className="progress-text">{formatHours(hours)}</span>
      </div>
    );
  };

  const getHoursCard = (title: string, hours: number, color: string, icon: string) => {
    return (
      <div className="hours-card" style={{ borderColor: color }}>
        <div className="hours-card-header" style={{ backgroundColor: color }}>
          <span className="hours-icon">{icon}</span>
          <span className="hours-title">{title}</span>
        </div>
        <div className="hours-value">
          {formatHours(hours)}
        </div>
      </div>
    );
  };

  return (
    <div className="resumen-container">
      <div className="resumen-header">
        <h4>Resumen de Horas - Semana {resumen.semana}</h4>
        <div className="total-badge">
          Total: {formatHours(resumen.total)}
        </div>
      </div>
      
      <div className="hours-grid">
        {getHoursCard("Horas Normales", resumen.horasNormales, "#27ae60", "⏰")}
        {getHoursCard("Extras Diurnas", resumen.extrasDiurnas, "#f39c12", "☀️")}
        {getHoursCard("Extras Nocturnas", resumen.extrasNocturnas, "#8e44ad", "🌙")}
        {getHoursCard("Dom. Diurnas", resumen.extrasDomDiurnas, "#e74c3c", "🌅")}
        {getHoursCard("Dom. Nocturnas", resumen.extrasDomNocturnas, "#c0392b", "🌃")}
      </div>

      <div className="progress-section">
        <h5>Distribución de Horas</h5>
        <div className="progress-list">
          <div className="progress-item">
            <span className="progress-label">Normales</span>
            {getProgressBar(resumen.horasNormales, resumen.total, "#27ae60")}
          </div>
          <div className="progress-item">
            <span className="progress-label">Extras Diurnas</span>
            {getProgressBar(resumen.extrasDiurnas, resumen.total, "#f39c12")}
          </div>
          <div className="progress-item">
            <span className="progress-label">Extras Nocturnas</span>
            {getProgressBar(resumen.extrasNocturnas, resumen.total, "#8e44ad")}
          </div>
          <div className="progress-item">
            <span className="progress-label">Dom. Diurnas</span>
            {getProgressBar(resumen.extrasDomDiurnas, resumen.total, "#e74c3c")}
          </div>
          <div className="progress-item">
            <span className="progress-label">Dom. Nocturnas</span>
            {getProgressBar(resumen.extrasDomNocturnas, resumen.total, "#c0392b")}
          </div>
        </div>
      </div>

      {/* Tabla tradicional como respaldo */}
      <div className="table-container-backup">
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
              <td>{formatHours(resumen.horasNormales)}</td>
              <td>{formatHours(resumen.extrasDiurnas)}</td>
              <td>{formatHours(resumen.extrasNocturnas)}</td>
              <td>{formatHours(resumen.extrasDomDiurnas)}</td>
              <td>{formatHours(resumen.extrasDomNocturnas)}</td>
              <td><strong>{formatHours(resumen.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResumenSemanaTable;