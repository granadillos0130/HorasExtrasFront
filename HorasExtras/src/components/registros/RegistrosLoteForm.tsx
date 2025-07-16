// src/components/registros/RegistrosLoteForm.tsx
import React, { useState, useEffect } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { centrosService } from "../../api/centrosService";
import { ordenesService } from "../../api/ordenesService";
import { useRegistrosLote } from "../../hooks/useRegistrosLote";
import CentroBuscador from "../shared/CentroBuscador";
import type { Trabajador } from "../../types/trabajadores";
import type { Centro } from "../../types/centros";
import type { OrdenCompra } from "../../types/ordenes";
import type { RegistroInputDto } from "../../types/registros";
import "../../styles/components/RegistrosLoteForm.css";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const RegistrosLoteForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const { loading, error, resultado, crearLote, reset } = useRegistrosLote();

  const [registros, setRegistros] = useState<RegistroInputDto[]>([
    {
      Trabajador_ID: 0,
      Centro_ID: "",
      Orden_Compra_ID: 0,
      Fecha: new Date().toISOString().split("T")[0],
      Hora_Ingreso: "08:00",
      Hora_Salida: "17:00",
      Tiempo_Almuerzo: "01:00",
    }
  ]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingData(true);
        const [trabajadoresData, centrosData, ordenesData] = await Promise.all([
          trabajadoresService.getAll(),
          centrosService.getAll(),
          ordenesService.getAll(),
        ]);
        setTrabajadores(trabajadoresData);
        setCentros(centrosData);
        setOrdenes(ordenesData);
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
        Trabajador_ID: 0, // Resetear trabajador para que seleccione uno nuevo
        Centro_ID: "", // Resetear centro
      }
    ]);
  };

  const eliminarRegistro = (index: number) => {
    if (registros.length > 1) {
      const nuevosRegistros = registros.filter((_, i) => i !== index);
      setRegistros(nuevosRegistros);
    }
  };

  const actualizarRegistro = (index: number, field: keyof RegistroInputDto, value: string | number) => {
    const nuevosRegistros = [...registros];
    nuevosRegistros[index] = {
      ...nuevosRegistros[index],
      [field]: value,
    };
    setRegistros(nuevosRegistros);
  };

  const handleCentroChange = (index: number, centroId: string) => {
    actualizarRegistro(index, "Centro_ID", centroId);
  };

  const duplicarRegistro = (index: number) => {
    const registroADuplicar = registros[index];
    const nuevosRegistros = [...registros];
    nuevosRegistros.splice(index + 1, 0, {
      ...registroADuplicar,
      Trabajador_ID: 0, // Resetear trabajador
      Centro_ID: "", // Resetear centro
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
      if (registro.Orden_Compra_ID === 0) {
        errores.push(`Registro ${index + 1}: Seleccione una orden de compra`);
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

    // Normalizar datos antes de enviar
    const registrosNormalizados = registros.map(registro => ({
      ...registro,
      Tiempo_Almuerzo: registro.Tiempo_Almuerzo.length === 5 
        ? `${registro.Tiempo_Almuerzo}:00` 
        : registro.Tiempo_Almuerzo,
    }));

    const success = await crearLote(registrosNormalizados);
    
    if (success) {
      // Limpiar el estado del hook
      reset();
      
      // Mostrar mensaje de éxito
      alert(`¡Éxito! Se crearon ${registrosNormalizados.length} registros correctamente.`);
      
      // Cerrar el formulario automáticamente
      onSuccess();
    }
  };

  const getTrabajadorNombre = (id: number) => {
    const trabajador = trabajadores.find(t => t.id === id);
    return trabajador ? trabajador.nombre : "Sin seleccionar";
  };

  const getCentroNombre = (id: string | number) => {
    const centro = centros.find(c => c.id === String(id));
    return centro ? centro.nombreCentro : "Sin seleccionar";
  };

  const getOrdenNombre = (id: number) => {
    const orden = ordenes.find(o => o.id === id);
    return orden ? `${orden.numero} - ${orden.descripcion}` : "Sin seleccionar";
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
        </div>
        <button 
          type="button" 
          className="btn-cancel-header"
          onClick={onCancel}
        >
          ❌ Cancelar
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button 
            type="button" 
            className="btn-dismiss-error"
            onClick={() => reset()}
            title="Cerrar error"
          >
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
                  <button
                    type="button"
                    className="btn-duplicate"
                    onClick={() => duplicarRegistro(index)}
                    title="Duplicar registro"
                  >
                    📋
                  </button>
                  {registros.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => eliminarRegistro(index)}
                      title="Eliminar registro"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              <div className="registro-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Trabajador</label>
                    <select
                      value={registro.Trabajador_ID}
                      onChange={(e) => actualizarRegistro(index, "Trabajador_ID", Number(e.target.value))}
                      className="form-select"
                      required
                    >
                      <option value={0}>Seleccione trabajador</option>
                      {trabajadores.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                    {registro.Trabajador_ID > 0 && (
                      <div className="selected-preview">
                        👤 {getTrabajadorNombre(registro.Trabajador_ID)}
                      </div>
                    )}
                  </div>

                  <CentroBuscador
                    centros={centros}
                    value={registro.Centro_ID}
                    onChange={(centroId) => handleCentroChange(index, centroId)}
                    required
                    showSelectedInfo={false}
                    className="compact"
                  />

                  <div className="form-group">
                    <label className="form-label">Orden de Compra</label>
                    <select
                      value={registro.Orden_Compra_ID}
                      onChange={(e) => actualizarRegistro(index, "Orden_Compra_ID", Number(e.target.value))}
                      className="form-select"
                      required
                    >
                      <option value={0}>Seleccione orden</option>
                      {ordenes.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.numero} - {o.descripcion}
                        </option>
                      ))}
                    </select>
                    {registro.Orden_Compra_ID > 0 && (
                      <div className="selected-preview">
                        📋 {getOrdenNombre(registro.Orden_Compra_ID)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fecha</label>
                    <input
                      type="date"
                      value={registro.Fecha}
                      onChange={(e) => actualizarRegistro(index, "Fecha", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hora Ingreso</label>
                    <input
                      type="time"
                      value={registro.Hora_Ingreso}
                      onChange={(e) => actualizarRegistro(index, "Hora_Ingreso", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hora Salida</label>
                    <input
                      type="time"
                      value={registro.Hora_Salida}
                      onChange={(e) => actualizarRegistro(index, "Hora_Salida", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tiempo Almuerzo</label>
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
                      <option value="00:00">Sin almuerzo</option>
                      <option value="00:30">30 minutos</option>
                      <option value="01:00">1 hora</option>
                      <option value="01:30">1 hora 30 minutos</option>
                      <option value="02:00">2 horas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-add-registro"
            onClick={agregarRegistro}
          >
            ➕ Agregar Otro Registro
          </button>

          <div className="submit-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || registros.length === 0}
            >
              {loading ? "🔄 Creando..." : `✅ Crear ${registros.length} Registro${registros.length !== 1 ? 's' : ''}`}
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
            <strong>Trabajadores únicos:</strong> {new Set(registros.map(r => r.Trabajador_ID).filter(id => id > 0)).size}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-icon">🏢</span>
          <span className="summary-text">
            <strong>Centros únicos:</strong> {new Set(registros.map(r => r.Centro_ID).filter(id => id !== "")).size}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegistrosLoteForm;