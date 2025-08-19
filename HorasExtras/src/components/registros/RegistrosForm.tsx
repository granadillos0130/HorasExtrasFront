import { AxiosError } from "axios";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { centrosService } from "../../api/centrosService";
import { registrosService } from "../../api/registrosService";
import CentroBuscador from "../shared/CentroBuscador";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { Trabajador } from "../../types/trabajadores";
import type { Centro } from "../../types/centros";
import type { RegistroInputDto } from "../../types/registros";
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
  const [loading, setLoading] = useState(false);
  const [analistas, setAnalistas] = useState<{ id: number; nombreCompleto: string }[]>([]);
  
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
    Fecha: fechaInicial || new Date().toISOString().split("T")[0],
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

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [trabajadoresData, centrosData, analistasData] = await Promise.all([
          trabajadoresService.getAll(),
          centrosService.getAll(),
          trabajadoresService.getAnalistas(),
        ]);
        
        // Verificar que cada trabajador tenga las propiedades necesarias
        const trabajadoresValidos = trabajadoresData.filter(t => 
          t && t.id && t.nombre && t.cedula
        );
        
        setTrabajadores(trabajadoresValidos);
        setCentros(centrosData);
        setAnalistas(analistasData);
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

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

    if (!formData.Trabajador_ID || !formData.Centro_ID || !formData.Nombr_Centro) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    if (showDuplicateWarning) {
      const trabajadorNombre = trabajadores.find(t => t.id === formData.Trabajador_ID)?.nombre || "este trabajador";
      const tipoTrabajador = formData.EsConductor ? "conductor" : "trabajador";
      const confirmMessage = `⚠️ ATENCIÓN: Ya existe${registrosExistentes.length > 1 ? 'n' : ''} ${registrosExistentes.length} registro${registrosExistentes.length > 1 ? 's' : ''} para ${trabajadorNombre} en la fecha ${new Date(formData.Fecha).toLocaleDateString('es-ES')}.\n\n` +
        `${formData.EsConductor 
          ? '🚛 CONDUCTOR: Los desplazamientos se incluirán como tiempo de trabajo.' 
          : '👷 NO CONDUCTOR: Los desplazamientos se restarán del tiempo trabajado.'
        }\n\n` +
        `${registrosExistentes.length === 1 ? 'El tiempo de almuerzo NO se descontará de este nuevo registro.' : 'El tiempo de almuerzo ya fue descontado en el primer registro del día.'}\n\n` +
        `¿Está seguro que desea continuar creando este registro adicional para ${tipoTrabajador}?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    setLoading(true);

    try {
      const normalizarHora = (hora: string) =>
        hora.length === 5 ? `${hora}:00` : hora;

      const payload: RegistroInputDto = {
        ...formData,
        Tiempo_Almuerzo: normalizarHora(formData.Tiempo_Almuerzo),
        desplazamientoIda: formData.desplazamientoIda?.trim()
          ? convertirATimeSpan(formData.desplazamientoIda)
          : undefined,
        desplazamientoRegreso: formData.desplazamientoRegreso?.trim()
          ? convertirATimeSpan(formData.desplazamientoRegreso)
          : undefined,
      };

      await registrosService.crear(payload);
      
      const tipoMensaje = formData.EsConductor 
        ? "Registro de conductor creado correctamente (desplazamientos incluidos)" 
        : "Registro creado correctamente (desplazamientos descontados)";
      
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

  // 🔧 HANDLER CORREGIDO - SIN verificación isMountedRef que bloquea actualizaciones
  const handleInputChange = (field: keyof RegistroInputDto, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🔧 HANDLER CORREGIDO PARA TRABAJADOR - SIN verificación isMountedRef
  const handleTrabajadorChange = (trabajadorId: number) => {
    setFormData((prev) => ({
      ...prev,
      Trabajador_ID: trabajadorId,
    }));
  };

  // 🔧 HANDLER CORREGIDO PARA CENTRO - SIN verificación isMountedRef
  const handleCentroChange = (centroId: string) => {
    const centroSeleccionado = centros.find((c) => c.id === centroId);
    setFormData((prev) => ({
      ...prev,
      Centro_ID: centroId,
      Nombr_Centro: centroSeleccionado?.nombreCentro || "",
    }));
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
            <label>Centro *</label>
            <CentroBuscador
              centros={centros}
              value={formData.Centro_ID}
              onChange={handleCentroChange}
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

        <div className="form-row">
          <div className="form-group">
            <label>Fecha *</label>
            <input
              type="date"
              value={formData.Fecha}
              onChange={(e) => handleInputChange("Fecha", e.target.value)}
              required
            />
          </div>
        </div>

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
              value={formData.Tiempo_Almuerzo}
              onChange={(e) => handleInputChange("Tiempo_Almuerzo", e.target.value)}
              required
              style={showDuplicateWarning ? { borderColor: '#ff6b35' } : {}}
            >
              <option value="00:00:00">Sin almuerzo</option>
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

        <button 
          type="submit" 
          disabled={loading || verificandoRegistros} 
          className="btn-submit"
        >
          {loading ? "Guardando..." : "Crear Registro"}
          {showDuplicateWarning && " (Registro Adicional)"}
          {formData.EsConductor ? " 🚛" : " 👷"}
        </button>
      </form>

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

export default RegistrosForm;