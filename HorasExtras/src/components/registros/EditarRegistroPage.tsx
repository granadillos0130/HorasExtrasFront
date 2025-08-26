import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { registrosService } from "../../api/registrosService";
import { trabajadoresService } from "../../api/trabajadoresService";
import { centrosService } from "../../api/centrosService";
import type { Registro, RegistroInputDto } from "../../types/registros";
import type { Trabajador } from "../../types/trabajadores";
import type { Centro } from "../../types/centros";

// TIPO ESPECÍFICO PARA REGISTROS EXISTENTES
interface RegistroExistente {
  id: number;
  trabajadorId: number;
  fecha: string;
}

const EditarRegistroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NUEVOS ESTADOS PARA VERIFICACIÓN DE DUPLICADOS
  const [registrosExistentes, setRegistrosExistentes] = useState<RegistroExistente[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [verificandoRegistros, setVerificandoRegistros] = useState(false);
  
  // REFS PARA CONTROL DE MONTAJE Y TIMEOUTS
  const isMountedRef = useRef(true);
  const verificacionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState<RegistroInputDto>({
    Trabajador_ID: 0,
    Centro_ID: "",
    Nombr_Centro: "",
    Fecha: "",
    Hora_Ingreso: "",
    Hora_Salida: "",
    Tiempo_Almuerzo: "01:00:00",
    desplazamientoIda: "",
    desplazamientoRegreso: "",
    EsConductor: false,
    AnalistaId: 1
  });

  // CONTROL DE MONTAJE DEL COMPONENTE
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (verificacionTimeoutRef.current) {
        clearTimeout(verificacionTimeoutRef.current);
      }
    };
  }, []);

  // FUNCIÓN MEMOIZADA PARA VERIFICAR REGISTROS EXISTENTES (excluyendo el actual)
  const verificarRegistrosExistentes = useCallback(async (trabajadorId: number, fecha: string) => {
    if (!isMountedRef.current || !trabajadorId || !fecha) return;
    
    if (trabajadorId > 0 && fecha) {
      setVerificandoRegistros(true);
      try {
        const registros = await registrosService.obtenerTodosPorFecha(fecha);
        const registrosDelTrabajador = registros
          .filter((r: unknown) => {
            return r && 
                   typeof r === 'object' && 
                   'trabajadorId' in r && 
                   'id' in r &&
                   (r as { trabajadorId: number; id: number }).trabajadorId === trabajadorId &&
                   (r as { trabajadorId: number; id: number }).id !== Number(id); // Excluir el registro actual
          })
          .map((r: unknown) => r as RegistroExistente);
        
        if (isMountedRef.current) {
          setRegistrosExistentes(registrosDelTrabajador);
          setShowDuplicateWarning(registrosDelTrabajador.length > 0);
        }
      } catch (error) {
        console.error("Error al verificar registros existentes:", error);
        if (isMountedRef.current) {
          setRegistrosExistentes([]);
          setShowDuplicateWarning(false);
        }
      } finally {
        if (isMountedRef.current) {
          setVerificandoRegistros(false);
        }
      }
    } else {
      if (isMountedRef.current) {
        setRegistrosExistentes([]);
        setShowDuplicateWarning(false);
        setVerificandoRegistros(false);
      }
    }
  }, [id]);

  // USEEFFECT PARA VERIFICACIÓN CON DEBOUNCING
  useEffect(() => {
    if (verificacionTimeoutRef.current) {
      clearTimeout(verificacionTimeoutRef.current);
    }

    if (formData.Trabajador_ID > 0 && formData.Fecha && isMountedRef.current) {
      verificacionTimeoutRef.current = setTimeout(() => {
        verificarRegistrosExistentes(formData.Trabajador_ID, formData.Fecha);
      }, 300);
    }

    return () => {
      if (verificacionTimeoutRef.current) {
        clearTimeout(verificacionTimeoutRef.current);
      }
    };
  }, [formData.Trabajador_ID, formData.Fecha, verificarRegistrosExistentes]);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [registrosData, trabajadoresData, centrosData] = await Promise.all([
        registrosService.obtenerTodos(),
        trabajadoresService.getAll(),
        centrosService.getAll()
      ]);

      // Buscar el registro específico
      const registroEncontrado = registrosData.find(r => r.id === Number(id));
      
      if (!registroEncontrado) {
        setError("Registro no encontrado");
        return;
      }

      setRegistro(registroEncontrado);
      setTrabajadores(trabajadoresData);
      setCentros(centrosData);

      // Convertir el registro a formato de formulario
      const timeSpanToString = (timeString: string) => {
        if (!timeString) return "";
        // Si viene en formato "HH:mm:ss", tomar solo "HH:mm"
        return timeString.includes(':') ? timeString.substring(0, 5) : timeString;
      };

      setFormData({
        Trabajador_ID: registroEncontrado.trabajadorId,
        Centro_ID: registroEncontrado.centroId.toString(),
        Nombr_Centro: registroEncontrado.nombreCentro,
        Fecha: registroEncontrado.fecha,
        Hora_Ingreso: timeSpanToString(registroEncontrado.horaIngreso),
        Hora_Salida: timeSpanToString(registroEncontrado.horaSalida),
        Tiempo_Almuerzo: registroEncontrado.tiempoAlmuerzo || "01:00:00",
        desplazamientoIda: timeSpanToString(registroEncontrado.desplazamientoIda || ""),
        desplazamientoRegreso: timeSpanToString(registroEncontrado.desplazamientoRegreso || ""),
        EsConductor: registroEncontrado.esConductor || false,
        AnalistaId: 1
      });

    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos del registro");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id, cargarDatos]);

  const handleInputChange = (field: keyof RegistroInputDto, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si se cambia el centro, actualizar el nombre del centro
    if (field === 'Centro_ID') {
      const centroSeleccionado = centros.find(c => c.id.toString() === value.toString());
      setFormData(prev => ({
        ...prev,
        Nombr_Centro: centroSeleccionado?.nombreCentro || ""
      }));
    }
  };

  const convertirTiempoATimeSpan = (tiempo: string): string => {
    if (!tiempo) return "00:00:00";
    
    // Si ya tiene el formato correcto (HH:mm:ss)
    if (tiempo.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return tiempo;
    }
    
    // Si tiene formato HH:mm, agregar :00
    if (tiempo.match(/^\d{2}:\d{2}$/)) {
      return `${tiempo}:00`;
    }
    
    return "00:00:00";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    // Verificar campos obligatorios
    if (!formData.Trabajador_ID || !formData.Centro_ID || !formData.Nombr_Centro) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    // Mostrar advertencia si hay registros duplicados
    if (showDuplicateWarning) {
      const trabajadorNombre = trabajadores.find(t => t.id === formData.Trabajador_ID)?.nombre || "este trabajador";
      const tipoTrabajador = formData.EsConductor ? "conductor" : "trabajador";
      const confirmMessage = `⚠️ ATENCIÓN: Además de este registro que está editando, ya existe${registrosExistentes.length > 1 ? 'n' : ''} ${registrosExistentes.length} registro${registrosExistentes.length > 1 ? 's' : ''} más para ${trabajadorNombre} en la fecha ${new Date(formData.Fecha).toLocaleDateString('es-ES')}.\n\n` +
        `${formData.EsConductor 
          ? '🚛 CONDUCTOR: Los desplazamientos se incluirán como tiempo de trabajo.' 
          : '👷 NO CONDUCTOR: Los desplazamientos se restarán del tiempo trabajado.'
        }\n\n` +
        `${registrosExistentes.length === 0 ? 'El tiempo de almuerzo SÍ se descontará de este registro.' : 'El tiempo de almuerzo NO se descontará de este registro (ya hay otros registros en el día).'}\n\n` +
        `¿Está seguro que desea continuar actualizando este registro para ${tipoTrabajador}?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      // Preparar datos para envío
      const datosParaEnvio: RegistroInputDto = {
        ...formData,
        Tiempo_Almuerzo: convertirTiempoATimeSpan(formData.Tiempo_Almuerzo),
        desplazamientoIda: formData.desplazamientoIda ? convertirTiempoATimeSpan(formData.desplazamientoIda) : undefined,
        desplazamientoRegreso: formData.desplazamientoRegreso ? convertirTiempoATimeSpan(formData.desplazamientoRegreso) : undefined
      };

      await registrosService.actualizar(Number(id), datosParaEnvio);
      
      const tipoMensaje = formData.EsConductor 
        ? "✅ Registro de conductor actualizado correctamente (desplazamientos incluidos)" 
        : "✅ Registro actualizado correctamente (desplazamientos descontados)";
      
      alert(tipoMensaje);
      navigate(-1); // Volver a la página anterior
      
    } catch (error) {
      console.error("Error al actualizar registro:", error);
      setError("Error al actualizar el registro. Verifica los datos ingresados.");
    } finally {
      setSaving(false);
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
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔄</div>
          <h2 style={{ color: '#333', margin: 0 }}>Cargando registro...</h2>
        </div>
      </div>
    );
  }

  if (error) {
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
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#dc2626', marginBottom: '15px' }}>Error</h2>
          <p style={{ color: '#666', marginBottom: '25px' }}>{error}</p>
          <button
            onClick={() => navigate(-1)}
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
            ← Volver
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
            Modifica los datos del registro seleccionado
          </p>
        </div>

        {/* Información del registro actual */}
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
                    ? ' El tiempo de almuerzo SÍ se descontará de este registro.'
                    : ' El tiempo de almuerzo NO se descontará de este registro.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de edición */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#333',
              fontSize: '1.3rem',
              textAlign: 'center',
              padding: '15px',
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderRadius: '10px',
              border: '2px solid #f59e0b'
            }}>
              📝 Modificar Datos del Registro
            </h3>

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

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  fontSize: '1rem'
                }}>
                  🏢 Centro *
                </label>
                <select
                  value={formData.Centro_ID}
                  onChange={(e) => handleInputChange('Centro_ID', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: '#f9fafb'
                  }}
                >
                  <option value="">Seleccionar centro...</option>
                  {centros.map(centro => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombreCentro}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 2: Fecha, Tiempo de Almuerzo y Es Conductor */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                  📅 Fecha *
                </label>
                <input
                  type="date"
                  value={formData.Fecha}
                  onChange={(e) => handleInputChange('Fecha', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: '#f9fafb'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  fontSize: '1rem'
                }}>
                  🍽️ Tiempo de Almuerzo
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
                  value={formData.Tiempo_Almuerzo}
                  onChange={(e) => handleInputChange('Tiempo_Almuerzo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: showDuplicateWarning ? '2px solid #ff6b35' : '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: '#f9fafb'
                  }}
                >
                  <option value="00:30:00">30 minutos</option>
                  <option value="01:00:00">1 hora</option>
                  <option value="01:30:00">1 hora 30 minutos</option>
                  <option value="02:00:00">2 horas</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  fontSize: '1rem'
                }}>
                  🚗 Es Conductor
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  background: '#f9fafb'
                }}>
                  <input
                    type="checkbox"
                    id="esConductor"
                    checked={formData.EsConductor}
                    onChange={(e) => handleInputChange('EsConductor', e.target.checked)}
                    style={{
                      marginRight: '8px',
                      transform: 'scale(1.2)'
                    }}
                  />
                  <label htmlFor="esConductor" style={{ cursor: 'pointer', fontWeight: '600' }}>
                    {formData.EsConductor ? '🚛 Sí, es conductor' : '👷 No es conductor'}
                  </label>
                </div>
                <small style={{ color: "#666", fontSize: "0.8rem", marginTop: '5px', display: 'block' }}>
                  {formData.EsConductor 
                    ? 'Los desplazamientos se incluirán como tiempo de trabajo'
                    : 'Los desplazamientos se descontarán del tiempo trabajado'
                  }
                </small>
              </div>
            </div>

            {/* Fila 3: Horarios de Trabajo */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                  🔄 Hora de Ingreso *
                </label>
                <input
                  type="time"
                  value={formData.Hora_Ingreso}
                  onChange={(e) => handleInputChange('Hora_Ingreso', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: '#f9fafb'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  fontSize: '1rem'
                }}>
                  🔚 Hora de Salida *
                </label>
                <input
                  type="time"
                  value={formData.Hora_Salida}
                  onChange={(e) => handleInputChange('Hora_Salida', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: '#f9fafb'
                  }}
                />
              </div>
            </div>

            {/* Información sobre el cálculo */}
            {mostrarInfoCalculoHoras()}

            {/* Fila 4: Desplazamientos */}
            <div style={{
              borderTop: '2px solid #f3f4f6',
              paddingTop: '20px'
            }}>
              <h4 style={{
                margin: '0 0 15px 0',
                color: '#374151',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚗 Tiempos de Desplazamiento (Opcional)
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                    🚗 Desplazamiento Ida
                  </label>
                  <input
                    type="time"
                    value={formData.desplazamientoIda}
                    onChange={(e) => handleInputChange('desplazamientoIda', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: '#f9fafb'
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
                    color: '#374151',
                    marginBottom: '8px',
                    fontSize: '1rem'
                  }}>
                    🏠 Desplazamiento Regreso
                  </label>
                  <input
                    type="time"
                    value={formData.desplazamientoRegreso}
                    onChange={(e) => handleInputChange('desplazamientoRegreso', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: '#f9fafb'
                    }}
                  />
                  <small style={{ color: "#666", fontSize: "0.8rem", marginTop: '5px', display: 'block' }}>
                    Tiempo de desplazamiento del trabajo a casa
                  </small>
                </div>
              </div>
            </div>

            {/* Mostrar error si existe */}
            {error && (
              <div style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                ❌ {error}
              </div>
            )}

            {/* Botones de acción */}
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              paddingTop: '20px',
              borderTop: '2px solid #f3f4f6'
            }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
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
                  minWidth: '150px',
                  opacity: saving ? 0.7 : 1
                }}
              >
                ← Cancelar
              </button>
              
              <button
                type="submit"
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
                  minWidth: '150px',
                  opacity: (saving || verificandoRegistros) ? 0.7 : 1
                }}
              >
                {saving ? '⏳ Guardando...' : 
                 verificandoRegistros ? '🔍 Verificando...' : 
                 '✅ Actualizar Registro'}
                {!saving && !verificandoRegistros && (formData.EsConductor ? " 🚛" : " 👷")}
                {showDuplicateWarning && !saving && !verificandoRegistros && " (Con otros registros)"}
              </button>
            </div>
          </form>
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