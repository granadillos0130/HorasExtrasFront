import React, { useState, useEffect } from "react";
import { registrosService } from "../api/registrosService";
import RegistrosForm from "../components/registros/RegistrosForm";
import RegistrosLoteForm from "../components/registros/RegistrosLoteForm";
import type { Registro } from "../types/registros";

const RegistrosPage: React.FC = () => {
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [registrosDelDia, setRegistrosDelDia] = useState<Registro[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState<'individual' | 'lote' | null>(null);
  const [loading, setLoading] = useState(false);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const obtenerDiasDelMes = (año: number, mes: number) => {
    const diasEnMes = new Date(año, mes, 0).getDate();
    const primerDia = new Date(año, mes - 1, 1).getDay();
    
    const dias = [];
    
    // Espacios en blanco para días anteriores al primer día del mes
    for (let i = 0; i < primerDia; i++) {
      dias.push(null);
    }
    
    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(dia);
    }
    
    return dias;
  };

  // Función para obtener todos los registros de un día específico
  const obtenerRegistrosDelDia = async (fecha: string) => {
    try {
      setLoading(true);
      // Usar el nuevo endpoint específico para obtener todos los registros de una fecha
      const registros = await registrosService.obtenerTodosPorFecha(fecha);
      setRegistrosDelDia(registros);
    } catch (error) {
      console.error("Error al obtener registros:", error);
      setRegistrosDelDia([]);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarDia = async (dia: number) => {
    if (mesSeleccionado === null) return;

    const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    setDiaSeleccionado(fechaString);
    await obtenerRegistrosDelDia(fechaString);
  };

  const cerrarModal = () => {
    setDiaSeleccionado(null);
    setRegistrosDelDia([]);
    setMostrarFormulario(null);
  };

  const handleFormSuccess = () => {
    setMostrarFormulario(null);
    if (diaSeleccionado) {
      // Recargar los registros del día
      obtenerRegistrosDelDia(diaSeleccionado);
    }
  };

  const formatearHora = (timeString: string) => {
    return timeString?.substring(0, 5) || "--:--";
  };

  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', opciones);
  };

  const eliminarRegistro = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await registrosService.eliminar(id);
        // Recargar registros del día
        if (diaSeleccionado) {
          await obtenerRegistrosDelDia(diaSeleccionado);
        }
        alert("Registro eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar registro:", error);
        alert("Error al eliminar el registro");
      }
    }
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
            📊 Dashboard Global de Registros
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Visualiza todos los registros de todos los trabajadores por día
          </p>
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
                setDiaSeleccionado(null);
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

        {/* Vista de días del mes */}
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
              marginBottom: '30px'
            }}>
              <h2 style={{
                margin: 0,
                color: '#333',
                fontSize: '1.8rem',
                fontWeight: '600'
              }}>
                📅 {meses[mesSeleccionado - 1]} {añoSeleccionado}
              </h2>
              <button
                onClick={() => setMesSeleccionado(null)}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ← Volver a Meses
              </button>
            </div>

            {/* Días de la semana */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px',
              marginBottom: '15px'
            }}>
              {diasSemana.map(dia => (
                <div key={dia} style={{
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}>
                  {dia}
                </div>
              ))}
            </div>

            {/* Calendario */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px'
            }}>
              {obtenerDiasDelMes(añoSeleccionado, mesSeleccionado).map((dia, index) => (
                <div key={index} style={{
                  minHeight: '60px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: dia ? 'pointer' : 'default',
                  background: dia ? 'linear-gradient(135deg, #f8fafb, #ffffff)' : 'transparent',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: dia ? '#333' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => dia && seleccionarDia(dia)}
                onMouseOver={(e) => {
                  if (dia) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if (dia) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafb, #ffffff)';
                    e.currentTarget.style.color = '#333';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                >
                  {dia}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal del día seleccionado */}
        {diaSeleccionado && (
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
                <h3 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  📅 {formatearFecha(diaSeleccionado + 'T00:00:00')}
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

              {loading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  fontSize: '1.2rem',
                  color: '#667eea'
                }}>
                  🔄 Consultando registros del día...
                </div>
              ) : registrosDelDia.length > 0 ? (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '25px',
                    padding: '15px 20px',
                    background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                    color: 'white',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
                      ✅ {registrosDelDia.length} Registro{registrosDelDia.length !== 1 ? 's' : ''} Encontrado{registrosDelDia.length !== 1 ? 's' : ''}
                    </h4>
                    <button
                      onClick={() => setMostrarFormulario('individual')}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ➕ Nuevo Registro
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gap: '15px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '10px'
                  }}>
                    {registrosDelDia.map((registro, index) => (
                      <div key={registro.id} style={{
                        background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
                        padding: '20px',
                        borderRadius: '15px',
                        border: '2px solid #e1e8ed',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '15px'
                        }}>
                          <div>
                            <h5 style={{
                              margin: '0 0 5px 0',
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              color: '#333'
                            }}>
                              👤 {registro.trabajadorNombre || `Trabajador ${registro.trabajadorId}`}
                            </h5>
                            <p style={{
                              margin: 0,
                              color: '#666',
                              fontSize: '0.9rem'
                            }}>
                              🏢 {registro.nombreCentro || `Centro ${registro.centroId}`}
                            </p>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '8px'
                          }}>
                            <button
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                              onClick={() => alert('Funcionalidad de editar próximamente')}
                            >
                              ✏️
                            </button>
                            <button
                              style={{
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                              onClick={() => eliminarRegistro(registro.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                          gap: '10px',
                          marginBottom: '15px'
                        }}>
                          <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>Ingreso</div>
                            <div style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                              {formatearHora(registro.horaIngreso)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>Salida</div>
                            <div style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                              {formatearHora(registro.horaSalida)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#15803d' }}>Total</div>
                            <div style={{ fontWeight: '600', color: '#15803d', fontSize: '0.9rem' }}>
                              {formatearHoras(registro.totalHoras)}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                          gap: '8px'
                        }}>
                          <div style={{ textAlign: 'center', padding: '6px', background: '#f0fdf4', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.6rem', color: '#15803d' }}>Normal</div>
                            <div style={{ fontWeight: '600', color: '#15803d', fontSize: '0.8rem' }}>
                              {formatearHoras(registro.horasNormales)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', padding: '6px', background: '#fff7ed', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.6rem', color: '#ea580c' }}>E.Diur</div>
                            <div style={{ fontWeight: '600', color: '#ea580c', fontSize: '0.8rem' }}>
                              {formatearHoras(registro.horasExtrasDiurnas)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', padding: '6px', background: '#f3f4f6', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>E.Noct</div>
                            <div style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.8rem' }}>
                              {formatearHoras(registro.horasExtrasNocturnas)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📝</div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
                    No hay registros para este día
                  </h4>
                  <p style={{ marginBottom: '25px', color: '#666' }}>
                    Ningún trabajador tiene registros para esta fecha
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => setMostrarFormulario('individual')}
                      style={{
                        background: 'linear-gradient(135deg, #22c55e, #15803d)',
                        color: 'white',
                        border: 'none',
                        padding: '15px 25px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}
                    >
                      ➕ Crear Registro
                    </button>
                    <button
                      onClick={() => setMostrarFormulario('lote')}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        padding: '15px 25px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}
                    >
                      📊 Registros en Lote
                    </button>
                  </div>
                </div>
              )}

              {/* Formularios */}
              {mostrarFormulario === 'individual' && (
                <div style={{
                  marginTop: '30px',
                  padding: '25px',
                  background: '#f8fafb',
                  borderRadius: '15px',
                  border: '2px solid #e1e8ed'
                }}>
                  <RegistrosForm onSuccess={handleFormSuccess} />
                </div>
              )}

              {mostrarFormulario === 'lote' && (
                <div style={{
                  marginTop: '30px',
                  padding: '25px',
                  background: '#f8fafb',
                  borderRadius: '15px',
                  border: '2px solid #e1e8ed'
                }}>
                  <RegistrosLoteForm 
                    onSuccess={handleFormSuccess} 
                    onCancel={() => setMostrarFormulario(null)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrosPage;