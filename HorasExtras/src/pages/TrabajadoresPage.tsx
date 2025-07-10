// src/pages/TrabajadoresPage.tsx
import React, { useState } from "react";
import { useTrabajadores } from "../hooks/useTrabajadores";
import { trabajadoresService } from "../api/trabajadoresService";
import TrabajadorForm from "../components/trabajadores/TrabajadorForm";
import { TrabajadorList } from "../components/trabajadores/TrabajadorList";
import "../styles/pages/TrabajadoresPage.css"

const TrabajadoresPage: React.FC = () => {
  const { trabajadores, loading, error, refetch } = useTrabajadores();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (nombre: string) => {
    setAdding(true);
    try {
      await trabajadoresService.create({ nombre });
      refetch();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este trabajador?")) {
      await trabajadoresService.delete(id);
      refetch();
    }
  };

  return (
    <div className="trabajadores-page">
      <h1>Gestión de Trabajadores</h1>
      <TrabajadorForm onAdd={handleAdd} />
      {adding && <p>Agregando trabajador...</p>}
      {loading && <p>Cargando trabajadores...</p>}
      {error && <p>{error}</p>}
      {!loading && (
        <TrabajadorList trabajadores={trabajadores} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default TrabajadoresPage;
