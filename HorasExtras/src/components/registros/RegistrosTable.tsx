import React from "react";
import type { Registro } from "../../types/registros";
import "../../styles/components/RegistrosTable.css";

interface Props {
  registros: Registro[];
}

const RegistrosTable: React.FC<Props> = ({ registros }) => {
  if (registros.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>No hay registros</h3>
        <p>No hay registros para los filtros seleccionados.</p>
      </div>
    );
  }

  const formatHours = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const getHoursBadge = (hours: number, type: string) => {
    if (hours === 0) return <span className="hours-badge">0:00</span>;
    
    const badgeClass = `hours-badge ${type}`;
    return (
      <span className={badgeClass}>
        {formatHours(hours)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="table-container">
      <table className="registros-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Día</th>
            <th>Trabajador</th>
            <th>Centro</th>
            <th>Orden Compra</th>
            <th>Ingreso</th>
            <th>Salida</th>
            <th>Almuerzo</th>
            <th>H. Normales</th>
            <th>H. Extras Diurnas</th>
            <th>H. Extras Nocturnas</th>
            <th>Dom. Diurnas</th>
            <th>Dom. Nocturnas</th>
            <th>Total Horas</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r, index) => (
            <tr key={r.id} style={{animationDelay: `${index * 0.05}s`}}>
              <td className="col-fecha">{formatDate(r.fecha)}</td>
              <td>{r.diaSemana}</td>
              <td className="col-trabajador">{r.trabajadorNombre}</td>
              <td>{r.centroNombre}</td>
              <td>{r.ordenCompraNumero}</td>
              <td>{r.horaIngreso}</td>
              <td>{r.horaSalida}</td>
              <td>{r.tiempoAlmuerzo}</td>
              <td className="col-horas">
                {getHoursBadge(r.horasNormales, 'hours-normal')}
              </td>
              <td className="col-horas">
                {getHoursBadge(r.horasExtrasDiurnas, 'hours-extra-diurna')}
              </td>
              <td className="col-horas">
                {getHoursBadge(r.horasExtrasNocturnas, 'hours-extra-nocturna')}
              </td>
              <td className="col-horas">
                {getHoursBadge(r.extrasDominicalesDiurnas, 'hours-dominical')}
              </td>
              <td className="col-horas">
                {getHoursBadge(r.extrasDominicalesNocturnas, 'hours-dominical')}
              </td>
              <td className="col-horas col-total">
                {getHoursBadge(r.totalHoras, 'hours-total')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegistrosTable;