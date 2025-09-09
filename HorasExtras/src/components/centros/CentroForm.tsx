import React, { useState, useEffect } from "react";
import { centrosService } from "../../api/centrosService";
import { clientesService } from "../../api/clientesService";
import type { Cliente } from "../../types/cliente";
import "../../styles/components/centro/CentroForm.css";

interface Props {
  onSuccess?: () => void;
  centroAEditar?: any | null;
}

// Interfaz para el payload que se envía al backend
interface CentroPayload {
  id: string;
  nombreCentro: string;
  fechaInicio: string; // DateOnly en C# espera formato "YYYY-MM-DD"
  fechaFinal?: string | null;
  clienteId: string;
  estado: boolean; // El backend espera boolean, no string
  interventor?: string | null;
  vendedor?: string | null;
  valorOrden?: number;
  fechaFactura?: string | null;
  tipo?: string;
}

// Interfaz para respuestas de error del backend
interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    } | string;
  };
}

const CentroForm: React.FC<Props> = ({ onSuccess = () => { }, centroAEditar = null }) => {
  const [formData, setFormData] = useState({
    id: "",
    nombreCentro: "",
    fechaInicio: "",
    fechaFinal: "",
    clienteId: "",
    estado: "Abierto", // Mantenemos string en el formulario
    interventor: "",
    vendedor: "",
    valorOrden: 0,
    fechaFactura: "",
    tipo: "Suministros"
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valorOrdenDisplay, setValorOrdenDisplay] = useState<string>("0");

  const estadosDisponibles = ["Abierto", "Cerrado",];
  const tiposDisponibles = ["Suministros", "Proyecto", "Servicio"];

  // Función para formatear número con puntos como separadores de miles
  const formatearNumero = (valor: number): string => {
    return valor.toLocaleString('es-CO');
  };

  // Función para convertir string formateado a número
  const parseearNumero = (valorString: string): number => {
    const numeroLimpio = valorString.replace(/\./g, '').replace(/,/g, '');
    return numeroLimpio === '' ? 0 : Number(numeroLimpio);
  };

  useEffect(() => {
    clientesService
      .obtenerTodos()
      .then(setClientes)
      .catch((err) => console.error("Error cargando clientes", err));
  }, []);

  // Inicializar el valor display cuando cambie valorOrden
  useEffect(() => {
    setValorOrdenDisplay(formatearNumero(formData.valorOrden || 0));
  }, [formData.valorOrden]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
    setError(null);
  };
  // Prellenar formulario cuando se está editando
  useEffect(() => {
    if (centroAEditar) {
      setFormData({
        id: centroAEditar.id || "",
        nombreCentro: centroAEditar.nombreCentro || "",
        fechaInicio: centroAEditar.fechaInicio || "",
        fechaFinal: centroAEditar.fechaFinal || "",
        clienteId: centroAEditar.clienteId || "",
        estado: centroAEditar.estado ? "Abierto" : "Cerrado",
        interventor: centroAEditar.interventor || "",
        vendedor: centroAEditar.vendedor || "",
        valorOrden: centroAEditar.valorOrden || 0,
        fechaFactura: centroAEditar.fechaFactura || "",
        tipo: centroAEditar.tipo || "Suministros"
      });
    }
  }, [centroAEditar]);

  // Manejador especial para el campo de valor de orden
  const handleValorOrdenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;

    // Permitir solo números y puntos
    const valorLimpio = valor.replace(/[^\d]/g, '');

    if (valorLimpio === '') {
      setValorOrdenDisplay('0');
      setFormData(prev => ({ ...prev, valorOrden: 0 }));
      return;
    }

    const numeroReal = Number(valorLimpio);
    const valorFormateado = formatearNumero(numeroReal);

    setValorOrdenDisplay(valorFormateado);
    setFormData(prev => ({ ...prev, valorOrden: numeroReal }));
    setError(null);
  };

  // Manejar el foco en el input de valor
  const handleValorOrdenFocus = () => {
    // Mostrar el valor sin formatear para facilitar la edición
    const valorActual = formData.valorOrden || 0;
    if (valorActual === 0) {
      setValorOrdenDisplay('');
    } else {
      setValorOrdenDisplay(valorActual.toString());
    }
  };

  // Manejar cuando se pierde el foco
  const handleValorOrdenBlur = () => {
    // Volver a formatear el valor
    if (valorOrdenDisplay === '' || valorOrdenDisplay === '0') {
      setValorOrdenDisplay('0');
      setFormData(prev => ({ ...prev, valorOrden: 0 }));
    } else {
      const numeroReal = parseearNumero(valorOrdenDisplay);
      setFormData(prev => ({ ...prev, valorOrden: numeroReal }));
      setValorOrdenDisplay(formatearNumero(numeroReal));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id.trim() || !formData.nombreCentro.trim()) {
      setError("Por favor, complete los campos obligatorios (ID y Nombre).");
      return;
    }

    if (!formData.clienteId) {
      setError("Por favor, seleccione un cliente.");
      return;
    }

    if (!formData.fechaInicio) {
      setError("Por favor, ingrese la fecha de inicio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar el payload con las conversiones necesarias para el backend
      const payload: CentroPayload = {
        id: formData.id.trim(),
        nombreCentro: formData.nombreCentro.trim(),
        fechaInicio: formData.fechaInicio,
        fechaFinal: formData.fechaFinal?.trim() === "" ? null : formData.fechaFinal,
        clienteId: formData.clienteId,
        estado: formData.estado === "Abierto",
        interventor: formData.interventor?.trim() === "" ? null : formData.interventor?.trim(),
        vendedor: formData.vendedor?.trim() === "" ? null : formData.vendedor?.trim(),
        valorOrden: formData.valorOrden || 0,
        fechaFactura: formData.fechaFactura?.trim() === "" ? null : formData.fechaFactura,
        tipo: formData.tipo
      };

      console.log("Enviando payload:", payload);

      // Detectar si es edición o creación
      if (centroAEditar) {
        // Es edición
        await centrosService.actualizar(centroAEditar.id, payload as unknown as Parameters<typeof centrosService.actualizar>[1]);
        alert("Centro actualizado con éxito ✅");
      } else {
        // Es creación
        await centrosService.crear(payload as unknown as Parameters<typeof centrosService.crear>[0]);
        alert("Centro creado con éxito ✅");
      }
      onSuccess();
      if (!centroAEditar) {
        setFormData({
          id: "",
          nombreCentro: "",
          fechaInicio: "",
          fechaFinal: "",
          clienteId: "",
          estado: "Abierto",
          interventor: "",
          vendedor: "",
          valorOrden: 0,
          fechaFactura: "",
          tipo: "Suministros"
        });
        setValorOrdenDisplay("0");
      }
      // Resetear formulario

    } catch (err: unknown) {
      console.error("Error completo:", err); // Log para debug

      // Type guard para verificar si el error tiene la estructura esperada
      const isErrorResponse = (error: unknown): error is ErrorResponse => {
        return (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        );
      };

      if (isErrorResponse(err)) {
        const response = err.response;

        if (response?.status === 409) {
          setError("Ya existe un centro con ese ID.");
        } else if (response?.status === 400) {
          // Extraer mensaje de error del backend
          let errorMessage = "Datos inválidos.";

          if (response.data) {
            if (typeof response.data === 'string') {
              errorMessage = response.data;
            } else if (typeof response.data === 'object' && response.data.message) {
              errorMessage = response.data.message;
            }
          }

          setError(errorMessage);
        } else if (response?.status === 404) {
          setError("El cliente seleccionado no existe.");
        } else {
          setError(`Error del servidor (${response?.status || 'desconocido'}). Intente nuevamente.`);
        }
      } else {
        setError("Error de conexión. Verifique su conexión a internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centro-form-container">
      <div className="form-header">
        <div className="form-icon">🏗️</div>
        <div className="form-title-section">
          <h3>{centroAEditar ? "Editar Centro" : "Registrar Centro"}</h3>
          <p>{centroAEditar ? "Modifica los datos del centro" : "Llena los datos para crear un nuevo centro de trabajo"}</p>
        </div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      <form className="centro-form" onSubmit={handleSubmit}>
        <div className="form-section">
          {/* Información Básica */}
          <div className="section-title">
            <h4>📋 Información Básica</h4>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Orden de compra</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="Ej: CTRO01"
                required
                disabled={loading || !!centroAEditar} // ✅ Agregar esto
              />
            </div>
            <div className="form-group">
              <label>Nombre del Centro *</label>
              <input
                type="text"
                name="nombreCentro"
                value={formData.nombreCentro}
                onChange={handleChange}
                placeholder="Ej: Obra Itagüí"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={loading}
                required
              >
                {estadosDisponibles.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Centro</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                disabled={loading}
                required
              >
                {tiposDisponibles.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div className="section-title">
            <h4>📅 Fechas del Proyecto</h4>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Inicio *</label>
              <input
                type="date"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha Final (opcional)</label>
              <input
                type="date"
                name="fechaFinal"
                value={formData.fechaFinal || ""}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Factura (opcional)</label>
              <input
                type="date"
                name="fechaFactura"
                value={formData.fechaFactura || ""}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Valor de la Orden (COP)</label>
              <div className="valor-input-container" style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666',
                  fontSize: '14px',
                  pointerEvents: 'none'
                }}>
                  $
                </span>
                <input
                  type="text"
                  name="valorOrden"
                  value={valorOrdenDisplay}
                  onChange={handleValorOrdenChange}
                  onFocus={handleValorOrdenFocus}
                  onBlur={handleValorOrdenBlur}
                  placeholder="0"
                  disabled={loading}
                  style={{ paddingLeft: '20px' }}
                />
              </div>
              <small style={{ color: '#666', fontSize: '12px' }}>
                Ejemplo: 1.000.000 = Un millón de pesos
              </small>
            </div>
          </div>

          {/* Cliente y Personal */}
          <div className="section-title">
            <h4>👥 Cliente y Personal</h4>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Cliente *</label>
              <select
                name="clienteId"
                value={formData.clienteId}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">-- Selecciona un cliente --</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombreCliente}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Interventor (opcional)</label>
              <input
                type="text"
                name="interventor"
                value={formData.interventor || ""}
                onChange={handleChange}
                placeholder="Nombre del interventor"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Vendedor (opcional)</label>
              <input
                type="text"
                name="vendedor"
                value={formData.vendedor || ""}
                onChange={handleChange}
                placeholder="Nombre del vendedor"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-footer">
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : (centroAEditar ? "✏️ Actualizar Centro" : "✅ Crear Centro")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CentroForm;