// src/components/trabajadores/ArlForm.tsx
import React, { useState } from "react";
import type { Arl } from "../../types/arl";
import "../../styles/components/arl/ArlForm.css";

interface Props {
  trabajadorId: number;
  onSave: (data: Omit<Arl, "id">) => void;
  onCancel: () => void;
}

const ArlForm: React.FC<Props> = ({ trabajadorId, onSave, onCancel }) => {
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
    <form className="arl-form" onSubmit={handleSubmit}>
      <h3>Asignar ARL</h3>
      <input
        type="text"
        placeholder="Nombre de ARL"
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

export default ArlForm;
