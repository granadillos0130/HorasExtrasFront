// src/components/shared/DiagnosticoBuscador.tsx
import React, { useState, useRef, useEffect } from "react";
import { ausenciasService } from "../../api/ausenciasService";
import type { Diagnostico } from "../../types/diagnostico";
import "../../styles/shared/DiagnosticoBuscador.css";

interface Props {
  value?: number;
  onChange: (diagnosticoId: number | undefined, diagnostico?: Diagnostico) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showSelectedInfo?: boolean;
}

const DiagnosticoBuscador: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "Buscar diagnóstico por código o descripción...",
  label = "Diagnóstico",
  disabled = false,
  required = false,
  className = "",
  showSelectedInfo = true
}) => {
  const [busqueda, setBusqueda] = useState<string>("");
  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<Diagnostico | null>(null);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [timerBusqueda, setTimerBusqueda] = useState<NodeJS.Timeout | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value && value > 0) {
      // Si tenemos un ID, buscar el diagnóstico completo
      cargarDiagnosticoPorId(value);
    } else {
      setDiagnosticoSeleccionado(null);
      setBusqueda("");
    }
  }, [value]);

  // Cargar diagnóstico específico por ID
  const cargarDiagnosticoPorId = async (id: number) => {
    try {
      setCargando(true);
      const todosDiagnosticos = await ausenciasService.getAllDiagnosticos();
      const diagnostico = todosDiagnosticos.find(d => d.id === id);
      if (diagnostico) {
        setDiagnosticoSeleccionado(diagnostico);
        setBusqueda(`${diagnostico.codigo} - ${diagnostico.descripcion}`);
      }
    } catch (error) {
      console.error("Error al cargar diagnóstico:", error);
    } finally {
      setCargando(false);
    }
  };

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

  // Cleanup del timer al desmontar
  useEffect(() => {
    return () => {
      if (timerBusqueda) {
        clearTimeout(timerBusqueda);
      }
    };
  }, [timerBusqueda]);

  const buscarDiagnosticos = async (termino: string) => {
    if (termino.trim().length < 2) {
      setDiagnosticos([]);
      return;
    }

    try {
      setCargando(true);
      const resultados = await ausenciasService.buscarDiagnosticos(termino.trim());
      setDiagnosticos(resultados);
    } catch (error) {
      console.error("Error al buscar diagnósticos:", error);
      setDiagnosticos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    setMostrarResultados(true);
    
    // Limpiar timer anterior
    if (timerBusqueda) {
      clearTimeout(timerBusqueda);
    }
    
    // Si se borra todo, notificar que no hay selección
    if (!valor.trim()) {
      setDiagnosticoSeleccionado(null);
      setDiagnosticos([]);
      onChange(undefined);
      return;
    }

    // Configurar nueva búsqueda con delay
    const nuevoTimer = setTimeout(() => {
      buscarDiagnosticos(valor);
    }, 300); // 300ms de delay para evitar muchas peticiones

    setTimerBusqueda(nuevoTimer);
  };

  const handleSelectDiagnostico = (diagnostico: Diagnostico) => {
    setDiagnosticoSeleccionado(diagnostico);
    setBusqueda(`${diagnostico.codigo} - ${diagnostico.descripcion}`);
    setMostrarResultados(false);
    onChange(diagnostico.id, diagnostico);
  };

  const handleFocus = () => {
    setMostrarResultados(true);
    // Si no hay búsqueda, cargar algunos diagnósticos iniciales
    if (!busqueda.trim() && diagnosticos.length === 0 && !cargando) {
      buscarDiagnosticos("A"); // Cargar diagnósticos que empiecen con A como ejemplo
    }
  };

  const handleClear = () => {
    setBusqueda("");
    setDiagnosticoSeleccionado(null);
    setMostrarResultados(false);
    setDiagnosticos([]);
    onChange(undefined);
    inputRef.current?.focus();
  };

  const getIconoCategoria = (codigo: string) => {
    // Iconos basados en los primeros caracteres del código CIE-10
    if (codigo.startsWith('A') || codigo.startsWith('B')) return '🦠'; // Enfermedades infecciosas
    if (codigo.startsWith('C') || codigo.startsWith('D0') || codigo.startsWith('D1') || codigo.startsWith('D2') || codigo.startsWith('D3') || codigo.startsWith('D4')) return '🎗️'; // Neoplasias
    if (codigo.startsWith('D5') || codigo.startsWith('D6') || codigo.startsWith('D7') || codigo.startsWith('D8')) return '🩸'; // Sangre
    if (codigo.startsWith('E')) return '⚡'; // Endocrino
    if (codigo.startsWith('F')) return '🧠'; // Mental
    if (codigo.startsWith('G')) return '🧠'; // Sistema nervioso
    if (codigo.startsWith('H0') || codigo.startsWith('H1') || codigo.startsWith('H2') || codigo.startsWith('H3') || codigo.startsWith('H4') || codigo.startsWith('H5')) return '👁️'; // Ojos
    if (codigo.startsWith('H6') || codigo.startsWith('H7') || codigo.startsWith('H8') || codigo.startsWith('H9')) return '👂'; // Oídos
    if (codigo.startsWith('I')) return '❤️'; // Circulatorio
    if (codigo.startsWith('J')) return '🫁'; // Respiratorio
    if (codigo.startsWith('K')) return '🍽️'; // Digestivo
    if (codigo.startsWith('L')) return '🦴'; // Piel
    if (codigo.startsWith('M')) return '🦴'; // Musculoesquelético
    if (codigo.startsWith('N')) return '🫘'; // Genitourinario
    if (codigo.startsWith('O')) return '🤱'; // Embarazo
    if (codigo.startsWith('P')) return '👶'; // Perinatal
    if (codigo.startsWith('Q')) return '🧬'; // Congénito
    if (codigo.startsWith('R')) return '🔍'; // Síntomas
    if (codigo.startsWith('S') || codigo.startsWith('T')) return '🩹'; // Traumatismos
    if (codigo.startsWith('V') || codigo.startsWith('W') || codigo.startsWith('X') || codigo.startsWith('Y')) return '⚠️'; // Causas externas
    if (codigo.startsWith('Z')) return '🏥'; // Contacto servicios salud
    return '🏥'; // Por defecto
  };

  return (
    <div className={`diagnostico-buscador ${className}`}>
      <div className="form-group">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="required-asterisk">*</span>}
            <small style={{ 
              marginLeft: '10px', 
              fontWeight: 'normal', 
              color: '#6b7280',
              fontSize: '0.8rem'
            }}>
              (Opcional - Solo para citas médicas)
            </small>
          </label>
        )}
        
        <div className="buscador-container">
          <input
            ref={inputRef}
            type="text"
            className={`form-input buscador-input ${diagnosticoSeleccionado ? 'has-selection' : ''}`}
            placeholder={placeholder}
            value={busqueda}
            onChange={handleInputChange}
            onFocus={handleFocus}
            disabled={disabled}
            required={required}
          />
          
          {diagnosticoSeleccionado && (
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
            🏥
          </div>
          
          {mostrarResultados && !disabled && (
            <div ref={dropdownRef} className="resultados-dropdown">
              {cargando ? (
                <div className="resultado-item loading">
                  <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <span>Buscando diagnósticos...</span>
                  </div>
                </div>
              ) : diagnosticos.length > 0 ? (
                diagnosticos.map(diagnostico => (
                  <div
                    key={diagnostico.id}
                    className={`resultado-item ${diagnosticoSeleccionado?.id === diagnostico.id ? 'selected' : ''}`}
                    onClick={() => handleSelectDiagnostico(diagnostico)}
                  >
                    <div className="resultado-content">
                      <div className="resultado-avatar">
                        {getIconoCategoria(diagnostico.codigo)}
                      </div>
                      <div className="resultado-info">
                        <div className="resultado-codigo">{diagnostico.codigo}</div>
                        <div className="resultado-descripcion">{diagnostico.descripcion}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : busqueda.trim().length >= 2 && !cargando ? (
                <div className="resultado-item no-resultados">
                  <div className="no-resultados-icon">🔍</div>
                  <div className="no-resultados-text">
                    No se encontraron diagnósticos que coincidan con "{busqueda}"
                    <br />
                    <small>Prueba con códigos como "A09" o palabras como "diarrea"</small>
                  </div>
                </div>
              ) : busqueda.trim().length < 2 && !cargando ? (
                <div className="resultado-item no-resultados">
                  <div className="no-resultados-icon">💡</div>
                  <div className="no-resultados-text">
                    Escribe al menos 2 caracteres para buscar diagnósticos
                    <br />
                    <small>Ejemplos: "A09", "diarrea", "cefalea"</small>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        {showSelectedInfo && diagnosticoSeleccionado && (
          <div className="selected-info">
            <div className="selected-avatar">
              {getIconoCategoria(diagnosticoSeleccionado.codigo)}
            </div>
            <div className="selected-text">
              <strong>{diagnosticoSeleccionado.codigo}</strong>
              <div className="selected-meta">
                {diagnosticoSeleccionado.descripcion}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticoBuscador;