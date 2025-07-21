// src/components/clientes/ClienteForm.tsx
import React, { useState, useEffect } from "react";
import type { Cliente } from "../../types/cliente";

interface Props {
  initialData?: Cliente;
  onSubmit: (cliente: Cliente) => void;
  onCancel: () => void;
}

const ClienteForm: React.FC<Props> = ({ initialData, onSubmit, onCancel }) => {
  const [id, setId] = useState(initialData?.id || "");
  const [nombreCliente, setNombreCliente] = useState(initialData?.nombreCliente || "");

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setNombreCliente(initialData.nombreCliente);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id, nombreCliente });
  };

  return (
    <form onSubmit={handleSubmit} className="cliente-form">
      <label>ID:</label>
      <input
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        disabled={!!initialData}
        required
      />

      <label>Nombre del Cliente:</label>
      <input
        type="text"
        value={nombreCliente}
        onChange={(e) => setNombreCliente(e.target.value)}
        required
      />

      <div className="botones">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default ClienteForm;
