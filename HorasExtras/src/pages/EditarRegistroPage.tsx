// HorasExtras/src/pages/EditarRegistroPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { registrosService } from "../api/registrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { centrosService } from "../api/centrosService";
import type { Registro, RegistroInputDto } from "../types/registros";
import type { Trabajador } from "../types/trabajadores";
import type { Centro } from "../types/centros";

const EditarRegistroPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return') || '/registros';

  // Estados principales
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Estados para datos de formulario
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [analistas, setAnalistas] = useState<{ id: number; nombreCompleto: string }[]>([]);
  
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
    EsConductor: false, // 🆕 Campo agregado
    AnalistaId: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError("ID de registro no válido");
          return;
        }

        // Cargar registro y datos de referencia en paralelo
        const [
          registroData,
          trabajadoresData,
          centrosData,
          analistasData
        ] = await Promise.all([
          registrosService.obtenerPorId(parseInt(id)),
          trabajadoresService.getAll(),
          centrosService.getAll(),
          trabajadoresService.getAnalistas()
        ]);

        setRegistro(registroData);
        setTrabajadores(trabajadoresData.filter(t => t.estado === "Vigente"));
        setCentros(centrosData);
        setAnalistas(analistasData);

        // Convertir datos del registro al formato del formulario
        const fechaFormateada = registroData.fecha;
        const horaIngresoFormateada = registroData.horaIngreso.substring(0, 5);
        const horaSalidaFormateada = registroData.horaSalida.substring(0, 5);
        const tiempoAlmuerzoFormateado = registroData.tiempoAlmuerzo || "01:00:00";
        
        setFormData({
          Trabajador_ID: registroData.trabajadorId,
          Centro_ID: registroData.centroId.toString(),
          Nombr_Centro: registroData.nombreCentro,
          Fecha: fechaFormateada,
          Hora_Ingreso: horaIngresoFormateada,
          Hora_Salida: horaSalidaFormateada,
          Tiempo_Almuerzo: tiempoAlmuerzoFormateado,
          desplazamientoIda: registroData.desplazamientoIda?.substring(0, 5) || "",
          desplazamientoRegreso: registroData.desplazamientoRegreso?.substring(0, 5) || "",
          EsConductor: registroData.esConductor || false, // 🆕 Campo agregado
          AnalistaId: analistasData[0]?.id || 0
        });

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos del registro");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof RegistroInputDto, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar cambio de trabajador
  const handleTrabajadorChange = (trabajadorId: number) => {
    setFormData(prev => ({
      ...prev,
      Trabajador_ID: trabajadorId
    }));
  };

  // Manejar cambio de centro
  const handleCentroChange = (centroId: string) => {
    const centro = centros.find(c => c.id === centroId);
    setFormData(prev => ({
      ...prev,
      Centro_ID: centroId,
      Nombr_Centro: centro?.nombreCentro || ""
    }));
  };

  // Validar formulario
  const validarFormulario = (): string[] => {
    const errores: string[] = [];

    if (formData.Trabajador_ID === 0) {
      errores.push("Debe seleccionar un trabajador");
    }

    if (!formData.Centro_ID) {
      errores.push("Debe seleccionar un centro");
    }

    if (!formData.Fecha) {
      errores.push("Debe seleccionar una fecha");
    }

    if (!formData.Hora_Ingreso) {
      errores.push("Debe especificar la hora de ingreso");
    }

    if (!formData.Hora_Salida) {
      errores.push("Debe especificar la hora de salida");
    }

    // Validar que hora de salida sea posterior a hora de ingreso
    if (formData.Hora_Ingreso && formData.Hora_Salida) {
      const ingreso = new Date(`1970-01-01T${formData.Hora_Ingreso}:00`);
      const salida = new Date(`1970-01-01T${formData.Hora_Salida}:00`);
      
      if (salida <= ingreso) {
        errores.push("La hora de salida debe ser posterior a la hora de ingreso");
      }
    }

    return errores;
  };

  // Guardar cambios
  const handleGuardar = async () => {
    try {
      const errores = validarFormulario();
      if (errores.length > 0) {
        setError(errores.join(", "));
        return;
      }

      setGuardando(true);
      setError("");

      // Preparar datos para envío
      const dataToSend: RegistroInputDto = {
        ...formData,
        Tiempo_Almuerzo: formData.Tiempo_Almuerzo || "01:00:00",
        desplazamientoIda: formData.desplazamientoIda || undefined,
        desplazamientoRegreso: formData.desplazamientoRegreso || undefined,
      };

      await registrosService.actualizar(parseInt(id!), dataToSend);
      
      // Redirigir con mensaje de éxito
      const targetUrl = new URL(returnUrl, window.location.origin);
      targetUrl.searchParams.set('success', 'registro-actualizado');
      navigate(targetUrl.pathname + targetUrl.search);

    } catch (err: unknown) {
      console.error("Error al guardar:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al guardar el registro");
    } finally {
      setGuardando(false);
    }
  };

  // Cancelar edición
  const handleCancelar = () => {
    navigate(returnUrl);
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '2px solid #f59e0b',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>
              📋 Información Original
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              fontSize: '0.9rem'
            }}>
              <div><strong>Trabajador:</strong> {registro.trabajadorNombre}</div>
              <div><strong>Centro:</strong> {registro.nombreCentro}</div>
              <div><strong>Fecha:</strong> {registro.fecha}</div>
              <div><strong>Horario:</strong> {registro.horaIngreso} - {registro.horaSalida}</div>
              <div><strong>Horas Totales:</strong> {registro.totalHoras}h</div>
              <div><strong>Horas Normales:</strong> {registro.horasNormales}h</div>
              <div><strong>Es Conductor:</strong> {registro.esConductor ? 'Sí' : 'No'}</div>
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
            {/* Trabajador */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333'
              }}>
                👤 Trabajador *
              </label>
              <select
                value={formData.Trabajador_ID}
                onChange={(e) => handleTrabajadorChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '10px',
                  fontSize: '1rem'
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

            {/* Centro */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333'
              }}>
                🏢 Centro de Trabajo *
              </label>
              <select
                value={formData.Centro_ID}
                onChange={(e) => handleCentroChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '10px',
                  fontSize: '1rem'
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
                </label>
                <select
                  value={formData.Tiempo_Almuerzo}
                  onChange={(e) => handleInputChange('Tiempo_Almuerzo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '10px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="00:30:00">30 minutos</option>
                  <option value="01:00:00">1 hora</option>
                  <option value="01:30:00">1.5 horas</option>
                  <option value="02:00:00">2 horas</option>
                </select>
              </div>
            </div>

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
                Marca esta opción si el trabajador desempeñó funciones de conductor
              </p>
            </div>

            {/* Analista */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333'
              }}>
                👨‍💼 Analista
              </label>
              <select
                value={formData.AnalistaId || 0}
                onChange={(e) => handleInputChange('AnalistaId', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              >
                <option value={0}>Seleccionar analista...</option>
                {analistas.map(analista => (
                  <option key={analista.id} value={analista.id}>
                    {analista.nombreCompleto}
                  </option>
                ))}
              </select>
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
              disabled={guardando}
              style={{
                background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                cursor: guardando ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                opacity: guardando ? 0.7 : 1
              }}
            >
              ❌ Cancelar
            </button>

            <button
              onClick={handleGuardar}
              disabled={guardando}
              style={{
                background: guardando 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #22c55e, #15803d)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                cursor: guardando ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                minWidth: '160px'
              }}
            >
              {guardando ? '🔄 Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarRegistroPage;