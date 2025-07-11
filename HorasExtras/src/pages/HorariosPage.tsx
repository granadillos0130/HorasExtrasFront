import React, { useEffect, useState } from "react";
import { horariosService } from "../api/horariosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { useNavigate } from "react-router-dom";
import type { Horario } from "../types/horarios";
import type { Trabajador } from "../types/trabajadores";
import "../styles/pages/HorariosPage.css";

const HorariosPage: React.FC = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [filtroTrabajador, setFiltroTrabajador] = useState<number>(0);
  const navigate = useNavigate();

  const cargarTodos = async () => {
  const data = await horariosService.getAll();
  setHorarios(data);
};

const cargarPorTrabajador = async (id: number) => {
  if (id === 0) {
    cargarTodos();
  } else {
    const data = await horariosService.getByTrabajador(id);
    setHorarios(data);
  }
};


  useEffect(() => {
    cargarTodos();
    trabajadoresService.getAll().then(setTrabajadores);
  }, []);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setFiltroTrabajador(id);
    cargarPorTrabajador(id);
  };

  return (
    <div className="horarios-page">
      <h2>Horarios Asignados</h2>

      <div className="horarios-toolbar">
        <button
          className="btn-nuevo"
          onClick={() => navigate("/horarios/crear")}
        >
          ➕ Registrar Horario
        </button>

        <select value={filtroTrabajador} onChange={handleFiltroChange}>
          <option value={0}>Todos los trabajadores</option>
          {trabajadores.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>

      {horarios.length === 0 ? (
        <p>No hay horarios registrados.</p>
      ) : (
        <table className="horarios-table">
          <thead>
            <tr>
              <th>Trabajador</th>
              <th>Día</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
              <th>Intensidad Horaria</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h) => (
              <tr key={h.id}>
                <td>{h.trabajadorNombre}</td>
                <td>{h.dia}</td>
                <td>{h.horaInicio}</td>
                <td>{h.horaFin}</td>
                <td>{h.intensidadHoraria}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HorariosPage;
