/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { horariosRotativosService } from "../../api/horariosRotativosService";
import { trabajadoresService } from "../../api/trabajadoresService";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { Trabajador } from "../../types/trabajadores";
import type { HorarioRotativo, AsignarHorarioDto } from "../../types/horariosRotativos";
import "../../styles/components/horario/Modal.css";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AsignarHorarioModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [horarios, setHorarios] = useState<HorarioRotativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AsignarHorarioDto>({
    trabajadorId: 0,
    horarioParId: 0,
    horarioImparId: 0,
    fechaInicio: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingData(true);
        const [trabajadoresData, horariosData] = await Promise.all([
          trabajadoresService.getAll(),
          horariosRotativosService.getCatalogo()
        ]);
        setTrabajadores(trabajadoresData);
        setHorarios(horariosData.filter(h => h.activo));
      } catch (err) {
        setError("Error al cargar los datos");
        console.error("Error:", err);
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.trabajadorId === 0) {
      setError("Selecciona un trabajador");
      return;
    }

    if (formData.horarioParId === 0 || formData.horarioImparId === 0) {
      setError("Debes seleccionar ambos horarios (par e impar)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await horariosRotativosService.asignarHorarioATrabajador(formData);
      alert("Horario asignado correctamente");
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.mensaje || "Error al asignar el horario";
      setError(errorMsg);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const horarioParSeleccionado = horarios.find(h => h.id === formData.horarioParId);
  const horarioImparSeleccionado = horarios.find(h => h.id === formData.horarioImparId);

  if (loadingData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading-message">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Asignar Horario Rotativo</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="info-box">
            <strong>Sistema de Rotación:</strong> El trabajador alternará semanalmente entre dos horarios.
            Las semanas pares usarán el horario PAR, las impares usarán el horario IMPAR.
          </div>

          <div className="form-group">
            <TrabajadorBuscador
              trabajadores={trabajadores}
              value={formData.trabajadorId}
              onChange={(id) => setFormData(prev => ({ ...prev, trabajadorId: id }))}
              label="Trabajador *"
              placeholder="Buscar trabajador..."
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Horario SEMANA PAR *</label>
              <select
                value={formData.horarioParId}
                onChange={(e) => setFormData(prev => ({ ...prev, horarioParId: Number(e.target.value) }))}
                required
                disabled={loading}
              >
                <option value={0}>Seleccionar horario</option>
                {horarios.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.nombre}
                  </option>
                ))}
              </select>
              {horarioParSeleccionado && (
                <small className="horario-preview">
                  {horarioParSeleccionado.descripcion || `${horarioParSeleccionado.totalDetalles} días configurados`}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Horario SEMANA IMPAR *</label>
              <select
                value={formData.horarioImparId}
                onChange={(e) => setFormData(prev => ({ ...prev, horarioImparId: Number(e.target.value) }))}
                required
                disabled={loading}
              >
                <option value={0}>Seleccionar horario</option>
                {horarios.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.nombre}
                  </option>
                ))}
              </select>
              {horarioImparSeleccionado && (
                <small className="horario-preview">
                  {horarioImparSeleccionado.descripcion || `${horarioImparSeleccionado.totalDetalles} días configurados`}
                </small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Fecha de Inicio *</label>
            <input
              type="date"
              value={formData.fechaInicio}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
              required
              disabled={loading}
            />
            <small>La rotación comenzará desde esta fecha</small>
          </div>

          {formData.horarioParId > 0 && formData.horarioImparId > 0 && (
            <div className="preview-box">
              <strong>Vista Previa:</strong>
              <ul>
                <li>Semanas PARES: {horarioParSeleccionado?.nombre}</li>
                <li>Semanas IMPARES: {horarioImparSeleccionado?.nombre}</li>
                <li>Inicio: {new Date(formData.fechaInicio).toLocaleDateString('es-ES')}</li>
              </ul>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || formData.trabajadorId === 0}
            >
              {loading ? "Asignando..." : "Asignar Horario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AsignarHorarioModal;