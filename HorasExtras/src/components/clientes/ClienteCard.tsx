// src/components/clientes/ClienteCard.tsx
import React, { useState } from "react";
import type { Cliente } from "../../types/cliente";
import type { Centro } from "../../types/centros";
import { centrosService } from "../../api/centrosService";

interface Props {
  cliente: Cliente;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: string) => void;
}

const ClienteCard: React.FC<Props> = ({ cliente, onEditar, onEliminar }) => {
  const [expandido, setExpandido] = useState(false);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [centrosFiltrados, setCentrosFiltrados] = useState<Centro[]>([]);
  const [cargandoCentros, setCargandoCentros] = useState(false);
  const [centrosCargados, setCentrosCargados] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const toggleExpandir = async () => {
    if (!expandido && !centrosCargados) {
      setCargandoCentros(true);
      try {
        const data = await centrosService.obtenerPorCliente(cliente.id);
        setCentros(data);
        setCentrosFiltrados(data);
        setCentrosCargados(true);
      } catch (error) {
        console.error("Error al cargar centros:", error);
      } finally {
        setCargandoCentros(false);
      }
    }
    setExpandido(!expandido);
    
    // Limpiar búsqueda al cerrar
    if (expandido) {
      setBusqueda("");
      setCentrosFiltrados(centros);
    }
  };

  const filtrarCentros = (termino: string) => {
    setBusqueda(termino);
    if (!termino.trim()) {
      setCentrosFiltrados(centros);
      return;
    }

    const terminoLower = termino.toLowerCase();
    const centrosFilt = centros.filter(centro => 
      centro.nombreCentro.toLowerCase().includes(terminoLower) ||
      centro.id.toLowerCase().includes(terminoLower) ||
      centro.fechaHoraInicio?.toLowerCase().includes(terminoLower)
    );
    setCentrosFiltrados(centrosFilt);
  };

  return (
    <div className={`cliente-card ${expandido ? 'expandido' : ''}`}>
      <div className="cliente-card-header">
        <div className="cliente-info">
          <h3>{cliente.nombreCliente}</h3>
          <p><strong>ID:</strong> {cliente.id}</p>
        </div>
        
        <div className="cliente-actions">
          <button 
            className="btn-editar" 
            onClick={() => onEditar(cliente)}
            title="Editar cliente"
          >
            ✏️
          </button>
          <button 
            className="btn-eliminar" 
            onClick={() => onEliminar(cliente.id)}
            title="Eliminar cliente"
          >
            🗑️
          </button>
          <button 
            className={`btn-expandir ${expandido ? 'activo' : ''}`}
            onClick={toggleExpandir}
            title={expandido ? 'Ocultar centros' : 'Ver centros'}
          >
            {expandido ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expandido && (
        <div className="centros-panel">
          <div className="centros-header">
            <div className="centros-title-section">
              <h4>Centros de {cliente.nombreCliente}</h4>
              <span className="centros-count">
                {centrosFiltrados.length} de {centros.length} centro{centros.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {centros.length > 0 && (
              <div className="centros-buscador">
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, ID o fecha..."
                    value={busqueda}
                    onChange={(e) => filtrarCentros(e.target.value)}
                    className="search-input"
                  />
                  {busqueda && (
                    <button 
                      className="clear-search"
                      onClick={() => filtrarCentros("")}
                      title="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="centros-content">
            {cargandoCentros ? (
              <div className="centros-loading">
                <div className="spinner"></div>
                <span>Cargando centros...</span>
              </div>
            ) : centrosFiltrados.length === 0 && busqueda ? (
              <div className="centros-no-results">
                <div className="no-results-icon">🔍</div>
                <p>No se encontraron centros para "<strong>{busqueda}</strong>"</p>
                <button 
                  className="btn-clear-search"
                  onClick={() => filtrarCentros("")}
                >
                  Mostrar todos los centros
                </button>
              </div>
            ) : centrosFiltrados.length === 0 ? (
              <div className="centros-empty">
                <div className="empty-icon">🏢</div>
                <p>Este cliente no tiene centros registrados</p>
              </div>
            ) : (
              <div className="centros-lista">
                {centrosFiltrados.map((centro, index) => (
                  <div 
                    key={centro.id} 
                    className="centro-item"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="centro-info">
                      <h5>{centro.nombreCentro}</h5>
                      <div className="centro-details">
                        <span className="centro-fecha">
                          📅 {centro.fechaHoraInicio}
                        </span>
                        <span className="centro-id">
                          🔢 {centro.id}
                        </span>
                      </div>
                    </div>
                    <div className="centro-status">
                      <div className="status-dot"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteCard;