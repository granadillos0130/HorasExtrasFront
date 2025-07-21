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
  fechaInicial?: string; // 👈 Nueva prop para fecha inicial
}

const RegistrosLoteForm: React.FC<Props> = ({ onSuccess, onCancel, fechaInicial }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const { loading, error, crearLote, reset } = useRegistrosLote();

  const [registros, setRegistros] = useState<RegistroInputDto[]>([
    {
      Trabajador_ID: 0,
      Centro_ID: "",
      Nombr_Centro: "",
      Fecha: fechaInicial || new Date().toISOString().split("T")[0], // 👈 Usar fecha inicial
      Hora_Ingreso: "08:00",
      Hora_Salida: "17:00",
      Tiempo_Almuerzo: "01:00:00",
      // 👇 Nombres corregidos para coincidir con la interfaz (camelCase)
      desplazamientoIda: "",
      desplazamientoRegreso: "",
    }
  ]);

  // 👇 Actualizar fecha en todos los registros cuando cambie fechaInicial
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
        const [trabajadoresData, centrosData] = await Promise.all([
          trabajadoresService.getAll(),
          centrosService.getAll()
        ]);
        setTrabajadores(trabajadoresData);
        setCentros(centrosData);
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
        // 👇 Mantener fecha inicial si existe
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

    const registrosNormalizados = registros.map(registro => ({
      ...registro,
      Tiempo_Almuerzo: registro.Tiempo_Almuerzo.length === 5 
        ? `${registro.Tiempo_Almuerzo}:00` 
        : registro.Tiempo_Almuerzo,
      // 👇 Solo incluir desplazamiento si tiene valor (nombres corregidos)
      desplazamientoIda: registro.desplazamientoIda?.trim() 
        ? (registro.desplazamientoIda.length === 5 ? `${registro.desplazamientoIda}:00` : registro.desplazamientoIda)
        : undefined,
      desplazamientoRegreso: registro.desplazamientoRegreso?.trim() 
        ? (registro.desplazamientoRegreso.length === 5 ? `${registro.desplazamientoRegreso}:00` : registro.desplazamientoRegreso)
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
                      disabled={!!fechaInicial} // 👈 Deshabilitar si hay fecha inicial
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
                      onChange={(e) => {
                        const value = e.target.value.includes(":") && e.target.value.split(":").length === 2
                          ? e.target.value + ":00"
                          : e.target.value;
                        actualizarRegistro(index, "Tiempo_Almuerzo", value);
                      }}
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

                {/* 👇 Nueva fila para desplazamientos */}
                <div style={{ 
                  marginTop: '15px',
                  padding: '15px',
                  background: '#f8fafb',
                  borderRadius: '10px',
                  border: '1px dashed #e1e8ed'
                }}>
                  <h5 style={{ 
                    margin: '0 0 10px 0',
                    color: '#666',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}>
                    🚗 Tiempos de Desplazamiento (Opcional)
                  </h5>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Desplazamiento Ida</label>
                      <input
                        type="time"
                        value={registro.desplazamientoIda || ""}
                        onChange={(e) => actualizarRegistro(index, "desplazamientoIda", e.target.value)}
                        className="form-input"
                        placeholder="HH:MM"
                      />
                      <small style={{ color: '#666', fontSize: '0.7rem' }}>
                        Tiempo adicional de viaje
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Desplazamiento Regreso</label>
                      <input
                        type="time"
                        value={registro.desplazamientoRegreso || ""}
                        onChange={(e) => actualizarRegistro(index, "desplazamientoRegreso", e.target.value)}
                        className="form-input"
                        placeholder="HH:MM"
                      />
                      <small style={{ color: '#666', fontSize: '0.7rem' }}>
                        Tiempo adicional de regreso
                      </small>
                    </div>
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