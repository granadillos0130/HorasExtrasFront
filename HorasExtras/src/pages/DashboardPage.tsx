import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/DashboardPage.css"

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <h1>Panel Principal</h1>
      <div className="dashboard-options">
        <button onClick={() => navigate("/trabajadores")}>
          Gestionar Trabajadores
        </button>
        <button onClick={() => navigate("/centros")}>
          Gestionar Centros
        </button>
        <button onClick={() => navigate("/registros")}>
          Ver Registros de Trabajo
        </button>
        <button onClick={() => navigate("/estadisticas")}>
          Estadísticas
        </button>
        {/* Puedes seguir agregando botones aquí */}
      </div>
    </div>
  );
};

export default DashboardPage;
