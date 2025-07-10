import React, { useState } from "react";
import { useTrabajadores } from "../hooks/useTrabajadores";
import { trabajadoresService } from "../api/trabajadoresService";
import "../styles/pages/TrabajadoresPage.css";

const TrabajadoresPage: React.FC = () => {
  const { trabajadores, loading, error, refetch } = useTrabajadores();
  const [adding, setAdding] = useState(false);
  const [nombre, setNombre] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    
    setAdding(true);
    try {
      await trabajadoresService.create({ nombre: nombre.trim() });
      setNombre("");
      refetch();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        await trabajadoresService.delete(id);
        refetch();
      } catch (error) {
        alert("Error al eliminar el trabajador");
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="trabajadores-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Gestión de Trabajadores</h1>
          <p className="page-subtitle">
            Administra la información de tu equipo de trabajo
          </p>
        </div>

        <div className="content-card">
          <div className="form-section">
            <h2>Agregar Nuevo Trabajador</h2>
            <form className="trabajador-form" onSubmit={handleAdd}>
              <input
                type="text"
                placeholder="Nombre completo del trabajador"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="form-input"
                disabled={adding}
              />
              <button 
                type="submit" 
                className="btn-primary"
                disabled={adding || !nombre.trim()}
              >
                {adding ? "Agregando..." : "➕ Agregar"}
              </button>
            </form>
          </div>

          <div className="list-section">
            <h2>Trabajadores Registrados ({trabajadores.length})</h2>
            
            {loading && (
              <div className="loading-message">
                🔄 Cargando trabajadores...
              </div>
            )}
            
            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}
            
            {!loading && trabajadores.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3>No hay trabajadores registrados</h3>
                <p>Comienza agregando tu primer trabajador usando el formulario de arriba.</p>
              </div>
            )}
            
            {!loading && trabajadores.length > 0 && (
              <div className="trabajadores-grid">
                {trabajadores.map((trabajador, index) => (
                  <div key={trabajador.id} className="trabajador-card" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="card-content">
                      <div className="worker-info">
                        <div className="worker-avatar">
                          {getInitials(trabajador.nombre)}
                        </div>
                        <div className="worker-details">
                          <h3>{trabajador.nombre}</h3>
                          <div className="worker-id">ID: {trabajador.id}</div>
                        </div>
                      </div>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(trabajador.id, trabajador.nombre)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrabajadoresPage;