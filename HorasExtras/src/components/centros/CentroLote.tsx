import React, { useState, useEffect } from "react";
import { centrosService } from "../../api/centrosService";
import { clientesService } from "../../api/clientesService";
import type { Centro } from "../../types/centros";
import type { Cliente } from "../../types/cliente";
import "../../styles/components/centro/CentroForm.css";

// Interface for the form data that matches what we're actually using
interface CentroFormData {
  id: string;
  nombreCentro: string;
  fechaInicio: string;
  clienteId: string;
  fechaFinal?: string;
  estado?: string;
  interventor?: string;
  vendedor?: string;
  valorOrden?: number;
  fechaFactura?: string;
  tipo?: string;
}

const CentroLoteForm: React.FC = () => {
  const [centros, setCentros] = useState<CentroFormData[]>([
    { 
      id: "", 
      nombreCentro: "", 
      fechaInicio: "", 
      clienteId: "",
      estado: "Abierto",
      tipo: "Obra"
    },
  ]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientesService
      .obtenerTodos()
      .then(setClientes)
      .catch((error) => console.error("Error cargando clientes", error));
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = [...centros];
    
    // Safely update the property
    if (name in updated[index]) {
      (updated[index] as any)[name] = value;
    }
    
    setCentros(updated);
    setError(null);
  };

  const agregarCentro = () => {
    setCentros([
      ...centros, 
      { 
        id: "", 
        nombreCentro: "", 
        fechaInicio: "", 
        clienteId: "",
        estado: "Abierto",
        tipo: "Obra"
      }
    ]);
  };

  const eliminarCentro = (index: number) => {
    const updated = centros.filter((_, i) => i !== index);
    setCentros(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const vacios = centros.some((c) => !c.id.trim() || !c.nombreCentro.trim() || !c.clienteId.trim());
    if (vacios) {
      setError("Todos los centros deben tener ID, nombre y cliente seleccionado.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Convert form data to Centro format expected by the API
      const centrosParaEnviar: Centro[] = centros.map(centro => ({
        id: centro.id.trim(),
        nombreCentro: centro.nombreCentro.trim(),
        fechaInicio: centro.fechaInicio,
        clienteId: centro.clienteId,
        fechaFinal: centro.fechaFinal?.trim() || null,
        estado: centro.estado || "Abierto",
        interventor: centro.interventor?.trim() || null,
        vendedor: centro.vendedor?.trim() || null,
        valorOrden: centro.valorOrden || 0,
        fechaFactura: centro.fechaFactura?.trim() || null,
        tipo: centro.tipo || "Obra"
      }));

      await centrosService.crearLote(centrosParaEnviar);
      alert("Centros creados con éxito ✅");
      
      // Reset form
      setCentros([{ 
        id: "", 
        nombreCentro: "", 
        fechaInicio: "", 
        clienteId: "",
        estado: "Abierto",
        tipo: "Obra"
      }]);
    } catch (error) {
      console.error("Error al crear los centros:", error);
      setError("Error al crear los centros. Por favor, verifique los datos e intente nuevamente.");
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
            <div className="section-title">
              <h4>🏗️ Centro #{index + 1}</h4>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>ID Centro *</label>
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
                <label>Nombre del Centro *</label>
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
              <div className="form-group">
                <label>Fecha de Inicio (opcional)</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={centro.fechaInicio || ""}
                  onChange={(e) => handleChange(index, e)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Fecha Final (opcional)</label>
                <input
                  type="date"
                  name="fechaFinal"
                  value={centro.fechaFinal || ""}
                  onChange={(e) => handleChange(index, e)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  name="clienteId"
                  value={centro.clienteId}
                  onChange={(e) => handleChange(index, e)}
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
              <div className="form-group">
                <label>Estado</label>
                <select
                  name="estado"
                  value={centro.estado || "Abierto"}
                  onChange={(e) => handleChange(index, e)}
                  disabled={loading}
                >
                  <option value="Abierto">Abierto</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Centro</label>
                <select
                  name="tipo"
                  value={centro.tipo || "Obra"}
                  onChange={(e) => handleChange(index, e)}
                  disabled={loading}
                >
                  <option value="Obra">Obra</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Proyecto">Proyecto</option>
                  <option value="Servicio">Servicio</option>
                </select>
              </div>
              <div className="form-group">
                <label>Interventor (opcional)</label>
                <input
                  type="text"
                  name="interventor"
                  value={centro.interventor || ""}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Nombre del interventor"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vendedor (opcional)</label>
                <input
                  type="text"
                  name="vendedor"
                  value={centro.vendedor || ""}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Nombre del vendedor"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Valor de la Orden (COP)</label>
                <input
                  type="number"
                  name="valorOrden"
                  value={centro.valorOrden || ""}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="0"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-footer">
              <button
                type="button"
                onClick={() => eliminarCentro(index)}
                disabled={loading || centros.length === 1}
                className="btn-secondary"
              >
                🗑️ Eliminar Centro
              </button>
            </div>
            
            {index < centros.length - 1 && <hr />}
          </div>
        ))}

        <div className="form-footer">
          <button 
            type="button" 
            onClick={agregarCentro} 
            disabled={loading}
            className="btn-secondary"
          >
            ➕ Agregar otro centro
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "✅ Crear Todos"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CentroLoteForm;