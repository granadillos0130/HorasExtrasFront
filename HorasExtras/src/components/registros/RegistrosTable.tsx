import React from "react";
import type { Registro } from "../../types/registros";
import "../../styles/components/RegistrosTable.css";

interface Props {
  registros: Registro[];
  onEdit?: (registro: Registro) => void;
  onDelete?: (id: number) => void;
}

const RegistrosTable: React.FC<Props> = ({ registros, onEdit, onDelete }) => {
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
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const getHoursBadge = (hours: number, type: string) => {
    if (hours === 0) return <span className="hours-badge hours-zero">0:00</span>;

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
    return timeString.substring(0, 5); // Solo HH:MM
  };

  const handleEdit = (registro: Registro) => {
    if (onEdit) {
      onEdit(registro);
    }
  };

  const handleDelete = (id: number, trabajadorNombre: string, fecha: string) => {
    if (onDelete) {
      const confirmMessage = `¿Estás seguro de eliminar el registro de ${trabajadorNombre} del ${formatDate(fecha)}?`;
      if (confirm(confirmMessage)) {
        onDelete(id);
      }
    }
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
              <th>O.C.</th>
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
                <td className="col-fecha">{formatDate(r.fecha)}</td>
                <td className="col-dia">{r.diaSemana.substring(0, 3)}</td>
                <td className="col-trabajador" title={r.trabajadorNombre}>
                  {r.trabajadorNombre.length > 15 
                    ? `${r.trabajadorNombre.substring(0, 15)}...` 
                    : r.trabajadorNombre}
                </td>
                <td className="col-centro" title={r.centroNombre}>
                  {r.centroNombre.length > 12 
                    ? `${r.centroNombre.substring(0, 12)}...` 
                    : r.centroNombre}
                </td>
                <td className="col-orden" title={`${r.ordenCompraNumero} - ${r.ordenCompraDescripcion}`}>
                  {r.ordenCompraNumero}
                </td>
                <td className="col-hora">{formatTime(r.horaIngreso)}</td>
                <td className="col-hora">{formatTime(r.horaSalida)}</td>
                <td className="col-hora">{formatTime(r.tiempoAlmuerzo)}</td>
                <td className="col-horas">
                  {getHoursBadge(r.horasNormales, "hours-normal")}
                </td>
                <td className="col-horas">
                  {getHoursBadge(r.horasExtrasDiurnas, "hours-extra-diurna")}
                </td>
                <td className="col-horas">
                  {getHoursBadge(r.horasExtrasNocturnas, "hours-extra-nocturna")}
                </td>
                <td className="col-horas">
                  {getHoursBadge(r.extrasDominicalesDiurnas, "hours-dominical")}
                </td>
                <td className="col-horas">
                  {getHoursBadge(r.extrasDominicalesNocturnas, "hours-dominical")}
                </td>
                <td className="col-horas col-total">
                  {getHoursBadge(r.totalHoras, "hours-total")}
                </td>
                <td className="col-acciones">
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEdit(r)}
                      title="Editar registro"
                      disabled={!onEdit}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(r.id, r.trabajadorNombre, r.fecha)}
                      title="Eliminar registro"
                      disabled={!onDelete}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Indicador de scroll en móvil */}
      <div className="scroll-indicator">
        💡 Desliza horizontalmente para ver todas las columnas
      </div>
    </div>
  );
};

export default RegistrosTable;