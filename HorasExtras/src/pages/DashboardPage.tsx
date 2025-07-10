import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/DashboardPage.css";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      id: "trabajadores",
      title: "Trabajadores",
      description: "Gestiona la información de todos los trabajadores registrados en el sistema",
      icon: "👥",
      path: "/trabajadores",
      className: "trabajadores"
    },
    {
      id: "centros",
      title: "Centros de Trabajo",
      description: "Administra los diferentes centros y ubicaciones de trabajo",
      icon: "🏢",
      path: "/centros",
      className: "centros"
    },
    {
      id: "registros",
      title: "Registros de Trabajo",
      description: "Consulta y analiza los registros de horas trabajadas y extras",
      icon: "📊",
      path: "/registros",
      className: "registros"
    },
    {
      id: "estadisticas",
      title: "Estadísticas",
      description: "Visualiza reportes y análisis detallados del rendimiento laboral",
      icon: "📈",
      path: "/estadisticas",
      className: "estadisticas"
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>HorasExtras</h1>
        <p className="dashboard-subtitle">
          Sistema de Gestión de Horas de Trabajo
        </p>
      </div>
      
      <div className="dashboard-grid">
        {dashboardItems.map((item) => (
          <div 
            key={item.id}
            className={`dashboard-card ${item.className}`}
            onClick={() => navigate(item.path)}
          >
            <div className="card-icon">
              {item.icon}
            </div>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-description">{item.description}</p>
            <button className="card-button">
              Acceder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;