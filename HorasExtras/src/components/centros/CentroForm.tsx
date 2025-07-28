import React, { useState, useEffect } from "react";
import { centrosService } from "../../api/centrosService";
import { clientesService } from "../../api/clientesService";
import type { Centro } from "../../types/centros";
import type { Cliente } from "../../types/cliente";
import "../../styles/components/centro/CentroForm.css";

interface Props {
  onSuccess?: () => void;
}

const CentroForm: React.FC<Props> = ({ onSuccess = () => {} }) => {
  const [formData, setFormData] = useState<Centro>({
    id: "",
    nombreCentro: "",
    fechaInicio: "",
    fechaFinal: "",
    clienteId: "",
    estado: "Activo", // Valor por defecto
    interventor: "",
    vendedor: "",
    valorOrden: 0,
    fechaFactura: "",
    tipo: "Obra" // Valor por defecto
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estadosDisponibles = ["Activo", "Inactivo", "Suspendido", "Finalizado"];
  const tiposDisponibles = ["Obra", "Mantenimiento", "Proyecto", "Servicio"];

  useEffect(() => {
    clientesService
      .obtenerTodos()
      .then(setClientes)
      .catch((err) => console.error("Error cargando clientes", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
    setError(null);
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

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        fechaFinal: formData.fechaFinal?.trim() === "" ? null : formData.fechaFinal,
        fechaFactura: formData.fechaFactura?.trim() === "" ? null : formData.fechaFactura,
        interventor: formData.interventor?.trim() === "" ? null : formData.interventor,
        vendedor: formData.vendedor?.trim() === "" ? null : formData.vendedor
      };

      await centrosService.crear(payload);
      alert("Centro creado con éxito ✅");
      onSuccess();
      
      // Resetear formulario
      setFormData({
        id: "",
        nombreCentro: "",
        fechaInicio: "",
        fechaFinal: "",
        clienteId: "",
        estado: "Activo",
        interventor: "",
        vendedor: "",
        valorOrden: 0,
        fechaFactura: "",
        tipo: "Obra"
      });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 409
      ) {
        setError("Ya existe un centro con ese ID.");
      } else {
        setError("Error al crear el centro.");
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
          <h3>Registrar Centro</h3>
          <p>Llena los datos para crear un nuevo centro de trabajo</p>
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
              <label>ID Centro *</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="Ej: CTRO01"
                required
                disabled={loading}
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
              <label>Valor de la Orden</label>
              <input
                type="number"
                name="valorOrden"
                value={formData.valorOrden}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                disabled={loading}
              />
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
              {loading ? "Guardando..." : "✅ Crear Centro"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CentroForm;