import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { estadisticasService } from "../api/estadisticasService";
import type { Centro, TrabajadorEstadistica } from "../types/estadisticas";
import "../styles/pages/EstadisticasPage.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EstadisticasPage: React.FC = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [centroId, setCentroId] = useState<number>(0);
  const [estadisticas, setEstadisticas] = useState<TrabajadorEstadistica[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    estadisticasService.getCentros().then(setCentros);
  }, []);

  const buscarEstadisticas = async () => {
    if (centroId === 0) {
      alert("Seleccione un centro.");
      return;
    }
    setLoading(true);
    try {
      const data = await estadisticasService.getEstadisticasPorCentro(centroId);
      setEstadisticas(data);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: estadisticas.map(e => e.nombreTrabajador),
    datasets: [
      {
        label: "Total Horas",
        backgroundColor: "#36A2EB",
        data: estadisticas.map(e => e.totalHoras),
      },
      {
        label: "Horas Normales",
        backgroundColor: "#4BC0C0",
        data: estadisticas.map(e => e.horasNormales),
      },
      {
        label: "Horas Extras Diurnas",
        backgroundColor: "#FFCE56",
        data: estadisticas.map(e => e.horasExtrasDiurnas),
      },
      {
        label: "Horas Extras Nocturnas",
        backgroundColor: "#FF6384",
        data: estadisticas.map(e => e.horasExtrasNocturnas),
      },
    ],
  };

  return (
    <div className="estadisticas-page">
      <h2>Estadísticas por Centro</h2>
      <div className="estadisticas-toolbar">
        <select value={centroId} onChange={e => setCentroId(Number(e.target.value))}>
          <option value={0}>Seleccione un centro</option>
          {centros.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombreCentro}
            </option>
          ))}
        </select>
        <button onClick={buscarEstadisticas}>Buscar Estadísticas</button>
      </div>

      {loading && <p>Cargando estadísticas...</p>}

      {estadisticas.length > 0 && (
        <>
          <table className="estadisticas-table">
            <thead>
              <tr>
                <th>Trabajador</th>
                <th>Total Horas</th>
                <th>Horas Normales</th>
                <th>Extras Diurnas</th>
                <th>Extras Nocturnas</th>
                <th>Dom. Diurnas</th>
                <th>Dom. Nocturnas</th>
              </tr>
            </thead>
            <tbody>
              {estadisticas.map(e => (
                <tr key={e.trabajadorId}>
                  <td>{e.nombreTrabajador}</td>
                  <td>{e.totalHoras}</td>
                  <td>{e.horasNormales}</td>
                  <td>{e.horasExtrasDiurnas}</td>
                  <td>{e.horasExtrasNocturnas}</td>
                  <td>{e.extrasDominicalesDiurnas}</td>
                  <td>{e.extrasDominicalesNocturnas}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="estadisticas-chart">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: true, text: "Horas por trabajador" },
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EstadisticasPage;
