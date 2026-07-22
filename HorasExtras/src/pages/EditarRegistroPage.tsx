import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CentroBuscador from "../components/shared/CentroBuscador";
import { useEditarRegistro } from "../hooks/useEditarRegistro";

const EditarRegistroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return') || '/registros';

  const {
    registro,
    loading,
    saving,
    error,
    trabajadores,
    centros,
    formData,
    handleInputChange,
    handleCentroChange,
    handleGuardar,
    handleCancelar,
    registrosExistentes,
    showDuplicateWarning,
    verificandoRegistros,
  } = useEditarRegistro(id, returnUrl);

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
          fontWeight: '600',
          marginBottom: '15px'
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
          fontWeight: '600',
          marginBottom: '15px'
        }}>
          👷 <strong>NO CONDUCTOR:</strong> Los desplazamientos se DESCUENTAN del tiempo trabajado
        </div>
      );
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>🔄</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
            Cargando datos del registro...
          </div>
        </div>
      </div>
    );
  }

  if (error && !registro) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>Error</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
          <button
            onClick={handleCancelar}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            ✏️ Editar Registro
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Modifica los datos del registro de trabajo
          </p>
        </div>

        {/* Información del registro original */}
        {registro && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#333',
              fontSize: '1.3rem',
              textAlign: 'center',
              padding: '15px',
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              borderRadius: '10px',
              border: '2px solid #0ea5e9'
            }}>
              📋 Información Actual del Registro
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              <div style={{ padding: '15px', background: '#f8fafb', borderRadius: '8px' }}>
                <strong style={{ color: '#1f2937' }}>👤 Trabajador:</strong><br />
                <span style={{ color: '#4b5563' }}>{registro.trabajadorNombre}</span>
              </div>
              <div style={{ padding: '15px', background: '#f8fafb', borderRadius: '8px' }}>
                <strong style={{ color: '#1f2937' }}>🏢 Centro:</strong><br />
                <span style={{ color: '#4b5563' }}>{registro.nombreCentro}</span>
              </div>
              <div style={{ padding: '15px', background: '#f8fafb', borderRadius: '8px' }}>
                <strong style={{ color: '#1f2937' }}>📅 Fecha:</strong><br />
                <span style={{ color: '#4b5563' }}>{formatearFecha(registro.fecha)}</span>
              </div>
              <div style={{ padding: '15px', background: '#f8fafb', borderRadius: '8px' }}>
                <strong style={{ color: '#1f2937' }}>⏰ Horario:</strong><br />
                <span style={{ color: '#4b5563' }}>
                  {registro.horaIngreso?.substring(0, 5)} - {registro.horaSalida?.substring(0, 5)}
                </span>
              </div>
              <div style={{ padding: '15px', background: '#f0fdf4', borderRadius: '8px' }}>
                <strong style={{ color: '#15803d' }}>📊 Total Horas:</strong><br />
                <span style={{ color: '#166534', fontSize: '1.1rem', fontWeight: '600' }}>
                  {formatearHoras(registro.totalHoras)}
                </span>
              </div>
              <div style={{ padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
                <strong style={{ color: '#92400e' }}>🌅 Extras Diurnas:</strong><br />
                <span style={{ color: '#a16207' }}>{formatearHoras(registro.horasExtrasDiurnas)}</span>
              </div>
            </div>
          </div>
        )}

        {/* INDICADOR DE VERIFICACIÓN */}
        {verificandoRegistros && (
          <div style={{
            background: '#f0f9ff',
            color: '#0369a1',
            padding: '12px 15px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #0369a1',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            🔍 Verificando otros registros en esta fecha...
          </div>
        )}

        {/* Advertencia de registro duplicado */}
        {showDuplicateWarning && !verificandoRegistros && (
          <div style={{
            background: 'linear-gradient(135deg, #ff9500, #ff6b35)',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #ff6b35',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <strong>Otros Registros Detectados</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                  Además de este registro que está editando, ya existe{registrosExistentes.length > 1 ? 'n' : ''} <strong>{registrosExistentes.length}</strong> registro{registrosExistentes.length > 1 ? 's' : ''} más para este trabajador en esta fecha.
                  {registrosExistentes.length === 0
                    ? (formData.Tiempo_Almuerzo ? '✓ Se descontará normalmente' : '✓ Sin descuento de almuerzo')
                    : '⚠️ No se descontará (hay otros registros)'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {/* Mensaje de error */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
              border: '2px solid #ef4444',
              color: '#dc2626',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              ❌ {error}
            </div>
          )}

          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {/* Fila 1: Trabajador y Centro */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  fontSize: '1rem'
                }}>
                  👤 Trabajador *
                </label>
                <select
                  value={formData.Trabajador_ID}
                  onChange={(e) => handleInputChange('Trabajador_ID', Number(e.target.value))}
                  required
                  disabled={verificandoRegistros}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: verificandoRegistros ? '#f3f4f6' : '#f9fafb',
                    cursor: verificandoRegistros ? 'wait' : 'pointer'
                  }}
                >
                  <option value={0}>
                    {verificandoRegistros ? "Verificando registros..." : "Seleccionar trabajador..."}
                  </option>
                  {trabajadores.map(trabajador => (
                    <option key={trabajador.id} value={trabajador.id}>
                      {trabajador.nombre}
                    </option>
                  ))}
                </select>

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
                    Verificando registros existentes...
                  </div>
                )}
              </div>

              {/* CENTRO CON BUSCADOR */}
              <div>
                <CentroBuscador
                  centros={centros}
                  value={formData.Centro_ID}
                  onChange={handleCentroChange}
                  label="🏢 Centro de Trabajo"
                  placeholder="Buscar centro por nombre o ID..."
                  required
                  showSelectedInfo={true}
                />
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333'
              }}>
                📅 Fecha *
              </label>
              <input
                type="date"
                value={formData.Fecha}
                onChange={(e) => handleInputChange('Fecha', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Horarios */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '15px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  🕐 Hora Ingreso *
                </label>
                <input
                  type="time"
                  value={formData.Hora_Ingreso}
                  onChange={(e) => handleInputChange('Hora_Ingreso', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  🕐 Hora Salida *
                </label>
                <input
                  type="time"
                  value={formData.Hora_Salida}
                  onChange={(e) => handleInputChange('Hora_Salida', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  🍽️ Tiempo Almuerzo
                  {showDuplicateWarning && (
                    <span style={{
                      color: '#ff6b35',
                      fontSize: '0.8rem',
                      fontWeight: 'normal',
                      display: 'block'
                    }}>
                      {registrosExistentes.length === 0
                        ? '✓ Se descontará normalmente'
                        : '⚠️ No se descontará (hay otros registros)'
                      }
                    </span>
                  )}
                </label>
                <select
                  value={formData.Tiempo_Almuerzo || ""} // Convertir null a string vacío
                  onChange={(e) => handleInputChange('Tiempo_Almuerzo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: showDuplicateWarning ? '2px solid #ff6b35' : '2px solid #e1e8ed',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Sin almuerzo</option>
                  <option value="00:30:00">30 minutos</option>
                  <option value="01:00:00">1 hora</option>
                  <option value="01:30:00">1.5 horas</option>
                  <option value="02:00:00">2 horas</option>
                </select>
              </div>
            </div>

            {/* Información sobre el cálculo */}
            {mostrarInfoCalculoHoras()}

            {/* Desplazamientos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  🚗 Desplazamiento Ida
                </label>
                <input
                  type="time"
                  value={formData.desplazamientoIda || ""}
                  onChange={(e) => handleInputChange('desplazamientoIda', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                />
                <small style={{ color: "#666", fontSize: "0.8rem", marginTop: '5px', display: 'block' }}>
                  Tiempo de desplazamiento de casa al trabajo
                </small>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  🚗 Desplazamiento Regreso
                </label>
                <input
                  type="time"
                  value={formData.desplazamientoRegreso || ""}
                  onChange={(e) => handleInputChange('desplazamientoRegreso', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                />
                <small style={{ color: "#666", fontSize: "0.8rem", marginTop: '5px', display: 'block' }}>
                  Tiempo de desplazamiento del trabajo a casa
                </small>
              </div>
            </div>

            {/* Es Conductor */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: '600',
                color: '#333',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.EsConductor}
                  onChange={(e) => handleInputChange('EsConductor', e.target.checked)}
                  style={{
                    marginRight: '10px',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                🚛 ¿Es conductor en este registro?
              </label>
              <p style={{
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '5px',
                marginLeft: '28px'
              }}>
                {formData.EsConductor
                  ? 'Los desplazamientos se incluirán como tiempo de trabajo'
                  : 'Los desplazamientos se descontarán del tiempo trabajado'
                }
              </p>
            </div>
          </div>

          {/* Botones */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            marginTop: '40px'
          }}>
            <button
              onClick={handleCancelar}
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                opacity: saving ? 0.7 : 1
              }}
            >
              ❌ Cancelar
            </button>

            <button
              onClick={handleGuardar}
              disabled={saving || verificandoRegistros}
              style={{
                background: saving || verificandoRegistros
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                  : 'linear-gradient(135deg, #22c55e, #15803d)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                cursor: (saving || verificandoRegistros) ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                minWidth: '160px'
              }}
            >
              {saving ? '🔄 Guardando...' :
                verificandoRegistros ? '🔍 Verificando...' :
                  '💾 Guardar Cambios'}
              {!saving && !verificandoRegistros && (formData.EsConductor ? " 🚛" : " 👷")}
              {showDuplicateWarning && !saving && !verificandoRegistros && " (Con otros registros)"}
            </button>
          </div>
        </div>
      </div>

      {/* CSS PARA ANIMACIÓN DE LOADING */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EditarRegistroPage;
