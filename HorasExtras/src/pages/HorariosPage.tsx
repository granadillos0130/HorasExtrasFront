import React, { useState } from "react";
import HorariosLegacyTab from "../components/horarios/HorariosLegacyTab";
import HorariosRotativosTab from "../components/horarios/HorariosRotativosTab";
import "../styles/pages/horariosPage.css";

const HorariosPage: React.FC = () => {
  const [tabActivo, setTabActivo] = useState<"legacy" | "rotativos">("legacy");

  return (
    <div className="horarios-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Gestión de Horarios</h1>
          <p className="page-subtitle">
            Administra los horarios de trabajo de tu equipo
          </p>
        </div>

        {/* Sistema de Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${tabActivo === "legacy" ? "active" : ""}`}
            onClick={() => setTabActivo("legacy")}
          >
            📋 Horarios Individuales
            <span className="tab-description">Sistema tradicional por día</span>
          </button>
          <button
            className={`tab-button ${tabActivo === "rotativos" ? "active" : ""}`}
            onClick={() => setTabActivo("rotativos")}
          >
            🔄 Horarios Rotativos
            <span className="tab-description">Alternancia semanal (Par/Impar)</span>
          </button>
        </div>

        {/* Contenido dinámico según tab */}
        <div className="tab-content">
          {tabActivo === "legacy" ? (
            <HorariosLegacyTab />
          ) : (
            <HorariosRotativosTab />
          )}
        </div>
      </div>
    </div>
  );
};

export default HorariosPage;