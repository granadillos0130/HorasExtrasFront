import { AxiosError } from "axios";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { centrosService } from "../../api/centrosService";
import { cursosService } from "../../api/cursoService"; // 🆕 NUEVO IMPORT
import { registrosService } from "../../api/registrosService";
import CentroBuscador from "../shared/CentroBuscador";
import CursoBuscador from "../shared/CursoBuscador"; // 🆕 NUEVO IMPORT
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { Trabajador } from "../../types/trabajadores";
import type { Centro } from "../../types/centros";
import type { Curso, RegistroInputDto, TipoDestino } from "../../types/registros"; // 🆕 NUEVOS IMPORTS
import "../../styles/components/registros/RegistroForm.css";

interface Props {
  onSuccess: () => void;
  fechaInicial?: string;
}

// TIPO ESPECÍFICO PARA REGISTROS EXISTENTES
interface RegistroExistente {
  id: number;
  trabajadorId: number;
  fecha: string;
}

const RegistrosForm: React.FC<Props> = ({ onSuccess, fechaInicial }) => {
  // Estados principales
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]); // 🆕 NUEVO ESTADO
  const [loading, setLoading] = useState(false);
  const [analistas, setAnalistas] = useState<{ id: number; nombreCompleto: string }[]>([]);

  // 🆕 NUEVO: Estado para tipo de destino (centro o curso)
  const [tipoDestino, setTipoDestino] = useState<TipoDestino>('centro');

  // TIPOS ESPECÍFICOS PARA REGISTROS EXISTENTES
  const [registrosExistentes, setRegistrosExistentes] = useState<RegistroExistente[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // NUEVOS ESTADOS PARA CONTROL DE VERIFICACIÓN
  const [verificandoRegistros, setVerificandoRegistros] = useState(false);

  // REFS PARA CONTROL DE MONTAJE Y TIMEOUTS
  const isMountedRef = useRef(true);
  const verificacionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<RegistroInputDto>({
    Trabajador_ID: 0,
    Centro_ID: "",
    Nombr_Centro: "",
    CursoId: undefined, // 🆕 NUEVO CAMPO
    CursoNombre: undefined, // 🆕 NUEVO CAMPO
    CursoDescripcion: undefined, // 🆕 NUEVO CAMPO
    Fecha: fechaInicial || new Date().toISOString().split("T")[0],
    FechaSalida: undefined,
    Hora_Ingreso: "08:00",
    Hora_Salida: "17:00",
    Tiempo_Almuerzo: "01:00",
    desplazamientoIda: "",
    desplazamientoRegreso: "",
    EsConductor: false,
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

  // Sincronizar fecha inicial
  useEffect(() => {
    if (fechaInicial) {
      setFormData((prev) => ({
        ...prev,
        Fecha: fechaInicial,
      }));
    }
  }, [fechaInicial]);

  // 🆕 ACTUALIZADO: Cargar datos iniciales incluyendo cursos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [trabajadoresData, centrosData, cursosData, analistasData] = await Promise.all([
          trabajadoresService.getAll(),
          centrosService.getAll(),
          cursosService.getAll(), // 🆕 NUEVO: Cargar cursos
          trabajadoresService.getAnalistas(),
        ]);

        // Verificar que cada trabajador tenga las propiedades necesarias
        const trabajadoresValidos = trabajadoresData.filter(t =>
          t && t.id && t.nombre && t.cedula
        );

        setTrabajadores(trabajadoresValidos);
        setCentros(centrosData);
        setCursos(cursosData); // 🆕 NUEVO
        setAnalistas(analistasData);

      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

  // 🆕 NUEVO: Limpiar selección al cambiar tipo de destino
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      Centro_ID: "",
      Nombr_Centro: "",
      CursoId: undefined,
      CursoNombre: undefined,
      CursoDescripcion: undefined,
    }));
  }, [tipoDestino]);

  // FUNCIÓN MEMOIZADA PARA VERIFICAR REGISTROS EXISTENTES
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
              (r as { trabajadorId: number }).trabajadorId === trabajadorId;
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
  }, []);

  // USEEFFECT MEJORADO CON DEBOUNCING Y CONTROL DE MONTAJE
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

  const convertirATimeSpan = (valor: string): string => {
    const parts = valor.trim().split(":");
    if (parts.length === 1 && /^\d+$/.test(parts[0])) {
      return `00:${parts[0].padStart(2, "0")}:00`;
    } else if (parts.length === 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
    } else if (parts.length === 3) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🆕 NUEVA VALIDACIÓN: Verificar que tenga centro O curso
    const tieneCentro = formData.Centro_ID && formData.Nombr_Centro;
    const tieneCurso = formData.CursoId && formData.CursoId > 0;

    if (!formData.Trabajador_ID) {
      alert("Por favor seleccione un trabajador");
      return;
    }

    if (!tieneCentro && !tieneCurso) {
      alert(`Por favor seleccione un ${tipoDestino === 'centro' ? 'centro' : 'curso'}`);
      return;
    }

    if (tieneCentro && tieneCurso) {
      alert("No puede seleccionar tanto centro como curso. Elija uno.");
      return;
    }

    if (showDuplicateWarning) {
      const trabajadorNombre = trabajadores.find(t => t.id === formData.Trabajador_ID)?.nombre || "este trabajador";
      const tipoTrabajador = formData.EsConductor ? "conductor" : "trabajador";
      const tipoDestinoTexto = tieneCurso ? "curso" : "centro";
      const nombreDestino = tieneCurso ? formData.CursoNombre : formData.Nombr_Centro;

      const confirmMessage = `⚠️ ATENCIÓN: Ya existe${registrosExistentes.length > 1 ? 'n' : ''} ${registrosExistentes.length} registro${registrosExistentes.length > 1 ? 's' : ''} para ${trabajadorNombre} en la fecha ${new Date(formData.Fecha).toLocaleDateString('es-ES')}.\n\n` +
        `${formData.EsConductor
          ? '🚛 CONDUCTOR: Los desplazamientos se incluirán como tiempo de trabajo.'
          : '👷 NO CONDUCTOR: Los desplazamientos se restarán del tiempo trabajado.'
        }\n\n` +
        `${registrosExistentes.length === 1 ? 'El tiempo de almuerzo NO se descontará de este nuevo registro.' : 'El tiempo de almuerzo ya fue descontado en el primer registro del día.'}\n\n` +
        `¿Está seguro que desea continuar creando este registro adicional de ${tipoDestinoTexto} "${nombreDestino}" para ${tipoTrabajador}?`;

      if (!confirm(confirmMessage)) {
        return;
      }
    }

    setLoading(true);

    try {
      const normalizarHora = (hora: string) =>
        hora.length === 5 ? `${hora}:00` : hora;

      // 🆕 NUEVO: Preparar payload según tipo de destino
      const payload: RegistroInputDto = {
        ...formData,
        Tiempo_Almuerzo: !formData.Tiempo_Almuerzo || formData.Tiempo_Almuerzo === ""
          ? null  // Enviar null para "sin almuerzo"
          : normalizarHora(formData.Tiempo_Almuerzo),
        desplazamientoIda: formData.desplazamientoIda?.trim()
          ? convertirATimeSpan(formData.desplazamientoIda)
          : undefined,
        desplazamientoRegreso: formData.desplazamientoRegreso?.trim()
          ? convertirATimeSpan(formData.desplazamientoRegreso)
          : undefined,
      };

      // 🆕 NUEVO: Limpiar campos según el tipo seleccionado
      if (tipoDestino === 'centro') {
        // Si es centro, limpiar campos de curso
        payload.CursoId = undefined;
        payload.CursoNombre = undefined;
        payload.CursoDescripcion = undefined;
      } else {
        // Si es curso, limpiar campos de centro
        payload.Centro_ID = "";
        payload.Nombr_Centro = "";
      }

      await registrosService.crear(payload);

      const tipoDestinoTexto = tieneCurso ? "curso" : "centro";
      const nombreDestino = tieneCurso ? formData.CursoNombre : formData.Nombr_Centro;
      const tipoMensaje = formData.EsConductor
        ? `Registro de ${tipoDestinoTexto} "${nombreDestino}" creado correctamente para conductor (desplazamientos incluidos)`
        : `Registro de ${tipoDestinoTexto} "${nombreDestino}" creado correctamente (desplazamientos descontados)`;

      alert(tipoMensaje);
      onSuccess();
    } catch (error: unknown) {
      console.error("Error al crear registro:", error);
      if (error instanceof AxiosError && error.response?.data) {
        alert(
          "Error del servidor:\n" +
          JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert("Error al crear el registro");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler para campos del formulario
  const handleInputChange = (field: keyof RegistroInputDto, value: string | number | boolean | undefined) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

  // Handler para trabajador
  const handleTrabajadorChange = (trabajadorId: number) => {
    setFormData((prev) => ({
      ...prev,
      Trabajador_ID: trabajadorId,
    }));
  };

  // 🆕 ACTUALIZADO: Handler para centro
  const handleCentroChange = (centroId: string) => {
    const centroSeleccionado = centros.find((c) => c.id === centroId);
    setFormData((prev) => ({
      ...prev,
      Centro_ID: centroId,
      Nombr_Centro: centroSeleccionado?.nombreCentro || "",
      // Limpiar campos de curso al seleccionar centro
      CursoId: undefined,
      CursoNombre: undefined,
      CursoDescripcion: undefined,
    }));
  };

  // 🆕 NUEVO: Handler para curso
  const handleCursoChange = (cursoId: number, curso?: Curso) => {
    setFormData((prev) => ({
      ...prev,
      CursoId: cursoId > 0 ? cursoId : undefined,
      CursoNombre: curso?.nombre || undefined,
      CursoDescripcion: curso?.descripcion || undefined,
      // Limpiar campos de centro al seleccionar curso
      Centro_ID: "",
      Nombr_Centro: "",
    }));
  };

  // 🆕 NUEVO: Handler para cambio de tipo de destino
  const handleTipoDestinoChange = (tipo: TipoDestino) => {
    setTipoDestino(tipo);
  };

  // 🆕 NUEVO: Función para validar si hay selección válida
  const tieneSeleccionValida = () => {
    if (tipoDestino === 'centro') {
      return formData.Centro_ID && formData.Nombr_Centro;
    } else {
      return formData.CursoId && formData.CursoId > 0;
    }
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

        {/* 🆕 NUEVO: Selector de tipo de destino */}
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

        {/* 🆕 NUEVO: Selector dinámico de centro o curso */}
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
              // required  // <-- QUITAR ESTA LÍNEA
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

        {/* 🆕 NUEVO: Información contextual según tipo seleccionado */}
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