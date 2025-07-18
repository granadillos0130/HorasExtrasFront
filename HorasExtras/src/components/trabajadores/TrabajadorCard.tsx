import React from "react";
import { useNavigate } from "react-router-dom";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/TrabajadorCard.css";
import { trabajadoresService } from "../../api/trabajadoresService";

interface Props {
  trabajador: Trabajador;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  onEstadoChange?: () => void; // Opcional, para refrescar lista
}

const TrabajadorCard: React.FC<Props> = ({ trabajador, onDelete, onView, onEstadoChange }) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleEdit = () => {
    navigate(`/trabajadores/editar/${trabajador.id}`);
  };

  const cambiarEstado = async () => {
    const nuevoEstado = trabajador.estado === "Vigente" ? "No Vigente" : "Vigente";
    try {
      await trabajadoresService.cambiarEstado(trabajador.id, nuevoEstado);
      if (onEstadoChange) onEstadoChange();
    } catch (error) {
      console.error("Error al cambiar el estado", error);
    }
  };

  return (
    <div className="trabajador-card">
      <div className="card-content">
        {/* Avatar e info básica */}
        <div className="worker-main-info">
          <div className="worker-avatar">
            <span className="avatar-initials">{getInitials(trabajador.nombre)}</span>
          </div>
          <div className="worker-details">
            <h3 className="worker-name">{trabajador.nombre}</h3>
            <div className="worker-meta">
              <span className="worker-id">ID: {trabajador.id}</span>
              <span className="worker-cedula">CC: {trabajador.cedula}</span>
              <span className={`worker-estado ${trabajador.estado === "Vigente" ? "vigente" : "no-vigente"}`}>
                Estado: {trabajador.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="card-actions">
          <button className="btn-view-details" onClick={() => onView(trabajador.id)}>
            <span className="btn-icon">👁️</span>
            Ver Detalles
          </button>

          <button className="btn-edit" onClick={handleEdit} title="Editar trabajador">
            <span className="btn-icon">✏️</span>
            Editar
          </button>

          <button className="btn-delete" onClick={() => onDelete(trabajador.id)} title="Eliminar trabajador">
            🗑️
          </button>

          <button
            className="btn-intensidad"
            onClick={() => navigate(`/trabajadores/${trabajador.id}/intensidad`)}
            title="Ver intensidad horaria"
          >
            <span className="btn-icon">📊</span>
            Intensidad Horaria
          </button>

         <button
  className="btn-estado"
  onClick={cambiarEstado}
  title={trabajador.estado === "Vigente" ? "Pasar a No Vigente" : "Pasar a Vigente"}
>
  {trabajador.estado === "Vigente" ? "Marcar como No Vigente" : "Marcar como Vigente"}
</button>

        </div>
      </div>
    </div>
  );
};

export default TrabajadorCard;
