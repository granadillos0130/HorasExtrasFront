import React, { useState } from "react";
import CatalogoHorarios from "./CatalogoHorarios";
import AsignacionesRotativas from "./AsignacionesRotativas";

const HorariosRotativosTab: React.FC = () => {
  const [vistaActiva, setVistaActiva] = useState<"catalogo" | "asignaciones">("asignaciones");

  return (
    <div className="horarios-rotativos-container">
      {/* Información del sistema */}
      <div className="info-banner">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <strong>Sistema de Horarios Rotativos</strong>
          <p>
            Los horarios rotativos permiten alternar entre dos configuraciones semanalmente (semanas pares e impares).
            Ideal para trabajadores con turnos variables que incluyen sábados alternos.
          </p>
        </div>
      </div>

      {/* Sub-navegación */}
      <div className="sub-tabs">
        <button
          className={`sub-tab ${vistaActiva === "asignaciones" ? "active" : ""}`}
          onClick={() => setVistaActiva("asignaciones")}
        >
          <span className="sub-tab-icon">👥</span>
          <span className="sub-tab-label">Asignaciones Activas</span>
          <span className="sub-tab-description">Ver quién usa qué horario</span>
        </button>
        <button
          className={`sub-tab ${vistaActiva === "catalogo" ? "active" : ""}`}
          onClick={() => setVistaActiva("catalogo")}
        >
          <span className="sub-tab-icon">📚</span>
          <span className="sub-tab-label">Catálogo de Horarios</span>
          <span className="sub-tab-description">Gestionar horarios disponibles</span>
        </button>
      </div>

      {/* Contenido dinámico */}
      <div className="sub-tab-content">
        {vistaActiva === "catalogo" ? (
          <CatalogoHorarios />
        ) : (
          <AsignacionesRotativas />
        )}
      </div>
    </div>
  );
};

export default HorariosRotativosTab;