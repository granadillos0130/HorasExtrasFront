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

// 🆕 Interface para el nuevo diagnóstico
interface NuevoDiagnostico {
  codigo: string;
  descripcion: string;
}

const initialDiagnosticoState: NuevoDiagnostico = {
  codigo: "",
  descripcion: ""
};

// 🆕 Componente Modal para crear diagnóstico
const CrearDiagnosticoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDiagnosticoCreated: (diagnostico: Diagnostico) => void;
  searchTerm?: string;
}> = ({ isOpen, onClose, onDiagnosticoCreated, searchTerm = "" }) => {
  const [formData, setFormData] = useState<NuevoDiagnostico>(initialDiagnosticoState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-llenar el formulario con el término de búsqueda
  useEffect(() => {
    if (isOpen && searchTerm) {
      // Si parece un código CIE-10, ponerlo en código
      if (/^[A-Z][0-9]/i.test(searchTerm.trim())) {
        setFormData({
          codigo: searchTerm.trim().toUpperCase(),
          descripcion: ""
        });
      } else {
        // Si parece descripción, ponerlo en descripción
        setFormData({
          codigo: "",
          descripcion: searchTerm.trim()
        });
      }
    }
  }, [isOpen, searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const nuevoDiagnostico = await ausenciasService.crearDiagnostico(formData);
      onDiagnosticoCreated(nuevoDiagnostico);
      setFormData(initialDiagnosticoState);
      onClose();
    } catch (error) {
      console.error("Error al crear diagnóstico:", error);
      setError("Error al crear el diagnóstico. Verifique que el código no exista ya.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialDiagnosticoState);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <span>🏥</span>
            Crear Nuevo Diagnóstico
          </h3>
          <button 
            type="button" 
            className="modal-close" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-help-text">
            <strong>💡 Información importante:</strong><br/>
            Estás creando un nuevo diagnóstico CIE-10. Asegúrate de que el código sea correcto 
            y que no exista ya en el sistema. Una vez creado, estará disponible para todos los usuarios.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-form-group">
              <label className="modal-form-label">
                Código CIE-10 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className="modal-form-input"
                placeholder="Ej: A09, M79.1, K59.0"
                required
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
              <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                Formato típico: 1 letra + 2-3 números + opcional punto y más números
              </small>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">
                Descripción <span className="required">*</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="modal-form-textarea"
                placeholder="Descripción detallada del diagnóstico..."
                required
                maxLength={500}
              />
              <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                {formData.descripcion.length}/500 caracteres
              </small>
            </div>

            {error && (
              <div className="modal-error">
                <strong>❌ Error:</strong> {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                <span>❌</span>
                Cancelar
              </button>
              
              <button
                type="submit"
                className="modal-btn modal-btn-primary"
                disabled={isLoading || !formData.codigo.trim() || !formData.descripcion.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Crear Diagnóstico
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

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
  
  // 🆕 Estados para la modal
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value && value > 0) {
      cargarDiagnosticoPorId(value);
    } else {
      setDiagnosticoSeleccionado(null);
      setBusqueda("");
    }
  }, [value, refreshKey]); // 🆕 Agregar refreshKey para actualizar cuando se crea uno nuevo

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

  // 🆕 Manejar cuando se crea un nuevo diagnóstico
  const handleDiagnosticoCreated = (nuevoDiagnostico: Diagnostico) => {
    // Seleccionar automáticamente el nuevo diagnóstico
    setDiagnosticoSeleccionado(nuevoDiagnostico);
    setBusqueda(`${nuevoDiagnostico.codigo} - ${nuevoDiagnostico.descripcion}`);
    setMostrarResultados(false);
    onChange(nuevoDiagnostico.id, nuevoDiagnostico);
    
    // Forzar refresh para futuras búsquedas
    setRefreshKey(prev => prev + 1);
  };

  // 🆕 Abrir modal para crear diagnóstico
  const handleCrearDiagnostico = () => {
    setMostrarResultados(false);
    setShowCrearModal(true);
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
    <>
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
                  // 🆕 Sección mejorada cuando no hay resultados con opción de crear
                  <div className="no-resultados-container">
                    <div className="resultado-item no-resultados">
                      <div className="no-resultados-icon">🔍</div>
                      <div className="no-resultados-text">
                        No se encontraron diagnósticos que coincidan con "<strong>{busqueda}</strong>"
                        <br />
                        <small>Prueba con códigos como "A09" o palabras como "diarrea"</small>
                      </div>
                    </div>
                    <div className="crear-nuevo-container">
                      <button
                        type="button"
                        className="btn-crear-diagnostico"
                        onClick={handleCrearDiagnostico}
                      >
                        <span className="btn-icon">➕</span>
                        <div className="btn-text">
                          <div className="btn-title">Crear Nuevo Diagnóstico</div>
                          <div className="btn-subtitle">"{busqueda}" como nuevo diagnóstico CIE-10</div>
                        </div>
                      </button>
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

      {/* 🆕 Modal para crear diagnóstico */}
      <CrearDiagnosticoModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onDiagnosticoCreated={handleDiagnosticoCreated}
        searchTerm={busqueda}
      />

      {/* 🆕 Estilos adicionales para la modal */}
      <style jsx>{`
        /* Estilos para la modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px 16px 0 0;
        }

        .modal-title {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          font-size: 1.2rem;
          font-weight: bold;
          transition: background 0.2s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-body {
          padding: 30px;
          overflow-y: auto;
          max-height: calc(90vh - 140px);
        }

        .modal-form-group {
          margin-bottom: 20px;
        }

        .modal-form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }

        .modal-form-input, .modal-form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }

        .modal-form-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .modal-form-input:focus, .modal-form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .modal-help-text {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: #92400e;
        }

        .modal-error {
          background: #fee2e2;
          border: 1px solid #ef4444;
          border-radius: 8px;
          padding: 12px;
          color: #7f1d1d;
          font-size: 0.9rem;
          margin-bottom: 20px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .modal-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .modal-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .modal-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .modal-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .required {
          color: #ef4444;
        }

        /* Estilos para el botón crear diagnóstico en la lista */
        .no-resultados-container {
          border-top: 1px solid #e5e7eb;
        }

        .crear-nuevo-container {
          padding: 12px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-top: 1px solid #d1fae5;
        }

        .btn-crear-diagnostico {
          width: 100%;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .btn-crear-diagnostico:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .btn-text {
          text-align: left;
          flex: 1;
        }

        .btn-title {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 2px;
        }

        .btn-subtitle {
          font-size: 0.8rem;
          opacity: 0.9;
          font-weight: normal;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default DiagnosticoBuscador;