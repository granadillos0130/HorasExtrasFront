import React, { useState, useEffect } from "react";
import { centrosService } from "../../api/centrosService";
import { clientesService } from "../../api/clientesService";
import type { Centro } from "../../types/centros";
import type { Cliente } from "../../types/cliente";
import "../../styles/components/centro/CentroForm.css";

interface Props {
  onSuccess?: () => void; // ✅ ahora es opcional
}

const CentroForm: React.FC<Props> = ({ onSuccess = () => {} }) => { // ✅ valor por defecto
  const [formData, setFormData] = useState<Centro>({
    id: "",
    nombreCentro: "",
    fechaInicio: "",
    fechaFinal:"", // opcional
    clienteId: ""
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientesService
      .obtenerTodos()
      .then(setClientes)
      .catch((err) => console.error("Error cargando clientes", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.id.trim() || !formData.nombreCentro.trim()) {
    setError("Por favor, complete los campos obligatorios.");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const payload = {
  ...formData,
  fechaFinal: formData.fechaFinal?.trim() === "" ? null : formData.fechaFinal
};


    await centrosService.crear(payload);
    alert("Centro creado con éxito ✅");
    onSuccess();
    setFormData({
      id: "",
      nombreCentro: "",
      fechaInicio: "",
      fechaFinal: "",
      clienteId: ""
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
          <p>Llena los datos para crear un nuevo centro</p>
        </div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      <form className="centro-form" onSubmit={handleSubmit}>
        <div className="form-section">
          {/* ID y Nombre */}
          <div className="form-row">
            <div className="form-group">
              <label>ID Centro</label>
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
              <label>Nombre</label>
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

          {/* Fecha y hora de inicio opcional */}
         <div className="form-row">
  <div className="form-group">
    <label>Fecha de Inicio</label>
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


          {/* Cliente */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>Cliente</label>
              <select
                name="clienteId"
                value={formData.clienteId}
                onChange={handleChange}
                disabled={loading}
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

          <div className="form-footer">
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear Centro"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CentroForm;
