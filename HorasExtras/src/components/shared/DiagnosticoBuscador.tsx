// src/components/shared/DiagnosticoBuscador.tsx
import React from "react";
import type { Diagnostico } from "../../types/diagnostico";
import { useDiagnosticoBuscador } from "../../hooks/shared/useDiagnosticoBuscador";
import { CrearDiagnosticoModal } from "./CrearDiagnosticoModal";
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
  const {
    busqueda,
    mostrarResultados,
    diagnosticoSeleccionado,
    diagnosticos,
    cargando,
    showCrearModal,
    setShowCrearModal,
    inputRef,
    dropdownRef,
    handleInputChange,
    handleSelectDiagnostico,
    handleFocus,
    handleClear,
    handleDiagnosticoCreated,
    handleCrearDiagnostico,
  } = useDiagnosticoBuscador(value, onChange);

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
                  // Sección cuando no hay resultados con opción de crear
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

      {/* Modal para crear diagnóstico */}
      <CrearDiagnosticoModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onDiagnosticoCreated={handleDiagnosticoCreated}
        searchTerm={busqueda}
      />

      {/* Estilos del dropdown de "sin resultados / crear nuevo" — no duplican
          DiagnosticoBuscador.css (estas clases no existen en ese archivo).
          Los estilos de la modal en sí viven en CrearDiagnosticoModal.tsx. */}
      <style>{`
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
      `}</style>
    </>
  );
};

export default DiagnosticoBuscador;
