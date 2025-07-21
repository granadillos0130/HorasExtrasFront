import React from "react";
import type { Registro } from "../../types/registros";
import "../../styles/components/registros/RegistrosTable.css";

interface Props {
  registros: Registro[];
  onEdit?: (registro: Registro) => void;
  onDelete?: (id: number) => void;
}

const RegistrosTable: React.FC<Props> = ({ registros, onEdit, onDelete }) => {
  if (!registros || registros.length === 0) {
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
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const getHoursBadge = (hours: number, type: string) => {
    const badgeClass = `hours-badge ${type}`;
    return (
      <span className={badgeClass}>
        {formatHours(hours)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}`;
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="registros-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Día</th>
              <th>Trabajador</th>
              <th>Centro</th>
              <th>Ingreso</th>
              <th>Salida</th>
              <th>Almuerzo</th>
              <th>H. Norm.</th>
              <th>H. Ex. Diur.</th>
              <th>H. Ex. Noct.</th>
              <th>Dom. Diur.</th>
              <th>Dom. Noct.</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r, index) => (
              <tr key={r.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <td>{formatDate(r.fecha)}</td>
                <td>{r.diaSemana.substring(0, 3)}</td>
                <td>{r.trabajadorNombre}</td>
               <td className="col-centro" title={r.nombreCentro || "Sin centro"}>
  {r.nombreCentro 
    ? (r.nombreCentro.length > 12 
        ? `${r.nombreCentro.substring(0, 12)}...` 
        : r.nombreCentro)
    : "Sin centro"}
</td>

                <td>{formatTime(r.horaIngreso)}</td>
                <td>{formatTime(r.horaSalida)}</td>
                <td>{formatTime(r.tiempoAlmuerzo)}</td>
                <td>{getHoursBadge(r.horasNormales, "hours-normal")}</td>
                <td>{getHoursBadge(r.horasExtrasDiurnas, "hours-extra-diurna")}</td>
                <td>{getHoursBadge(r.horasExtrasNocturnas, "hours-extra-nocturna")}</td>
                <td>{getHoursBadge(r.extrasDominicalesDiurnas, "hours-dominical")}</td>
                <td>{getHoursBadge(r.extrasDominicalesNocturnas, "hours-dominical")}</td>
                <td>{getHoursBadge(r.totalHoras, "hours-total")}</td>
                <td>
                  <div className="action-buttons">
                    {onEdit && (
                      <button
                        className="btn-action btn-edit"
                        onClick={() => onEdit(r)}
                        title="Editar registro"
                      >
                        ✏️
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn-action btn-delete"
                        onClick={() => {
                          if (confirm(`¿Eliminar registro de ${r.trabajadorNombre} el ${formatDate(r.fecha)}?`)) {
                            onDelete(r.id);
                          }
                        }}
                        title="Eliminar registro"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
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
  );
};

export default RegistrosTable;
