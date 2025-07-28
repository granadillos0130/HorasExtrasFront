import React, { useState, useEffect } from "react";
import { centrosService } from "../api/centrosService";
import CentroForm from "../components/centros/CentroForm";
import type { CentroPorMes } from "../types/centros";

const CentrosPage: React.FC = () => {
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [centrosDelMes, setCentrosDelMes] = useState<CentroPorMes[]>([]);
  const [centroSeleccionado, setCentroSeleccionado] = useState<CentroPorMes | null>(null);
  const [vistaActual, setVistaActual] = useState<'info' | 'participantes' | 'crear' | null>(null);
  const [loading, setLoading] = useState(false);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Cargar centros cuando se selecciona un mes
  useEffect(() => {
    if (mesSeleccionado !== null) {
      cargarCentrosDelMes();
    }
  }, [mesSeleccionado, añoSeleccionado]);

  const cargarCentrosDelMes = async () => {
    if (mesSeleccionado === null) return;

    setLoading(true);
    try {
      const data = await centrosService.obtenerPorMes(añoSeleccionado, mesSeleccionado);
      setCentrosDelMes(data);
    } catch (error) {
      console.error("Error al cargar centros del mes:", error);
      setCentrosDelMes([]);
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setCentroSeleccionado(null);
    setVistaActual(null);
  };

  const handleCentroCreado = () => {
    // Recargar los centros del mes actual si hay uno seleccionado
    if (mesSeleccionado !== null) {
      cargarCentrosDelMes();
    }
    cerrarModal();
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🏢 Dashboard de Centros de Trabajo
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Visualiza todos los centros activos por mes con sus trabajadores
          </p>
        </div>

        {/* Header con botón crear centro */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div></div> {/* Espaciador */}
          <button
            onClick={() => setVistaActual('crear')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            ➕ Crear Nuevo Centro
          </button>
        </div>

        {/* Selector de año */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#333',
              marginBottom: '15px',
              fontSize: '1.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              📅 Selecciona el Año
            </label>
            <select
              value={añoSeleccionado}
              onChange={(e) => {
                setAñoSeleccionado(Number(e.target.value));
                setMesSeleccionado(null);
                setCentroSeleccionado(null);
              }}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e1e8ed',
                borderRadius: '10px',
                fontSize: '1.2rem',
                background: '#f8fafb',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: '600'
              }}
            >
              {[2023, 2024, 2025, 2026].map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vista de meses */}
        {mesSeleccionado === null && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              textAlign: 'center',
              marginBottom: '30px',
              color: '#333',
              fontSize: '1.8rem',
              fontWeight: '600'
            }}>
              🗓️ Selecciona el Mes - {añoSeleccionado}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {meses.map((mes, index) => (
                <button
                  key={index}
                  onClick={() => setMesSeleccionado(index + 1)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    padding: '20px',
                    borderRadius: '15px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(102,126,234,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {mes}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vista de centros del mes */}
        {mesSeleccionado !== null && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '30px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <h2 style={{
                margin: 0,
                color: '#333',
                fontSize: '1.8rem',
                fontWeight: '600'
              }}>
                🏢 Centros Activos - {meses[mesSeleccionado - 1]} {añoSeleccionado}
                {loading && (
                  <span style={{ 
                    fontSize: '1rem', 
                    color: '#666', 
                    marginLeft: '10px' 
                  }}>
                    🔄 Cargando...
                  </span>
                )}
              </h2>
              <button
                onClick={() => setMesSeleccionado(null)}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}
              >
                ← Volver a Meses
              </button>
            </div>

            {loading ? (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                fontSize: '1.5rem',
                color: '#667eea'
              }}>
                🔄 Cargando centros del mes...
              </div>
            ) : centrosDelMes.length > 0 ? (
              <div>
                <div style={{
                  marginBottom: '25px',
                  padding: '15px 20px',
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  color: 'white',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
                    ✅ {centrosDelMes.length} Centro{centrosDelMes.length !== 1 ? 's' : ''} Encontrado{centrosDelMes.length !== 1 ? 's' : ''}
                  </h4>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                    Total de trabajadores: {centrosDelMes.reduce((total, centro) => total + centro.trabajadores.length, 0)}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '20px'
                }}>
                  {centrosDelMes.map((centro) => (
                    <div key={centro.centroId} style={{
                      background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
                      padding: '25px',
                      borderRadius: '15px',
                      border: '2px solid #e1e8ed',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    }}
                    >
                      {/* Header del centro */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                          color: 'white',
                          width: '60px',
                          height: '60px',
                          borderRadius: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem'
                        }}>
                          🏢
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            margin: '0 0 5px 0',
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            color: '#333'
                          }}>
                            {centro.centroNombre}
                          </h3>
                          <p style={{
                            margin: 0,
                            color: '#666',
                            fontSize: '0.9rem'
                          }}>
                            ID: {centro.centroId}
                          </p>
                        </div>
                      </div>

                      {/* Información básica */}
                      <div style={{
                        background: '#f0f9ff',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: '1px solid #bfdbfe'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '10px',
                          fontSize: '0.9rem'
                        }}>
                          <div>
                            <strong style={{ color: '#1d4ed8' }}>📅 Inicio:</strong><br />
                            {formatearFecha(centro.fechaInicio)}
                          </div>
                          <div>
                            <strong style={{ color: '#1d4ed8' }}>📅 Final:</strong><br />
                            {centro.fechaFinal ? formatearFecha(centro.fechaFinal) : 'Vigente'}
                          </div>
                          <div>
                            <strong style={{ color: '#1d4ed8' }}>👥 Trabajadores:</strong><br />
                            {centro.trabajadores.length}
                          </div>
                          <div>
                            <strong style={{ color: '#1d4ed8' }}>⏰ Total Horas:</strong><br />
                            {formatearHoras(centro.trabajadores.reduce((sum, t) => sum + t.totalHoras, 0))}
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div style={{
                        display: 'flex',
                        gap: '10px'
                      }}>
                        <button
                          onClick={() => {
                            setCentroSeleccionado(centro);
                            setVistaActual('info');
                          }}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #22c55e, #15803d)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          📊 Ver Información
                        </button>
                        <button
                          onClick={() => {
                            setCentroSeleccionado(centro);
                            setVistaActual('participantes');
                          }}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          👥 Participantes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                color: '#666'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏢</div>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
                  No hay centros activos
                </h3>
                <p style={{ marginBottom: '0', color: '#666' }}>
                  No se encontraron centros con actividad en {meses[mesSeleccionado - 1]} {añoSeleccionado}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal de información del centro */}
        {centroSeleccionado && vistaActual && vistaActual !== 'crear' && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px',
                paddingBottom: '15px',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 5px 0',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    🏢 {centroSeleccionado.centroNombre}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    {vistaActual === 'info' ? '📊 Información Básica' : '👥 Lista de Participantes'}
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ❌
                </button>
              </div>

              {vistaActual === 'info' ? (
                // Vista de información básica
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏢</div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Centro ID</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                        {centroSeleccionado.centroId}
                      </p>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #22c55e, #15803d)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Total Trabajadores</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                        {centroSeleccionado.trabajadores.length}
                      </p>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏰</div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Total Horas</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                        {formatearHoras(centroSeleccionado.trabajadores.reduce((sum, t) => sum + t.totalHoras, 0))}
                      </p>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Horas Extras</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                        {formatearHoras(centroSeleccionado.trabajadores.reduce((sum, t) => sum + t.extrasDiurnas + t.extrasNocturnas, 0))}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: '#f8fafb',
                    padding: '20px',
                    borderRadius: '15px',
                    border: '2px solid #e1e8ed'
                  }}>
                    <h4 style={{
                      margin: '0 0 15px 0',
                      color: '#333',
                      fontSize: '1.2rem'
                    }}>
                      📅 Período de Actividad
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px'
                    }}>
                      <div>
                        <strong style={{ color: '#22c55e' }}>Fecha de Inicio:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {formatearFecha(centroSeleccionado.fechaInicio)}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: '#22c55e' }}>Fecha Final:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {centroSeleccionado.fechaFinal ? formatearFecha(centroSeleccionado.fechaFinal) : '🟢 Vigente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '20px',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => setVistaActual('participantes')}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}
                    >
                      👥 Ver Lista de Participantes
                    </button>
                  </div>
                </div>
              ) : (
                // Vista de participantes
                <div>
                  <div style={{
                    marginBottom: '20px',
                    padding: '15px 20px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
                      👥 {centroSeleccionado.trabajadores.length} Trabajador{centroSeleccionado.trabajadores.length !== 1 ? 'es' : ''} Registrado{centroSeleccionado.trabajadores.length !== 1 ? 's' : ''}
                    </h4>
                    <button
                      onClick={() => setVistaActual('info')}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      📊 Ver Información
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gap: '12px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    padding: '10px'
                  }}>
                    {centroSeleccionado.trabajadores.map((trabajador) => (
                      <div key={trabajador.trabajadorId} style={{
                        background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
                        padding: '20px',
                        borderRadius: '15px',
                        border: '2px solid #e1e8ed',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                      }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                          }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #22c55e, #15803d)',
                              color: 'white',
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem',
                              fontWeight: '700'
                            }}>
                              👤
                            </div>
                            <div>
                              <h5 style={{
                                margin: '0 0 5px 0',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#333'
                              }}>
                                {trabajador.nombre}
                              </h5>
                              <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '0.9rem'
                              }}>
                                ID: {trabajador.trabajadorId}
                              </p>
                            </div>
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              background: '#f0fdf4',
                              color: '#15803d',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>
                              Total: {formatearHoras(trabajador.totalHoras)}
                            </div>
                            <div style={{
                              background: '#fef3c7',
                              color: '#d97706',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>
                              Normales: {formatearHoras(trabajador.horasNormales)}
                            </div>
                            <div style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>
                              Extras D: {formatearHoras(trabajador.extrasDiurnas)}
                            </div>
                            <div style={{
                              background: '#ede9fe',
                              color: '#7c3aed',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>
                              Extras N: {formatearHoras(trabajador.extrasNocturnas)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de crear centro */}
        {vistaActual === 'crear' && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '0',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              <div style={{
                position: 'sticky',
                top: 0,
                background: 'white',
                borderRadius: '20px 20px 0 0',
                padding: '20px 30px 15px 30px',
                borderBottom: '2px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1001
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  ➕ Crear Nuevo Centro
                </h3>
                <button
                  onClick={cerrarModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ❌
                </button>
              </div>
              <div style={{ padding: '0 30px 30px 30px' }}>
                <CentroForm onSuccess={handleCentroCreado} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CentrosPage;