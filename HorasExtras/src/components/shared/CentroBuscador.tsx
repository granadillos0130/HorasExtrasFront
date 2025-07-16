// src/components/shared/CentroBuscador.tsx
import React, { useState, useRef, useEffect } from "react";
import type { Centro } from "../../types/centros";
import "../../styles/shared/CentroBuscador.css";

interface Props {
  centros: Centro[];
  value: string;
  onChange: (centroId: string, centro?: Centro) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showSelectedInfo?: boolean;
}

const CentroBuscador: React.FC<Props> = ({
  centros,
  value,
  onChange,
  placeholder = "Buscar por nombre o ID...",
  label = "Centro de Trabajo",
  disabled = false,
  required = false,
  className = "",
  showSelectedInfo = true
}) => {
  const [busqueda, setBusqueda] = useState<string>("");
  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);
  const [centroSeleccionado, setCentroSeleccionado] = useState<Centro | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value) {
      const centro = centros.find(c => c.id === value);
      if (centro) {
        setCentroSeleccionado(centro);
        setBusqueda(centro.nombreCentro);
      }
    } else {
      setCentroSeleccionado(null);
      setBusqueda("");
    }
  }, [value, centros]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const centrosFiltrados = centros.filter(c =>
    c.nombreCentro.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.id.toLowerCase().includes(busqueda.toLowerCase())
  ).slice(0, 10);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    setMostrarResultados(true);
    
    // Si se borra todo, notificar que no hay selección
    if (!valor.trim()) {
      setCentroSeleccionado(null);
      onChange("");
    }
  };

  const handleSelectCentro = (centro: Centro) => {
    setCentroSeleccionado(centro);
    setBusqueda(centro.nombreCentro);
    setMostrarResultados(false);
    onChange(centro.id, centro);
  };

  const handleFocus = () => {
    setMostrarResultados(true);
  };

  const handleClear = () => {
    setBusqueda("");
    setCentroSeleccionado(null);
    setMostrarResultados(false);
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`centro-buscador ${className}`}>
      <div className="form-group">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="required-asterisk">*</span>}
          </label>
        )}
        
        <div className="buscador-container">
          <input
            ref={inputRef}
            type="text"
            className={`form-input buscador-input ${centroSeleccionado ? 'has-selection' : ''}`}
            placeholder={placeholder}
            value={busqueda}
            onChange={handleInputChange}
            onFocus={handleFocus}
            disabled={disabled}
            required={required}
          />
          
          {centroSeleccionado && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              title="Limpiar selección"
              disabled={disabled}
            >
              ✕
            </button>
          )}
          
          <div className="search-icon">
            🔍
          </div>
          
          {mostrarResultados && !disabled && (
            <div ref={dropdownRef} className="resultados-dropdown">
              {centrosFiltrados.length > 0 ? (
                centrosFiltrados.map(centro => (
                  <div
                    key={centro.id}
                    className={`resultado-item ${centroSeleccionado?.id === centro.id ? 'selected' : ''}`}
                    onClick={() => handleSelectCentro(centro)}
                  >
                    <div className="resultado-content">
                      <div className="resultado-icon">🏢</div>
                      <div className="resultado-info">
                        <div className="resultado-nombre">{centro.nombreCentro}</div>
                        <div className="resultado-id">ID: {centro.id}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="resultado-item no-resultados">
                  <div className="no-resultados-icon">❌</div>
                  <div className="no-resultados-text">
                    No se encontraron centros que coincidan con "{busqueda}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {showSelectedInfo && centroSeleccionado && (
          <div className="selected-info">
            <div className="selected-icon">✅</div>
            <div className="selected-text">
              <strong>{centroSeleccionado.nombreCentro}</strong> (ID: {centroSeleccionado.id})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CentroBuscador;