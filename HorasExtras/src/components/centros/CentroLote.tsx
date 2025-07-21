import React, { useState, useEffect } from "react";
import { centrosService } from "../../api/centrosService";
import { clientesService } from "../../api/clientesService";
import type { Centro } from "../../types/centros";
import type { Cliente } from "../../types/cliente";
import "../../styles/components/centro/CentroForm.css";

const CentroLoteForm: React.FC = () => {
  const [centros, setCentros] = useState<Centro[]>([
    { id: "", nombreCentro: "", fechaHoraInicio: "", clienteId: "" },
  ]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientesService
      .obtenerTodos()
      .then(setClientes)
      .catch((err) => console.error("Error cargando clientes", err));
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = [...centros];
    updated[index][name as keyof Centro] = value;
    setCentros(updated);
    setError(null);
  };

  const agregarCentro = () => {
    setCentros([...centros, { id: "", nombreCentro: "", fechaHoraInicio: "", clienteId: "" }]);
  };

  const eliminarCentro = (index: number) => {
    const updated = centros.filter((_, i) => i !== index);
    setCentros(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const vacios = centros.some((c) => !c.id.trim() || !c.nombreCentro.trim());
    if (vacios) {
      setError("Todos los centros deben tener ID y nombre.");
      return;
    }

    setLoading(true);
    try {
      await centrosService.crearLote(centros);
      alert("Centros creados con éxito ✅");
      setCentros([{ id: "", nombreCentro: "", fechaHoraInicio: "", clienteId: "" }]);
    } catch (err) {
      setError("Error al crear los centros.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centro-form-container">
      <div className="form-header">
        <div className="form-icon">📦</div>
        <div className="form-title-section">
          <h3>Registrar Centros en Lote</h3>
          <p>Agrega varios centros de una sola vez</p>
        </div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      <form className="centro-form" onSubmit={handleSubmit}>
        {centros.map((centro, index) => (
          <div key={index} className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label>ID Centro</label>
                <input
                  type="text"
                  name="id"
                  value={centro.id}
                  onChange={(e) => handleChange(index, e)}
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
                  value={centro.nombreCentro}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Ej: Obra Bello"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Fecha y Hora de Inicio (opcional)</label>
                <input
                  type="datetime-local"
                  name="fechaHoraInicio"
                  value={centro.fechaHoraInicio || ""}
                  onChange={(e) => handleChange(index, e)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Cliente</label>
                <select
                  name="clienteId"
                  value={centro.clienteId}
                  onChange={(e) => handleChange(index, e)}
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
              <button
                type="button"
                onClick={() => eliminarCentro(index)}
                disabled={loading || centros.length === 1}
              >
                Eliminar
              </button>
            </div>
            <hr />
          </div>
        ))}

        <div className="form-footer">
          <button type="button" onClick={agregarCentro} disabled={loading}>
            ➕ Agregar otro centro
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear Todos"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CentroLoteForm;
