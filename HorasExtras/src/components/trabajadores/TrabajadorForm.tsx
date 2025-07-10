// src/components/trabajadores/TrabajadorForm.tsx
import React, { useState } from "react";
import "../../styles/components/TrabajadorForm.css";

interface Props {
  onAdd: (nombre: string) => void;
}

const TrabajadorForm: React.FC<Props> = ({ onAdd }) => {
  const [nombre, setNombre] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim()) {
      onAdd(nombre);
      setNombre("");
    }
  };

  return (
    <form className="trabajador-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre del trabajador"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button type="submit">Agregar</button>
    </form>
  );
};

export default TrabajadorForm;
