import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ausenciasService } from "../api/ausenciasService";
import type { Ausencia } from "../types/ausencia";
import "../styles/pages/AusenciasPage.css";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function AusenciasPage() {
  const [anio] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cargarAusencias = async (mes: number) => {
    setMesSeleccionado(mes);
    setLoading(true);
    try {
      const data = await ausenciasService.getPorMes(anio, mes + 1); // +1 porque los meses empiezan en 0
      setAusencias(data);
    } catch (error) {
      console.error("Error al cargar ausencias:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ausencias-container">
      <div className="ausencias-header">
        <h1 className="ausencias-title">Ausencias por Mes - {anio}</h1>
        <button className="crear-ausencia-btn" onClick={() => navigate("/ausencias/nueva")}>
          + Crear Ausencia
        </button>
      </div>

      <div className="meses-grid">
        {meses.map((mes, i) => (
          <button
            key={i}
            className={`mes-btn ${mesSeleccionado === i ? "seleccionado" : ""}`}
            onClick={() => cargarAusencias(i)}
          >
            {mes}
          </button>
        ))}
      </div>

      {mesSeleccionado !== null && (
        <div className="resultado-ausencias">
          <h2 className="ausencias-subtitle">
            Ausencias en {meses[mesSeleccionado]}
          </h2>

          {loading ? (
            <p className="loading-text">Cargando ausencias...</p>
          ) : ausencias.length === 0 ? (
            <p className="no-data-text">
              No hay ausencias registradas en {meses[mesSeleccionado]}.
            </p>
          ) : (
            <table className="ausencias-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Motivo</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Hora Inicio</th>
                  <th>Hora Fin</th>
                </tr>
              </thead>
              <tbody>
                {ausencias.map((a) => (
                  <tr key={a.id}>
                    <td>{a.trabajadorNombre}</td>
                    <td>{a.cargo}</td>
                    <td>{a.motivo}</td>
                    <td>{a.fechaInicio.split("T")[0]}</td>
                    <td>{a.fechaFin.split("T")[0]}</td>
                    <td>{a.horaInicio}</td>
                    <td>{a.horaFin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
