import React, { useState, useEffect } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { centrosService } from "../../api/centrosService";
import { useRegistrosLote } from "../../hooks/useRegistrosLote";
import CentroBuscador from "../shared/CentroBuscador";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { Trabajador } from "../../types/trabajadores";
import type { Centro } from "../../types/centros";
import type { RegistroInputDto } from "../../types/registros";
import "../../styles/components/registros/RegistrosLoteForm.css";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  fechaInicial?: string;
}

const RegistrosLoteForm: React.FC<Props> = ({ onSuccess, onCancel, fechaInicial }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [analistas, setAnalistas] = useState<{ id: number; nombreCompleto: string }[]>([]);

  const { loading, error, crearLote, reset } = useRegistrosLote();

  const [registros, setRegistros] = useState<RegistroInputDto[]>([
    {
      Trabajador_ID: 0,
      Centro_ID: "",
      Nombr_Centro: "",
      Fecha: fechaInicial || new Date().toISOString().split("T")[0],
      Hora_Ingreso: "08:00",
      Hora_Salida: "17:00",
      Tiempo_Almuerzo: "01:00:00",
      desplazamientoIda: "",
      desplazamientoRegreso: "",
    }
  ]);

  // Función convertirATimeSpan idéntica a RegistrosForm
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

  useEffect(() => {
    if (fechaInicial) {
      setRegistros(prev => prev.map(registro => ({
        ...registro,
        Fecha: fechaInicial
      })));
    }
  }, [fechaInicial]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingData(true);
        const [trabajadoresData, centrosData, analistasData] = await Promise.all([
          trabajadoresService.getAll(),
          centrosService.getAll(),
          trabajadoresService.getAnalistas(),
        ]);
        setTrabajadores(trabajadoresData);
        setCentros(centrosData);
        setAnalistas(analistasData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatos();
  }, []);

  const agregarRegistro = () => {
    const ultimoRegistro = registros[registros.length - 1];
    setRegistros([
      ...registros,
      {
        ...ultimoRegistro,
        Trabajador_ID: 0,
        Centro_ID: "",
        Nombr_Centro: "",
        Fecha: fechaInicial || ultimoRegistro.Fecha,
      }
    ]);
  };

  const eliminarRegistro = (index: number) => {
    if (registros.length > 1) {
      const nuevosRegistros = registros.filter((_, i) => i !== index);
      setRegistros(nuevosRegistros);
    }
  };

  const actualizarRegistro = (
    index: number,
    field: keyof RegistroInputDto,
    value: string | number
  ) => {
    const nuevosRegistros = [...registros];
    nuevosRegistros[index] = {
      ...nuevosRegistros[index],
      [field]: value,
    };
    setRegistros(nuevosRegistros);
  };

  const handleCentroChange = (index: number, centroId: string) => {
    const centro = centros.find(c => c.id === centroId);
    const nombreCentro = centro ? centro.nombreCentro : "";
    const nuevosRegistros = [...registros];
    nuevosRegistros[index] = {
      ...nuevosRegistros[index],
      Centro_ID: centroId,
      Nombr_Centro: nombreCentro,
    };
    setRegistros(nuevosRegistros);
  };

  const handleTrabajadorChange = (index: number, trabajadorId: number, trabajador?: Trabajador) => {
    const nuevosRegistros = [...registros];
    nuevosRegistros[index] = {
      ...nuevosRegistros[index],
      Trabajador_ID: trabajadorId,
    };
    setRegistros(nuevosRegistros);
  };

  const duplicarRegistro = (index: number) => {
    const registroADuplicar = registros[index];
    const nuevosRegistros = [...registros];
    nuevosRegistros.splice(index + 1, 0, {
      ...registroADuplicar,
      Trabajador_ID: 0,
      Centro_ID: "",
      Nombr_Centro: "",
    });
    setRegistros(nuevosRegistros);
  };

  const validarRegistros = (): string[] => {
    const errores: string[] = [];

    registros.forEach((registro, index) => {
      if (registro.Trabajador_ID === 0) {
        errores.push(`Registro ${index + 1}: Seleccione un trabajador`);
      }
      if (!registro.Centro_ID) {
        errores.push(`Registro ${index + 1}: Seleccione un centro`);
      }
      if (!registro.Fecha) {
        errores.push(`Registro ${index + 1}: Ingrese una fecha`);
      }
      if (!registro.Hora_Ingreso || !registro.Hora_Salida) {
        errores.push(`Registro ${index + 1}: Ingrese horas de ingreso y salida`);
      }
    });

    return errores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errores = validarRegistros();
    if (errores.length > 0) {
      alert("Errores de validación:\n" + errores.join("\n"));
      return;
    }

    const normalizarHora = (hora: string) =>
      hora.length === 5 ? `${hora}:00` : hora;

    const registrosNormalizados = registros.map(registro => ({
      ...registro,
      Tiempo_Almuerzo: normalizarHora(registro.Tiempo_Almuerzo),
      desplazamientoIda: registro.desplazamientoIda?.trim()
        ? convertirATimeSpan(registro.desplazamientoIda)
        : undefined,
      desplazamientoRegreso: registro.desplazamientoRegreso?.trim()
        ? convertirATimeSpan(registro.desplazamientoRegreso)
        : undefined,
    }));

    const success = await crearLote(registrosNormalizados);

    if (success) {
      reset();
      alert(`¡Éxito! Se crearon ${registrosNormalizados.length} registros correctamente.`);
      onSuccess();
    }
  };

  const getTrabajadorNombre = (id: number) => {
    const trabajador = trabajadores.find(t => t.id === id);
    return trabajador ? trabajador.nombre : "Sin seleccionar";
  };

  if (loadingData) {
    return (
      <div className="registros-lote-form-container">
        <div className="loading-message">
          🔄 Cargando datos necesarios...
        </div>
      </div>
    );
  }

  return (
    <div className="registros-lote-form-container">
      <div className="form-header">
        <div className="form-icon">📊</div>
        <div className="form-title-section">
          <h3>Crear Registros en Lote</h3>
          <p>Agrega múltiples registros de trabajo de una vez</p>
          {fechaInicial && (
            <div style={{ 
              background: 'linear-gradient(135deg, #43e97b, #38f9d7)', 
              color: 'white', 
              padding: '5px 10px', 
              borderRadius: '6px', 
              fontSize: '0.8rem',
              marginTop: '5px',
              display: 'inline-block'
            }}>
              📅 Fecha: {new Date(fechaInicial).toLocaleDateString('es-ES')}
            </div>
          )}
        </div>
        <button type="button" className="btn-cancel-header" onClick={onCancel}>
          ❌ Cancelar
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button type="button" className="btn-dismiss-error" onClick={() => reset()} title="Cerrar error">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="registros-lote-form">
        <div className="registros-list">
          {registros.map((registro, index) => (
            <div key={index} className="registro-item">
              <div className="registro-header">
                <h4>Registro #{index + 1}</h4>
                <div className="registro-actions">
                  <button type="button" className="btn-duplicate" onClick={() => duplicarRegistro(index)} title="Duplicar registro">
                    📋
                  </button>
                  {registros.length > 1 && (
                    <button type="button" className="btn-remove" onClick={() => eliminarRegistro(index)} title="Eliminar registro">
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              <div className="registro-form">
                <div className="form-row">
                  <div className="form-group">
                    <TrabajadorBuscador
                      trabajadores={trabajadores}
                      value={registro.Trabajador_ID}
                      onChange={(trabajadorId, trabajador) => handleTrabajadorChange(index, trabajadorId, trabajador)}
                      label="Trabajador *"
                      required
                      showSelectedInfo={false}
                      className="compact"
                    />
                  </div>

                  <CentroBuscador
                    centros={centros}
                    value={registro.Centro_ID}
                    onChange={(centroId) => handleCentroChange(index, centroId)}
                    required
                    showSelectedInfo={false}
                    className="compact"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fecha *</label>
                    <input
                      type="date"
                      value={registro.Fecha}
                      onChange={(e) => actualizarRegistro(index, "Fecha", e.target.value)}
                      className="form-input"
                      required
                      disabled={!!fechaInicial}
                      style={fechaInicial ? { opacity: 0.7 } : {}}
                    />
                    {fechaInicial && (
                      <small style={{ color: '#43e97b', fontSize: '0.7rem' }}>
                        📅 Fecha preseleccionada del calendario
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hora Ingreso *</label>
                    <input
                      type="time"
                      value={registro.Hora_Ingreso}
                      onChange={(e) => actualizarRegistro(index, "Hora_Ingreso", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hora Salida *</label>
                    <input
                      type="time"
                      value={registro.Hora_Salida}
                      onChange={(e) => actualizarRegistro(index, "Hora_Salida", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tiempo Almuerzo *</label>
                    <select
                      value={registro.Tiempo_Almuerzo}
                      onChange={(e) => actualizarRegistro(index, "Tiempo_Almuerzo", e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="00:00:00">Sin almuerzo</option>
                      <option value="00:30:00">30 minutos</option>
                      <option value="01:00:00">1 hora</option>
                      <option value="01:30:00">1 hora 30 minutos</option>
                      <option value="02:00:00">2 horas</option>
                    </select>
                  </div>
                </div>

                {/* Campo de Analista - Nuevo */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Analista encargado</label>
                    <select
                      value={registro.AnalistaId || ""}
                      onChange={(e) => actualizarRegistro(index, "AnalistaId", Number(e.target.value))}
                      className="form-select"
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

                {/* Sección de Desplazamientos - Actualizada para ser idéntica a RegistrosForm */}
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

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Desplazamiento Ida</label>
                    <input
                      type="text"
                      value={registro.desplazamientoIda || ""}
                      onChange={(e) => actualizarRegistro(index, "desplazamientoIda", e.target.value)}
                      placeholder="Ej: 00:20, 1:15, 45"
                      className="form-input"
                    />
                    <small style={{ color: "#666", fontSize: "0.8rem" }}>
                      Tiempo de ida (formato HH:mm o solo minutos)
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Desplazamiento Regreso</label>
                    <input
                      type="text"
                      value={registro.desplazamientoRegreso || ""}
                      onChange={(e) => actualizarRegistro(index, "desplazamientoRegreso", e.target.value)}
                      placeholder="Ej: 00:30, 1:00, 20"
                      className="form-input"
                    />
                    <small style={{ color: "#666", fontSize: "0.8rem" }}>
                      Tiempo de regreso (formato HH:mm o solo minutos)
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-add-registro" onClick={agregarRegistro}>
            ➕ Agregar Otro Registro
          </button>

          <div className="submit-actions">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading || registros.length === 0}>
              {loading ? "🔄 Creando..." : `✅ Crear ${registros.length} Registro${registros.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </form>

      <div className="form-summary">
        <div className="summary-item">
          <span className="summary-icon">📊</span>
          <span className="summary-text">
            <strong>Total de registros:</strong> {registros.length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-icon">👥</span>
          <span className="summary-text">
            <strong>Trabajadores únicos:</strong>{" "}
            {new Set(registros.map((r) => r.Trabajador_ID).filter((id) => id > 0)).size}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-icon">🏢</span>
          <span className="summary-text">
            <strong>Centros únicos:</strong>{" "}
            {new Set(registros.map((r) => r.Centro_ID).filter((id) => id !== "")).size}
          </span>
        </div>
        {fechaInicial && (
          <div className="summary-item">
            <span className="summary-icon">📅</span>
            <span className="summary-text">
              <strong>Fecha común:</strong>{" "}
              {new Date(fechaInicial).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrosLoteForm;