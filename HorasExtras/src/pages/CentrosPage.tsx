import React, { useEffect, useState } from "react";
import { centrosService } from "../api/centrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { useNavigate } from "react-router-dom";
import type { Centro } from "../types/centros";
import type { Trabajador } from "../types/trabajadores";
import "../styles/pages/CentrosPage.css";

const CentrosPage: React.FC = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [selectedCentro, setSelectedCentro] = useState<number>(0);
  const [selectedTrabajador, setSelectedTrabajador] = useState<number>(0);
  const navigate = useNavigate();

  const cargarCentros = async () => {
    const data = await centrosService.getAll();
    setCentros(data);
  };

  const cargarTrabajadores = async () => {
    const data = await trabajadoresService.getAll();
    setTrabajadores(data);
  };

  useEffect(() => {
    cargarCentros();
    cargarTrabajadores();
  }, []);

  const handleAsignar = async () => {
    if (selectedCentro === 0 || selectedTrabajador === 0) {
      alert("Seleccione un centro y un trabajador");
      return;
    }
    await centrosService.asignarTrabajador(selectedCentro, selectedTrabajador);
    alert("Trabajador asignado correctamente");
    setSelectedTrabajador(0);
  };

  const handleEliminar = async (id: number) => {
    if (confirm("¿Está seguro de eliminar este centro?")) {
      await centrosService.eliminar(id);
      cargarCentros();
    }
  };

  return (
    <div className="centros-page">
      <h2>Centros de Trabajo</h2>

      <button onClick={() => navigate("/centros/crear")} className="btn-nuevo">
        ➕ Crear Centro
      </button>

      {centros.length === 0 ? (
        <p>No hay centros registrados.</p>
      ) : (
        <table className="centros-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {centros.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nombreCentro}</td>
                <td>
                  <button onClick={() => navigate(`/centros/editar/${c.id}`)}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleEliminar(c.id)}>
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Asignar Trabajador a Centro</h3>
      <div className="asignar-form">
        <select value={selectedCentro} onChange={e => setSelectedCentro(Number(e.target.value))}>
          <option value={0}>Seleccione Centro</option>
          {centros.map(c => (
            <option key={c.id} value={c.id}>{c.nombreCentro}</option>
          ))}
        </select>
        <select value={selectedTrabajador} onChange={e => setSelectedTrabajador(Number(e.target.value))}>
          <option value={0}>Seleccione Trabajador</option>
          {trabajadores.map(t => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        <button onClick={handleAsignar}>Asignar</button>
      </div>
    </div>
  );
};

export default CentrosPage;
