import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { registrosService } from "../../api/registrosService";
import { trabajadoresService } from "../../api/trabajadoresService";
import { centrosService } from "../../api/centrosService";
import type { Registro, RegistroInputDto } from "../../types/registros";
import type { Trabajador } from "../../types/trabajadores";
import type { Centro } from "../../types/centros";

const EditarRegistroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    AnalistaId: 1
  });

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
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
        AnalistaId: 1
      });

    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos del registro");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegistroInputDto, value: string | number) => {
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
      
      alert("✅ Registro actualizado correctamente");
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
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: '#f9fafb'
                  }}
                >
                  <option value={0}>Seleccionar trabajador...</option>
                  {trabajadores.map(trabajador => (
                    <option key={trabajador.id} value={trabajador.id}>
                      {trabajador.nombre}
                    </option>
                  ))}
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

            {/* Fila 2: Fecha y Tiempo de Almuerzo */}
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
                </label>
                <select
                  value={formData.Tiempo_Almuerzo}
                  onChange={(e) => handleInputChange('Tiempo_Almuerzo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
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

            {/* Fila 4: Desplazamientos */}
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
                  🚗 Desplazamiento Ida (opcional)
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
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  fontSize: '1rem'
                }}>
                  🏠 Desplazamiento Regreso (opcional)
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
                style={{
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  minWidth: '150px'
                }}
              >
                ← Cancelar
              </button>
              
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving 
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                    : 'linear-gradient(135deg, #22c55e, #15803d)',
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
                {saving ? '⏳ Guardando...' : '✅ Actualizar Registro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarRegistroPage;