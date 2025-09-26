import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { registrosService } from "../api/registrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { centrosService } from "../api/centrosService";
import CentroBuscador from "../components/shared/CentroBuscador";
import type { Registro, RegistroExistente, RegistroInputDto } from "../types/registros";
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // Estados para datos de formulario
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);

  // ESTADOS PARA VERIFICACIÓN DE DUPLICADOS
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
    Tiempo_Almuerzo: "",
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

  // FUNCIÓN PARA LIMPIAR Y FORMATEAR TIEMPOS
  const timeSpanToString = (timeString: string | null | undefined): string => {
    if (!timeString) return "";

    // Convertir a string y eliminar TODOS los espacios en blanco
    const str = String(timeString).replace(/\s+/g, '');

    if (!str) return "";

    // Si viene en formato "HH:mm:ss" o "HH:mm", procesar
    if (str.includes(':')) {
      const parts = str.split(':');

      if (parts.length >= 2) {
        // Asegurar que las partes sean números válidos
        const hoursNum = parseInt(parts[0], 10);
        const minutesNum = parseInt(parts[1], 10);

        if (!isNaN(hoursNum) && !isNaN(minutesNum) &&
          hoursNum >= 0 && hoursNum <= 23 &&
          minutesNum >= 0 && minutesNum <= 59) {

          const hours = hoursNum.toString().padStart(2, '0');
          const minutes = minutesNum.toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        }
      }
    }

    return "";
  };

  // FUNCIÓN PARA CONVERTIR TIEMPO A TIMESPAN COMPLETO
  const convertirTiempoATimeSpan = (tiempo: string): string => {
    if (!tiempo) return "00:00:00";

    const tiempoLimpio = tiempo.trim();

    // Si ya tiene el formato correcto (HH:mm:ss)
    if (tiempoLimpio.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return tiempoLimpio;
    }

    // Si tiene formato HH:mm, agregar :00
    if (tiempoLimpio.match(/^\d{1,2}:\d{2}$/)) {
      const parts = tiempoLimpio.split(':');
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}:00`;
    }

    return "00:00:00";
  };

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
          centrosData
        ] = await Promise.all([
          registrosService.obtenerPorId(parseInt(id)),
          trabajadoresService.getAll(),
          centrosService.getAll()
        ]);

        setRegistro(registroData);
        setTrabajadores(trabajadoresData.filter(t => t.estado === "Vigente"));
        setCentros(centrosData);

        // MAPEO DE PROPIEDADES
        const mapearPropiedad = (obj: any, propiedades: string[]) => {
          for (const prop of propiedades) {
            if (obj[prop] !== undefined && obj[prop] !== null) {
              return obj[prop];
            }
          }
          return null;
        };

        // Extraer cada campo individualmente
        const trabajadorIdRaw = mapearPropiedad(registroData, [
          'trabajadorId', 'TrabajadorId', 'trabajador_id', 'Trabajador_ID'
        ]);

        const centroIdRaw = mapearPropiedad(registroData, [
          'centroId', 'CentroId', 'centro_id', 'Centro_ID'
        ]);

        const nombreCentroRaw = mapearPropiedad(registroData, [
          'nombreCentro', 'NombreCentro', 'nombre_centro', 'Nombr_Centro'
        ]);

        const fechaRaw = mapearPropiedad(registroData, [
          'fecha', 'Fecha'
        ]);

        const horaIngresoRaw = mapearPropiedad(registroData, [
          'horaIngreso', 'HoraIngreso', 'hora_ingreso', 'Hora_Ingreso', 'horaInicio', 'HoraInicio'
        ]);

        const horaSalidaRaw = mapearPropiedad(registroData, [
          'horaSalida', 'HoraSalida', 'hora_salida', 'Hora_Salida', 'horaFin', 'HoraFin'
        ]);

        const tiempoAlmuerzoRaw = mapearPropiedad(registroData, [
          'tiempoAlmuerzo', 'TiempoAlmuerzo', 'tiempo_almuerzo', 'Tiempo_Almuerzo', 'almuerzo', 'Almuerzo'
        ]);

        const desplazamientoIdaRaw = mapearPropiedad(registroData, [
          'desplazamientoIda', 'DesplazamientoIda', 'desplazamiento_ida', 'viaje_ida'
        ]);

        const desplazamientoRegresoRaw = mapearPropiedad(registroData, [
          'desplazamientoRegreso', 'DesplazamientoRegreso', 'desplazamiento_regreso', 'viaje_regreso'
        ]);

        const esConductorRaw = mapearPropiedad(registroData, [
          'esConductor', 'EsConductor', 'es_conductor', 'conductor'
        ]);

        // Limpiar y formatear los tiempos
        const horaIngresoLimpia = horaIngresoRaw ? timeSpanToString(horaIngresoRaw) : "";
        const horaSalidaLimpia = horaSalidaRaw ? timeSpanToString(horaSalidaRaw) : "";
        const desplazamientoIdaLimpio = desplazamientoIdaRaw ? timeSpanToString(desplazamientoIdaRaw) : "";
        const desplazamientoRegresoLimpio = desplazamientoRegresoRaw ? timeSpanToString(desplazamientoRegresoRaw) : "";

        // Preparar datos para el formulario
        let tiempoAlmuerzoMapeado = "";
        if (tiempoAlmuerzoRaw) {
          const tiempoStr = String(tiempoAlmuerzoRaw);
          if (tiempoStr === "00:00:00" || tiempoStr === "0:00:00") {
            tiempoAlmuerzoMapeado = ""; // Sin almuerzo
          } else {
            tiempoAlmuerzoMapeado = tiempoStr;
          }
        }

        // Preparar datos para el formulario
        setFormData({
          Trabajador_ID: trabajadorIdRaw || 0,
          Centro_ID: String(centroIdRaw || ""),
          Nombr_Centro: nombreCentroRaw || "",
          Fecha: fechaRaw || "",
          Hora_Ingreso: horaIngresoLimpia,
          Hora_Salida: horaSalidaLimpia,
          Tiempo_Almuerzo: tiempoAlmuerzoMapeado,
          desplazamientoIda: desplazamientoIdaLimpio,
          desplazamientoRegreso: desplazamientoRegresoLimpio,
          EsConductor: Boolean(esConductorRaw),
          AnalistaId: 1
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

  // HANDLER PARA EL BUSCADOR DE CENTROS
  const handleCentroChange = (centroId: string, centro?: Centro) => {
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

      // Mostrar advertencia si hay registros duplicados
      if (showDuplicateWarning) {
        const trabajadorNombre = trabajadores.find(t => t.id === formData.Trabajador_ID)?.nombre || "este trabajador";
        const tipoTrabajador = formData.EsConductor ? "conductor" : "trabajador";
        const mensajeAlmuerzo = formData.Tiempo_Almuerzo
          ? (registrosExistentes.length === 0 ? 'El tiempo de almuerzo SÍ se descontará de este registro.' : 'El tiempo de almuerzo NO se descontará de este registro (ya hay otros registros en el día).')
          : 'No hay tiempo de almuerzo configurado para descontar.';

        const confirmMessage = `⚠️ ATENCIÓN: Además de este registro que está editando, ya existe${registrosExistentes.length > 1 ? 'n' : ''} ${registrosExistentes.length} registro${registrosExistentes.length > 1 ? 's' : ''} más para ${trabajadorNombre} en la fecha ${new Date(formData.Fecha).toLocaleDateString('es-ES')}.\n\n` +
          `${formData.EsConductor
            ? '🚛 CONDUCTOR: Los desplazamientos se incluirán como tiempo de trabajo.'
            : '👷 NO CONDUCTOR: Los desplazamientos se restarán del tiempo trabajado.'
          }\n\n` +
          `${mensajeAlmuerzo}\n\n` +
          `¿Está seguro que desea continuar actualizando este registro para ${tipoTrabajador}?`;

        if (!confirm(confirmMessage)) {
          return;
        }
      }

      setSaving(true);
      setError("");

      // Preparar datos para envío con nombres correctos para el backend C#
      const datosParaEnvio = {
        Trabajador_ID: formData.Trabajador_ID,
        Centro_ID: formData.Centro_ID,
        Nombr_Centro: formData.Nombr_Centro,
        Fecha: formData.Fecha,
        Hora_Ingreso: formData.Hora_Ingreso,
        Hora_Salida: formData.Hora_Salida,
        // Si está vacío, enviar null; si no, convertir a TimeSpan
        Tiempo_Almuerzo: formData.Tiempo_Almuerzo ? convertirTiempoATimeSpan(formData.Tiempo_Almuerzo) : null,
        // IMPORTANTE: El backend C# espera PascalCase para desplazamientos
        DesplazamientoIda: formData.desplazamientoIda ? convertirTiempoATimeSpan(formData.desplazamientoIda) : undefined,
        DesplazamientoRegreso: formData.desplazamientoRegreso ? convertirTiempoATimeSpan(formData.desplazamientoRegreso) : undefined,
        EsConductor: formData.EsConductor,
        AnalistaId: formData.AnalistaId || 1
      };

      await registrosService.actualizar(parseInt(id!), datosParaEnvio);

      const tipoMensaje = formData.EsConductor
        ? "✅ Registro de conductor actualizado correctamente (desplazamientos incluidos)"
        : "✅ Registro actualizado correctamente (desplazamientos descontados)";

      alert(tipoMensaje);

      // Redirigir con mensaje de éxito
      const targetUrl = new URL(returnUrl, window.location.origin);
      targetUrl.searchParams.set('success', 'registro-actualizado');
      navigate(targetUrl.pathname + targetUrl.search);

    } catch (err: unknown) {
      console.error("Error al guardar:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al guardar el registro");
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancelar = () => {
    navigate(returnUrl);
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