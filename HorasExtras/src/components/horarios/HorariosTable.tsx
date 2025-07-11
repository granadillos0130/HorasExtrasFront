import React from "react";
import type { Horario } from "../../types/horarios";
import "../../styles/components/HorariosTable.css";

interface Props {
  horarios: Horario[];
  onDelete: (id: number) => void;
  onEdit?: (horario: Horario) => void;
}

const HorariosTable: React.FC<Props> = ({ horarios, onDelete, onEdit }) => {
  if (horarios.length === 0) {
    return (
      <div className="empty-horarios">
        <div className="empty-horarios-icon">⏰</div>
        <h3>No hay horarios asignados</h3>
        <p>No se encontraron horarios para los filtros seleccionados.</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Solo HH:MM
  };

  const getDayColor = (dia: string) => {
    const colors: { [key: string]: string } = {
      'Lunes': '#667eea',
      'Martes': '#764ba2', 
      'Miércoles': '#43e97b',
      'Jueves': '#f093fb',
      'Viernes': '#4facfe',
      'Sábado': '#fa709a',
      'Domingo': '#fec163'
    };
    return colors[dia] || '#667eea';
  };

  const handleEdit = (horario: Horario) => {
    if (onEdit) {
      onEdit(horario);
    }
  };

  const handleDelete = (id: number, trabajadorNombre: string, dia: string) => {
    const confirmMessage = `¿Estás seguro de eliminar el horario de ${trabajadorNombre} para el día ${dia}?`;
    if (confirm(confirmMessage)) {
      onDelete(id);
    }
  };

  const getStats = () => {
    const totalTrabajadores = new Set(horarios.map(h => h.trabajadorId)).size;
    const diasCubiertos = new Set(horarios.map(h => h.dia)).size;
    const horasPromedio = horarios.reduce((acc, h) => acc + h.intensidadHoraria, 0) / horarios.length;
    
    return {
      totalTrabajadores,
      diasCubiertos,
      horasPromedio: horasPromedio.toFixed(1)
    };
  };

  const stats = getStats();

  return (
    <div className="horarios-table-container">
      <div className="table-header">
        <h3 className="table-title">Lista de Horarios</h3>
        <div className="table-stats">
          <div className="stat-item">
            👥 {stats.totalTrabajadores} trabajador{stats.totalTrabajadores !== 1 ? 'es' : ''}
          </div>
          <div className="stat-item">
            📅 {stats.diasCubiertos} días
          </div>
          <div className="stat-item">
            ⏱️ {stats.horasPromedio}h promedio
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="horarios-table">
          <thead>
            <tr>
              <th className="col-trabajador">Trabajador</th>
              <th className="col-dia">Día</th>
              <th className="col-hora">Hora Inicio</th>
              <th className="col-hora">Hora Fin</th>
              <th className="col-intensidad">Intensidad</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h, index) => (
              <tr key={h.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <td className="col-trabajador">
                  <div className="worker-info">
                    <div className="worker-avatar">
                      {getInitials(h.trabajadorNombre || `Worker ${h.trabajadorId}`)}
                    </div>
                    <div className="worker-name">
                      {h.trabajadorNombre || `Trabajador #${h.trabajadorId}`}
                    </div>
                  </div>
                </td>
                
                <td className="col-dia">
                  <span 
                    className="day-badge" 
                    style={{ background: getDayColor(h.dia) }}
                  >
                    {h.dia}
                  </span>
                </td>
                
                <td className="col-hora">
                  <span className="time-badge">
                    {formatTime(h.horaInicio)}
                  </span>
                </td>
                
                <td className="col-hora">
                  <span className="time-badge">
                    {formatTime(h.horaFin)}
                  </span>
                </td>
                
                <td className="col-intensidad">
                  <span className="intensity-badge">
                    {h.intensidadHoraria}
                  </span>
                </td>
                
                <td className="col-acciones">
                  <div className="action-buttons">
                    {onEdit && (
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(h)}
                        title="Editar horario"
                      >
                        ✏️ Editar
                      </button>
                    )}
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(h.id, h.trabajadorNombre || 'Trabajador', h.dia)}
                      title="Eliminar horario"
                    >
                      🗑️ Eliminar
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

export default HorariosTable;