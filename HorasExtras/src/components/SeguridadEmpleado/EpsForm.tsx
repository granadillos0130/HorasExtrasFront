// src/components/trabajadores/EpsForm.tsx
import React, { useState } from "react";
import type { Eps } from "../../types/eps";
import "../../styles/components/EpsForm.css";

interface Props {
  trabajadorId: number;
  onSave: (data: Omit<Eps, "id">) => void;
  onCancel: () => void;
}

const EpsForm: React.FC<Props> = ({ trabajadorId, onSave, onCancel }) => {
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
    <form className="eps-form" onSubmit={handleSubmit}>
      <h3>Asignar EPS</h3>
      <input
        type="text"
        placeholder="Nombre de la EPS"
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

export default EpsForm;
