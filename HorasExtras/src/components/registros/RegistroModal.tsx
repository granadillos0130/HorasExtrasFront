import React, { useState, useEffect } from "react";
import type { Registro, RegistroInputDto } from "../../types/registros";
import "../../styles/components/RegistroModal.css";

interface Props {
  registro: Registro | null;
  onClose: () => void;
  onSave: (id: number, data: RegistroInputDto) => void;
}

const RegistroModal: React.FC<Props> = ({ registro, onClose, onSave }) => {
  const [form, setForm] = useState<RegistroInputDto>({
    Trabajador_ID: 0,
    Centro_ID: 0,
    Orden_Compra_ID: 0,
    Fecha: "",
    Hora_Ingreso: "",
    Hora_Salida: "",
    Tiempo_Almuerzo: "",
  });

  useEffect(() => {
    if (registro) {
      setForm({
        Trabajador_ID: registro.trabajadorId,
        Centro_ID: registro.centroId,
        Orden_Compra_ID: registro.ordenCompraId,
        Fecha: registro.fecha.split("T")[0], // solo YYYY-MM-DD
        Hora_Ingreso: registro.horaIngreso,
        Hora_Salida: registro.horaSalida,
        Tiempo_Almuerzo: registro.tiempoAlmuerzo,
      });
    }
  }, [registro]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.includes("ID") ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (registro) {
      onSave(registro.id, form);
    }
  };

  if (!registro) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Registro</h2>

        <div className="form-grid">
          <label>
            Fecha:
            <input
              type="date"
              name="Fecha"
              value={form.Fecha}
              onChange={handleChange}
            />
          </label>
          <label>
            Hora Ingreso:
            <input
              type="time"
              name="Hora_Ingreso"
              value={form.Hora_Ingreso}
              onChange={handleChange}
            />
          </label>
          <label>
            Hora Salida:
            <input
              type="time"
              name="Hora_Salida"
              value={form.Hora_Salida}
              onChange={handleChange}
            />
          </label>
          <label>
            Tiempo Almuerzo:
            <input
              type="time"
              name="Tiempo_Almuerzo"
              value={form.Tiempo_Almuerzo}
              onChange={handleChange}
            />
          </label>
          <label>
            Trabajador ID:
            <input
              type="number"
              name="Trabajador_ID"
              value={form.Trabajador_ID}
              onChange={handleChange}
            />
          </label>
          <label>
            Centro ID:
            <input
              type="number"
              name="Centro_ID"
              value={form.Centro_ID}
              onChange={handleChange}
            />
          </label>
          <label>
            Orden Compra ID:
            <input
              type="number"
              name="Orden_Compra_ID"
              value={form.Orden_Compra_ID}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit} className="btn-save">
            Guardar
          </button>
          <button onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistroModal;
