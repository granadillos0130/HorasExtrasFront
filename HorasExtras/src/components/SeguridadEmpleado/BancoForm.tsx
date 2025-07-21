// src/components/trabajadores/BancoForm.tsx
import React, { useState } from "react";
import type { Banco } from "../../types/banco";
import "../../styles/components/banco/BancoForm.css";

interface Props {
  trabajadorId: number;
  onSave: (data: Omit<Banco, "id">) => void;
  onCancel: () => void;
}

const BancoForm: React.FC<Props> = ({ trabajadorId, onSave, onCancel }) => {
  const [nombre, setNombre] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nombre,
      numeroCuenta,
      trabajadorId
    });
  };

  return (
    <form className="banco-form" onSubmit={handleSubmit}>
      <h3>Asignar Banco</h3>
      <input
        type="text"
        placeholder="Nombre del Banco"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Número de Cuenta"
        value={numeroCuenta}
        onChange={(e) => setNumeroCuenta(e.target.value)}
        required
      />
      <div className="form-actions">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default BancoForm;
