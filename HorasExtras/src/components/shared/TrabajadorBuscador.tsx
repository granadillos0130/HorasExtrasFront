// src/components/shared/TrabajadorBuscador.tsx
import React, { useState, useRef, useEffect } from "react";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/shared/TrabajadorBuscador.css";

interface Props {
  trabajadores: Trabajador[];
  value: number;
  onChange: (trabajadorId: number, trabajador?: Trabajador) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showSelectedInfo?: boolean;
}

const TrabajadorBuscador: React.FC<Props> = ({
  trabajadores,
  value,
  onChange,
  placeholder = "Buscar por nombre o cédula...",
  label = "Trabajador",
  disabled = false,
  required = false,
  className = "",
  showSelectedInfo = true
}) => {
  const [busqueda, setBusqueda] = useState<string>("");
  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<Trabajador | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value && value > 0) {
      const trabajador = trabajadores.find(t => t.id === value);
      if (trabajador) {
        setTrabajadorSeleccionado(trabajador);
        setBusqueda(trabajador.nombre);
      }
    } else {
      setTrabajadorSeleccionado(null);
      setBusqueda("");
    }
  }, [value, trabajadores]);

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

  const trabajadoresFiltrados = trabajadores.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.cedula.toLowerCase().includes(busqueda.toLowerCase())
  ).slice(0, 10);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    setMostrarResultados(true);
    
    // Si se borra todo, notificar que no hay selección
    if (!valor.trim()) {
      setTrabajadorSeleccionado(null);
      onChange(0);
    }
  };

  const handleSelectTrabajador = (trabajador: Trabajador) => {
    setTrabajadorSeleccionado(trabajador);
    setBusqueda(trabajador.nombre);
    setMostrarResultados(false);
    onChange(trabajador.id, trabajador);
  };

  const handleFocus = () => {
    setMostrarResultados(true);
  };

  const handleClear = () => {
    setBusqueda("");
    setTrabajadorSeleccionado(null);
    setMostrarResultados(false);
    onChange(0);
    inputRef.current?.focus();
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
    <div className={`trabajador-buscador ${className}`}>
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
            className={`form-input buscador-input ${trabajadorSeleccionado ? 'has-selection' : ''}`}
            placeholder={placeholder}
            value={busqueda}
            onChange={handleInputChange}
            onFocus={handleFocus}
            disabled={disabled}
            required={required}
          />
          
          {trabajadorSeleccionado && (
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
            👤
          </div>
          
          {mostrarResultados && !disabled && (
            <div ref={dropdownRef} className="resultados-dropdown">
              {trabajadoresFiltrados.length > 0 ? (
                trabajadoresFiltrados.map(trabajador => (
                  <div
                    key={trabajador.id}
                    className={`resultado-item ${trabajadorSeleccionado?.id === trabajador.id ? 'selected' : ''}`}
                    onClick={() => handleSelectTrabajador(trabajador)}
                  >
                    <div className="resultado-content">
                      <div className="resultado-avatar">
                        {getInitials(trabajador.nombre)}
                      </div>
                      <div className="resultado-info">
                        <div className="resultado-nombre">{trabajador.nombre}</div>
                        <div className="resultado-cedula">CC: {trabajador.cedula}</div>
                        <div className="resultado-extra">ID: {trabajador.id}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="resultado-item no-resultados">
                  <div className="no-resultados-icon">❌</div>
                  <div className="no-resultados-text">
                    No se encontraron trabajadores que coincidan con "{busqueda}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {showSelectedInfo && trabajadorSeleccionado && (
          <div className="selected-info">
            <div className="selected-avatar">
              {getInitials(trabajadorSeleccionado.nombre)}
            </div>
            <div className="selected-text">
              <strong>{trabajadorSeleccionado.nombre}</strong>
              <div className="selected-meta">
                CC: {trabajadorSeleccionado.cedula} • ID: {trabajadorSeleccionado.id}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrabajadorBuscador;