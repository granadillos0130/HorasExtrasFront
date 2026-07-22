import React from "react";
import CentroBuscador from "../shared/CentroBuscador";
import CursoBuscador from "../shared/CursoBuscador";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import { useRegistroForm } from "../../hooks/useRegistroForm";
import "../../styles/components/registros/RegistroForm.css";

interface Props {
  onSuccess: () => void;
  fechaInicial?: string;
}

const RegistrosForm: React.FC<Props> = ({ onSuccess, fechaInicial }) => {
  const {
    loading,
    trabajadores,
    centros,
    cursos,
    analistas,
    tipoDestino,
    formData,
    registrosExistentes,
    showDuplicateWarning,
    verificandoRegistros,
    handleSubmit,
    handleInputChange,
    handleTrabajadorChange,
    handleCentroChange,
    handleCursoChange,
    handleTipoDestinoChange,
    tieneSeleccionValida,
  } = useRegistroForm(onSuccess, fechaInicial);

  // Función para mostrar información sobre el cálculo de horas
  const mostrarInfoCalculoHoras = () => {
    const tiempoDesplazamiento = formData.desplazamientoIda || formData.desplazamientoRegreso;

    if (!tiempoDesplazamiento) return null;

    if (formData.EsConductor) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '12px 15px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          🚛 <strong>CONDUCTOR:</strong> Los desplazamientos se INCLUYEN como tiempo de trabajo
        </div>
      );
    } else {
      return (
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          padding: '12px 15px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          👷 <strong>NO CONDUCTOR:</strong> Los desplazamientos se DESCUENTAN del tiempo trabajado
        </div>
      );
    }
  };

  return (
    <div className="registros-form-container">
      <h3>Crear Nuevo Registro</h3>

      {fechaInicial && (
        <div
          style={{
            background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          📅 Fecha preseleccionada:{" "}
          {new Date(fechaInicial).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      )}

      {/* INDICADOR DE VERIFICACIÓN */}
      {verificandoRegistros && (
        <div style={{
          background: '#f0f9ff',
          color: '#0369a1',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #0369a1',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          🔍 Verificando registros existentes...
        </div>
      )}

      {/* Advertencia de registro duplicado */}
      {showDuplicateWarning && !verificandoRegistros && (
        <div
          style={{
            background: 'linear-gradient(135deg, #ff9500, #ff6b35)',
            color: 'white',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #ff6b35',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <strong>Registro Duplicado Detectado</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                Ya existe{registrosExistentes.length > 1 ? 'n' : ''} <strong>{registrosExistentes.length}</strong> registro{registrosExistentes.length > 1 ? 's' : ''} para este trabajador en esta fecha.
                {registrosExistentes.length === 1
                  ? ' El tiempo de almuerzo NO se descontará de este nuevo registro.'
                  : ' El tiempo de almuerzo ya fue descontado en el primer registro del día.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="registros-form">
        <div className="form-row">
          <div className="form-group">
            <TrabajadorBuscador
              trabajadores={trabajadores}
              value={formData.Trabajador_ID}
              onChange={handleTrabajadorChange}
              label="Trabajador *"
              required
              disabled={verificandoRegistros}
              placeholder={verificandoRegistros ?
                "Verificando registros existentes..." :
                "Buscar por nombre o cédula..."
              }
            />

            {verificandoRegistros && (
              <div style={{
                fontSize: '0.8rem',
                color: '#0369a1',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #0369a1',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Verificando registros...
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Fecha Ingreso  *</label>
            <input
              type="date"
              value={formData.Fecha}
              onChange={(e) => handleInputChange("Fecha", e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>
              Fecha Salida
              <small style={{ display: 'block', color: '#666', fontSize: '0.8rem', marginTop: '4px' }}>
                Solo si sale al día siguiente
              </small>
            </label>
            <input
              type="date"
              value={formData.FechaSalida || ""}
              onChange={(e) => handleInputChange("FechaSalida", e.target.value || undefined)}
              min={formData.Fecha} // ⭐ Validación: no puede ser antes de la fecha de entrada
            />
          </div>
        </div>
        {formData.FechaSalida && formData.FechaSalida !== formData.Fecha && (
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '0.9rem',
            fontWeight: '600',
            gridColumn: '1 / -1'
          }}>
            ⏰ TURNO NOCTURNO: Este registro cruza del {new Date(formData.Fecha).toLocaleDateString('es-ES')}
            al {new Date(formData.FechaSalida).toLocaleDateString('es-ES')}
          </div>
        )}

        {/* Selector de tipo de destino */}
        <div className="form-row">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
              Tipo de Asignación *
            </label>
            <div style={{
              display: 'flex',
              gap: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px solid #e1e8ed'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: tipoDestino === 'centro' ? '#3b82f6' : 'transparent',
                color: tipoDestino === 'centro' ? 'white' : '#374151',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name="tipoDestino"
                  value="centro"
                  checked={tipoDestino === 'centro'}
                  onChange={() => handleTipoDestinoChange('centro')}
                  style={{ transform: 'scale(1.2)' }}
                />
                🏢 Centro de Trabajo
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: tipoDestino === 'curso' ? '#3b82f6' : 'transparent',
                color: tipoDestino === 'curso' ? 'white' : '#374151',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="radio"
                  name="tipoDestino"
                  value="curso"
                  checked={tipoDestino === 'curso'}
                  onChange={() => handleTipoDestinoChange('curso')}
                  style={{ transform: 'scale(1.2)' }}
                />
                📚 Curso de Capacitación
              </label>
            </div>
          </div>
        </div>

        {/* Selector dinámico de centro o curso */}
        {tipoDestino === 'centro' ? (
          <div className="form-row">
            <div className="form-group">
              <CentroBuscador
                centros={centros}
                value={formData.Centro_ID}
                onChange={handleCentroChange}
                label="Centro de Trabajo"
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre del Centro *</label>
              <input
                type="text"
                value={formData.Nombr_Centro}
                onChange={(e) => handleInputChange("Nombr_Centro", e.target.value)}
                placeholder="Escriba el nombre del centro"
                required
              />
            </div>
          </div>
        ) : (
          <div className="form-row">
            <div className="form-group">
              <CursoBuscador
                cursos={cursos}
                value={formData.CursoId || 0}
                onChange={handleCursoChange}
                label="Curso de Capacitación"
                required
              />
            </div>

            {formData.CursoId && formData.CursoNombre && (
              <div className="form-group">
                <label>Información del Curso</label>
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ fontWeight: '600', color: '#1e40af' }}>
                    📚 {formData.CursoNombre}
                  </div>
                  {formData.CursoDescripcion && (
                    <div style={{ color: '#6b7280', marginTop: '4px' }}>
                      {formData.CursoDescripcion}
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    ℹ️ Las horas de curso cuentan para las 44 horas semanales normales
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Hora Ingreso *</label>
            <input
              type="time"
              value={formData.Hora_Ingreso}
              onChange={(e) => handleInputChange("Hora_Ingreso", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Hora Salida *</label>
            <input
              type="time"
              value={formData.Hora_Salida}
              onChange={(e) => handleInputChange("Hora_Salida", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Tiempo Almuerzo *
              {showDuplicateWarning && (
                <span style={{
                  color: '#ff6b35',
                  fontSize: '0.8rem',
                  fontWeight: 'normal',
                  display: 'block'
                }}>
                  {registrosExistentes.length === 1
                    ? '⚠️ No se descontará (ya hay 1 registro)'
                    : '⚠️ No se descontará (múltiples registros)'
                  }
                </span>
              )}
            </label>
            <select
              value={formData.Tiempo_Almuerzo || ""}
              onChange={(e) => handleInputChange("Tiempo_Almuerzo", e.target.value)}
              style={showDuplicateWarning ? { borderColor: '#ff6b35' } : {}}
            >
              <option value="">Sin almuerzo</option>
              <option value="00:30:00">30 minutos</option>
              <option value="01:00:00">1 hora</option>
              <option value="01:30:00">1 hora 30 minutos</option>
              <option value="02:00:00">2 horas</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Analista encargado</label>
            <select
              value={formData.AnalistaId || ""}
              onChange={(e) => handleInputChange("AnalistaId", Number(e.target.value))}
            >
              <option value="">-- Selecciona un analista --</option>
              {analistas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombreCompleto}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sección Conductor */}
        <div
          className="form-section-header"
          style={{
            marginTop: "25px",
            marginBottom: "15px",
            padding: "10px 0",
            borderTop: "2px solid #e1e8ed",
            color: "#666",
          }}
        >
          <h4 style={{ margin: 0, fontSize: "1.1rem" }}>
            🚛 Información del Trabajador
          </h4>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.EsConductor}
                onChange={(e) => handleInputChange("EsConductor", e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                {formData.EsConductor ? '🚛 Es Conductor' : '👷 No es Conductor'}
              </span>
            </label>
            <small style={{ color: "#666", fontSize: "0.8rem", marginTop: '5px', display: 'block' }}>
              {formData.EsConductor
                ? 'Los desplazamientos se incluirán como tiempo de trabajo'
                : 'Los desplazamientos se descontarán del tiempo trabajado'
              }
            </small>
          </div>
        </div>

        {/* Desplazamientos */}
        <div
          className="form-section-header"
          style={{
            marginTop: "25px",
            marginBottom: "15px",
            padding: "10px 0",
            borderTop: "2px solid #e1e8ed",
            color: "#666",
          }}
        >
          <h4 style={{ margin: 0, fontSize: "1.1rem" }}>
            🚗 Tiempos de Desplazamiento (Opcional)
          </h4>
          <p
            style={{ margin: "5px 0 0 0", fontSize: "0.9rem", color: "#888" }}
          >
            Si el trabajador tiene tiempo de desplazamiento, ingrésalo aquí
          </p>
        </div>

        {/* Información sobre el cálculo */}
        {mostrarInfoCalculoHoras() && (
          <div style={{ marginBottom: '15px' }}>
            {mostrarInfoCalculoHoras()}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Desplazamiento Ida</label>
            <input
              type="text"
              value={formData.desplazamientoIda || ""}
              onChange={(e) => handleInputChange("desplazamientoIda", e.target.value)}
              placeholder="Ej: 00:20, 1:15, 45"
            />
            <small style={{ color: "#666", fontSize: "0.8rem" }}>
              Tiempo de ida (formato HH:mm o solo minutos)
            </small>
          </div>

          <div className="form-group">
            <label>Desplazamiento Regreso</label>
            <input
              type="text"
              value={formData.desplazamientoRegreso || ""}
              onChange={(e) => handleInputChange("desplazamientoRegreso", e.target.value)}
              placeholder="Ej: 00:30, 1:00, 20"
            />
            <small style={{ color: "#666", fontSize: "0.8rem" }}>
              Tiempo de regreso (formato HH:mm o solo minutos)
            </small>
          </div>
        </div>

        {/* Información contextual según tipo seleccionado */}
        {tieneSeleccionValida() && (
          <div style={{
            background: tipoDestino === 'curso' ?
              'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
              'linear-gradient(135deg, #06b6d4, #0891b2)',
            color: 'white',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            {tipoDestino === 'curso' ? (
              <div>
                <strong>📚 REGISTRO DE CURSO:</strong>
                <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                  • Se guardará como "CURSO-{formData.CursoId}" en el sistema<br />
                  • Las horas cuentan para las 44 horas semanales normales<br />
                  • Misma lógica de cálculo que centros de trabajo
                </div>
              </div>
            ) : (
              <div>
                <strong>🏢 REGISTRO DE CENTRO:</strong>
                <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                  • Se guardará con ID: "{formData.Centro_ID}"<br />
                  • Aplicación de lógica de 44 horas semanales<br />
                  • Tiempo de almuerzo configurado: 1.5 horas
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || verificandoRegistros || !tieneSeleccionValida()}
          className="btn-submit"
          style={{
            backgroundColor: !tieneSeleccionValida() ? '#9ca3af' : undefined,
            cursor: !tieneSeleccionValida() ? 'not-allowed' : undefined
          }}
        >
          {loading ? "Guardando..." : `Crear Registro ${tipoDestino === 'curso' ? '📚' : '🏢'}`}
          {showDuplicateWarning && " (Registro Adicional)"}
          {formData.EsConductor ? " 🚛" : " 👷"}
        </button>

        {!tieneSeleccionValida() && formData.Trabajador_ID > 0 && (
          <small style={{
            display: 'block',
            textAlign: 'center',
            color: '#ef4444',
            marginTop: '8px',
            fontWeight: '600'
          }}>
            {tipoDestino === 'centro' ?
              'Seleccione un centro de trabajo' :
              'Seleccione un curso de capacitación'
            }
          </small>
        )}
      </form>

      {/* CSS PARA ANIMACIÓN DE LOADING */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrosForm;
