// src/components/trabajadores/PensionForm.tsx
import React, { useState } from "react";
import type { Pension } from "../../types/pension";
import "../../styles/components/PensionForm.css";

interface Props {
  trabajadorId: number;
  onSave: (data: Omit<Pension, "id">) => void;
  onCancel: () => void;
}

const PensionForm: React.FC<Props> = ({ trabajadorId, onSave, onCancel }) => {
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nombre,
      trabajadorId,
      fechaInicio,
      fechaFin: fechaFin || undefined
    });
  };

  return (
    <form className="pension-form" onSubmit={handleSubmit}>
      <h3>Asignar Pensión</h3>
      <input
        type="text"
        placeholder="Nombre de la Pensión"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        type="date"
        placeholder="Fecha Inicio"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        required
      />
      <input
        type="date"
        placeholder="Fecha Fin (opcional)"
        value={fechaFin}
        onChange={(e) => setFechaFin(e.target.value)}
      />
      <div className="form-actions">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default PensionForm;
