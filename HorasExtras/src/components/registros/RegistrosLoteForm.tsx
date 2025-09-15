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

  // Estados para el rango de fechas
  const [modoRangoFechas, setModoRangoFechas] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(fechaInicial || new Date().toISOString().split("T")[0]);
  const [fechaFin, setFechaFin] = useState(fechaInicial || new Date().toISOString().split("T")[0]);
  const [excluirDomingos, setExcluirDomingos] = useState(false);
  const [excluirSabados, setExcluirSabados] = useState(false);
  const [excluirViernes, setExcluirViernes] = useState(false);

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
      EsConductor: false, // 🆕 NUEVO CAMPO
    }
  ]);

  const convertirATimeSpan = (valor: string | null): string => {
    if (!valor) return ""; // Manejar null o string vacío

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

  const generarFechasDelRango = (): string[] => {
    const fechas: string[] = [];
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
      const diaSemana = fecha.getDay();

      if (excluirDomingos && diaSemana === 0) continue;
      if (excluirSabados && diaSemana === 6) continue;
      if (excluirViernes && diaSemana === 5) continue;

      fechas.push(fecha.toISOString().split("T")[0]);
    }

    return fechas;
  };

  const generarRegistrosPorRango = () => {
    if (!modoRangoFechas) return;

    const fechas = generarFechasDelRango();
    const registroBase = registros[0];

    if (fechas.length === 0) {
      alert("No hay fechas válidas en el rango seleccionado con las exclusiones configuradas.");
      return;
    }

    const nuevosRegistros = fechas.map(fecha => ({
      ...registroBase,
      Fecha: fecha,
    }));

    setRegistros(nuevosRegistros);
  };

  useEffect(() => {
    if (fechaInicial) {
      setFechaInicio(fechaInicial);
      setFechaFin(fechaInicial);
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
    value: string | number | boolean
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

  const handleTrabajadorChange = (index: number, trabajadorId: number) => {
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

  const aplicarConfiguracionATodos = () => {
    if (registros.length === 0) return;

    const registroBase = registros[0];
    const configuracionComun = {
      Hora_Ingreso: registroBase.Hora_Ingreso,
      Hora_Salida: registroBase.Hora_Salida,
      Tiempo_Almuerzo: registroBase.Tiempo_Almuerzo,
      desplazamientoIda: registroBase.desplazamientoIda,
      desplazamientoRegreso: registroBase.desplazamientoRegreso,
      EsConductor: registroBase.EsConductor, // 🆕 INCLUIR CONDUCTOR
      AnalistaId: registroBase.AnalistaId,
      Centro_ID: registroBase.Centro_ID,
      Nombr_Centro: registroBase.Nombr_Centro,
    };

    const registrosActualizados = registros.map(registro => ({
      ...registro,
      ...configuracionComun,
    }));

    setRegistros(registrosActualizados);
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
      Tiempo_Almuerzo: normalizarHora(registro.Tiempo_Almuerzo || "01:00:00"), // Agregar || con valor por defecto
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
      const conductores = registrosNormalizados.filter(r => r.EsConductor).length;
      const noConductores = registrosNormalizados.length - conductores;
      alert(`¡Éxito! Se crearon ${registrosNormalizados.length} registros correctamente.\n${conductores} conductores y ${noConductores} no conductores.`);
      onSuccess();
    }
  };

  const getTrabajadorNombre = (id: number) => {
    const trabajador = trabajadores.find(t => t.id === id);
    return trabajador ? trabajador.nombre : "Sin seleccionar";
  };

  // 🆕 FUNCIÓN PARA OBTENER RESUMEN DE CONDUCTORES
  const getResumenConductores = () => {
    const conductores = registros.filter(r => r.EsConductor).length;
    const noConductores = registros.length - conductores;
    return { conductores, noConductores };
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

      {/* Sección de Rango de Fechas */}
      <div className="rango-fechas-section" style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '25px',
        border: '2px solid #667eea'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
            📅 Generación Automática por Rango de Fechas
          </h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={modoRangoFechas}
              onChange={(e) => setModoRangoFechas(e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            <span>Activar modo rango</span>
          </label>
        </div>

        {modoRangoFechas && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  📅 Fecha Inicio:
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '2px solid #fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  📅 Fecha Fin:
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '2px solid #fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excluirSabados}
                  onChange={(e) => setExcluirSabados(e.target.checked)}
                  style={{ transform: 'scale(1.1)' }}
                />
                <span>🚫 Excluir Sábados</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excluirDomingos}
                  onChange={(e) => setExcluirDomingos(e.target.checked)}
                  style={{ transform: 'scale(1.1)' }}
                />
                <span>🚫 Excluir Domingos</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excluirViernes}
                  onChange={(e) => setExcluirViernes(e.target.checked)}
                  style={{ transform: 'scale(1.1)' }}
                />
                <span>🚫 Excluir Viernes <small>(horario diferente)</small></span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={generarRegistrosPorRango}
                style={{
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🚀 Generar {generarFechasDelRango().length} Registros
              </button>

              <button
                type="button"
                onClick={aplicarConfiguracionATodos}
                style={{
                  background: 'linear-gradient(135deg, #ff9500, #ff6b35)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🔄 Aplicar Config. a Todos
              </button>
            </div>

            <div style={{
              marginTop: '10px',
              padding: '10px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '6px',
              fontSize: '0.85rem'
            }}>
              <strong>Fechas que se generarán:</strong> {generarFechasDelRango().join(', ') || 'Ninguna'}
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="registros-lote-form">
        <div className="registros-list">
          {registros.map((registro, index) => (
            <div key={index} className="registro-item">
              <div className="registro-header">
                <h4>Registro #{index + 1}</h4>
                <div style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>
                  📅 {new Date(registro.Fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                {registro.Trabajador_ID > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#007bff', marginLeft: '10px' }}>
                    👤 {getTrabajadorNombre(registro.Trabajador_ID)}
                  </div>
                )}
                {/* 🆕 MOSTRAR SI ES CONDUCTOR */}
                <div style={{ fontSize: '0.8rem', marginLeft: '10px' }}>
                  {registro.EsConductor ? '🚛 Conductor' : '👷 No Conductor'}
                </div>
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
                      onChange={(trabajadorId) => handleTrabajadorChange(index, trabajadorId)}
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
                      disabled={modoRangoFechas}
                      style={modoRangoFechas ? { opacity: 0.7, background: '#f0f0f0' } : {}}
                    />
                    {modoRangoFechas && (
                      <small style={{ color: '#667eea', fontSize: '0.7rem' }}>
                        🔒 Fecha controlada por rango automático
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
                      value={registro.Tiempo_Almuerzo || ""}
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

                {/* 🆕 CAMPO CONDUCTOR */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={registro.EsConductor}
                        onChange={(e) => actualizarRegistro(index, "EsConductor", e.target.checked)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <span style={{ fontWeight: '600' }}>
                        {registro.EsConductor ? '🚛 Es Conductor' : '👷 No es Conductor'}
                      </span>
                    </label>
                    <small style={{ color: "#666", fontSize: "0.8rem", marginTop: '5px', display: 'block' }}>
                      {registro.EsConductor
                        ? 'Los desplazamientos se incluirán como tiempo de trabajo'
                        : 'Los desplazamientos se descontarán del tiempo trabajado'
                      }
                    </small>
                  </div>

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

                {/* Sección de Desplazamientos */}
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
                    {registro.EsConductor
                      ? 'Como es conductor, estos tiempos se INCLUYEN en el cálculo'
                      : 'Como NO es conductor, estos tiempos se DESCUENTAN del trabajo'
                    }
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
          {!modoRangoFechas && (
            <button type="button" className="btn-add-registro" onClick={agregarRegistro}>
              ➕ Agregar Otro Registro
            </button>
          )}

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
        {/* 🆕 RESUMEN DE CONDUCTORES */}
        <div className="summary-item">
          <span className="summary-icon">🚛</span>
          <span className="summary-text">
            <strong>Conductores:</strong>{" "}
            {getResumenConductores().conductores}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-icon">👷</span>
          <span className="summary-text">
            <strong>No Conductores:</strong>{" "}
            {getResumenConductores().noConductores}
          </span>
        </div>
        {modoRangoFechas && (
          <>
            <div className="summary-item">
              <span className="summary-icon">📅</span>
              <span className="summary-text">
                <strong>Rango:</strong>{" "}
                {fechaInicio} → {fechaFin}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">🚫</span>
              <span className="summary-text">
                <strong>Exclusiones:</strong>{" "}
                {excluirSabados && excluirDomingos ? "Sáb. y Dom." :
                  excluirSabados ? "Sábados" :
                    excluirDomingos ? "Domingos" : "Ninguna"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegistrosLoteForm;