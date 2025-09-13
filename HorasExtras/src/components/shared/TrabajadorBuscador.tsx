// src/components/shared/TrabajadorBuscador.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/shared/TrabajadorBuscador.css";
import { getImageUrl } from "../../utils/imageUtils";

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
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  // 🆕 REFS MEJORADAS CON CONTROL DE MONTAJE
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🆕 CONTROL DE MONTAJE
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  const handleImageError = useCallback((trabajadorId: number) => {
    setImageErrors(prev => new Set(prev).add(trabajadorId));
  }, []);

  // 🆕 MEMOIZAR TRABAJADORES FILTRADOS PARA OPTIMIZAR PERFORMANCE
  const trabajadoresFiltrados = useMemo(() => {
    if (!busqueda.trim()) return [];

    return trabajadores
      .filter(t =>
        t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.cedula.toLowerCase().includes(busqueda.toLowerCase())
      )
      .slice(0, 10); // Limitar a 10 resultados
  }, [trabajadores, busqueda]);

  // 🆕 SINCRONIZAR CON EL VALOR EXTERNO (MEJORADO)
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (value && value > 0) {
      const trabajador = trabajadores.find(t => t.id === value);
      if (trabajador && trabajador.id !== trabajadorSeleccionado?.id) {
        setTrabajadorSeleccionado(trabajador);
        setBusqueda(trabajador.nombre);
      }
    } else if (value === 0 && trabajadorSeleccionado) {
      // Limpiar selección cuando el valor externo es 0
      setTrabajadorSeleccionado(null);
      setBusqueda("");
    }
  }, [value, trabajadores, trabajadorSeleccionado]);

  // 🆕 CERRAR DROPDOWN AL HACER CLIC FUERA (MEJORADO)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMountedRef.current) return;

      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🆕 HANDLER DE INPUT CON DEBOUNCING
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMountedRef.current) return;

    const valor = e.target.value;
    setBusqueda(valor);

    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce para mostrar resultados
    debounceTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setMostrarResultados(valor.trim().length > 0);

        // Si se borra todo, notificar que no hay selección
        if (!valor.trim()) {
          setTrabajadorSeleccionado(null);
          onChange(0);
        }
      }
    }, 150); // 150ms de debounce
  }, [onChange]);

  // 🆕 HANDLER DE SELECCIÓN MEMOIZADO
  const handleSelectTrabajador = useCallback((trabajador: Trabajador) => {
    if (!isMountedRef.current) return;

    setTrabajadorSeleccionado(trabajador);
    setBusqueda(trabajador.nombre);
    setMostrarResultados(false);
    onChange(trabajador.id, trabajador);
  }, [onChange]);

  // 🆕 HANDLER DE FOCUS MEJORADO
  const handleFocus = useCallback(() => {
    if (!isMountedRef.current || disabled) return;

    // Solo mostrar resultados si hay búsqueda o si hay trabajadores
    if (busqueda.trim() || trabajadores.length > 0) {
      setMostrarResultados(true);
    }
  }, [busqueda, trabajadores.length, disabled]);

  // 🆕 HANDLER DE LIMPIAR MEJORADO
  const handleClear = useCallback(() => {
    if (!isMountedRef.current || disabled) return;

    setBusqueda("");
    setTrabajadorSeleccionado(null);
    setMostrarResultados(false);
    onChange(0);

    // Focus al input después de limpiar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange, disabled]);

  // 🆕 FUNCIÓN MEMOIZADA PARA OBTENER INICIALES
  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  // 🆕 PREVENIR RE-RENDERS INNECESARIOS
  const containerClassName = useMemo(() => `trabajador-buscador ${className}`, [className]);
  const inputClassName = useMemo(() =>
    `form-input buscador-input ${trabajadorSeleccionado ? 'has-selection' : ''}`,
    [trabajadorSeleccionado]
  );

  return (
    <div className={containerClassName}>
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
            className={inputClassName}
            placeholder={placeholder}
            value={busqueda}
            onChange={handleInputChange}
            onFocus={handleFocus}
            disabled={disabled}
            required={required}
            autoComplete="off" // 🆕 Prevenir autocompletado del navegador
            spellCheck={false} // 🆕 Desactivar corrector ortográfico
          />

          {trabajadorSeleccionado && !disabled && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              title="Limpiar selección"
              tabIndex={-1} // 🆕 Evitar que reciba focus
            >
              ✕
            </button>
          )}

          <div className="search-icon">
            👤
          </div>

          {mostrarResultados && !disabled && (
            <div
              ref={dropdownRef}
              className="resultados-dropdown"
              role="listbox" // 🆕 Mejorar accesibilidad
              aria-label="Resultados de búsqueda"
            >
              {trabajadoresFiltrados.length > 0 ? (
                trabajadoresFiltrados.map((trabajador) => (
                  <div
                    key={`trabajador-${trabajador.id}-${trabajador.cedula}`} // 🆕 KEY ÚNICA MEJORADA
                    className={`resultado-item ${trabajadorSeleccionado?.id === trabajador.id ? 'selected' : ''}`}
                    onClick={() => handleSelectTrabajador(trabajador)}
                    role="option" // 🆕 Accesibilidad
                    aria-selected={trabajadorSeleccionado?.id === trabajador.id}
                    onMouseDown={(e) => e.preventDefault()} // 🆕 Prevenir pérdida de focus del input
                  >
                    <div className="resultado-content">
                      <div className="resultado-avatar">
                        {trabajador.imagen_Url && !imageErrors.has(trabajador.id) ? (
                          <img
                            src={getImageUrl(trabajador.imagen_Url)}
                            alt={trabajador.nombre}
                            className="avatar-image"
                            onError={() => handleImageError(trabajador.id)}
                          />
                        ) : (
                          <span className="avatar-initials">
                            {getInitials(trabajador.nombre)}
                          </span>
                        )}
                      </div>

                      <div className="resultado-info">
                        <div className="resultado-nombre">{trabajador.nombre}</div>
                        <div className="resultado-cedula">CC: {trabajador.cedula}</div>
                        <div className="resultado-extra">ID: {trabajador.id}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : busqueda.trim() ? (
                <div
                  className="resultado-item no-resultados"
                  role="option"
                  aria-selected={false}
                >
                  <div className="no-resultados-icon">❌</div>
                  <div className="no-resultados-text">
                    No se encontraron trabajadores que coincidan con "{busqueda}"
                  </div>
                </div>
              ) : (
                <div
                  className="resultado-item no-resultados"
                  role="option"
                  aria-selected={false}
                >
                  <div className="no-resultados-icon">🔍</div>
                  <div className="no-resultados-text">
                    Escribe para buscar trabajadores...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {showSelectedInfo && trabajadorSeleccionado && (
          <div className="selected-info">
            <div className="selected-avatar">
              {trabajadorSeleccionado.imagen_Url && !imageErrors.has(trabajadorSeleccionado.id) ? (
                <img
                  src={getImageUrl(trabajadorSeleccionado.imagen_Url)}
                  alt={trabajadorSeleccionado.nombre}
                  className="avatar-image"
                  onError={() => handleImageError(trabajadorSeleccionado.id)}
                />
              ) : (
                <span className="avatar-initials">
                  {getInitials(trabajadorSeleccionado.nombre)}
                </span>
              )}
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

// 🆕 MEMOIZAR EL COMPONENTE PARA EVITAR RE-RENDERS INNECESARIOS
export default React.memo(TrabajadorBuscador);