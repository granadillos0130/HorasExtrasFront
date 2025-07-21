// src/pages/ClientesPage.tsx
import React, { useEffect, useState } from "react";
import { clientesService } from "../api/clientesService";
import type { Cliente } from "../types/cliente";
import ClienteCard from "../components/clientes/ClienteCard";
import ClienteForm from "../components/clientes/ClienteForm";
import "../styles/pages/ClientesPage.css"

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modoFormulario, setModoFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const cargarClientes = async () => {
    const data = await clientesService.obtenerTodos();
    setClientes(data);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const manejarCrear = () => {
    setClienteEditando(null);
    setModoFormulario(true);
  };

  const manejarSubmit = async (cliente: Cliente) => {
    try {
      if (clienteEditando) {
        await clientesService.actualizar(cliente.id, cliente);
      } else {
        await clientesService.crear(cliente);
      }
      setModoFormulario(false);
      cargarClientes();
    } catch (error) {
      console.error("Error al guardar cliente", error);
    }
  };

  const manejarEliminar = async (id: string) => {
    if (confirm("¿Seguro que querés eliminar este cliente?")) {
      await clientesService.eliminar(id);
      cargarClientes();
    }
  };

  const manejarEditar = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setModoFormulario(true);
  };

  return (
    <div className="clientes-page">
      <h1>Clientes</h1>
      {modoFormulario ? (
        <ClienteForm
          initialData={clienteEditando ?? undefined}
          onSubmit={manejarSubmit}
          onCancel={() => setModoFormulario(false)}
        />
      ) : (
        <>
          <button onClick={manejarCrear} className="crear-boton">
            Crear nuevo cliente
          </button>
          <div className="clientes-grid">
            {clientes.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                onEditar={manejarEditar}
                onEliminar={manejarEliminar}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientesPage;
