import React from "react";
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
import type { ResumenSemana } from "../../types/ResumenSemana";
import "../../styles/components/ResumenSemana.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  resumen: ResumenSemana;
}

const ResumenSemanaTable: React.FC<Props> = ({ resumen }) => {
  const formatHours = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const getHoursCard = (title: string, hours: number, color: string, icon: string) => {
    return (
      <div className="hours-card" style={{ borderColor: color }}>
        <div className="hours-card-header" style={{ backgroundColor: color }}>
          <span className="hours-icon">{icon}</span>
          <span className="hours-title">{title}</span>
        </div>
        <div className="hours-value">
          {formatHours(hours)}
        </div>
      </div>
    );
  };

  const getChartData = () => {
    return {
      labels: ['Horas Normales', 'Extras Diurnas', 'Extras Nocturnas', 'Dom. Diurnas', 'Dom. Nocturnas'],
      datasets: [
        {
          label: 'Horas',
          data: [
            resumen.horasNormales,
            resumen.extrasDiurnas,
            resumen.extrasNocturnas,
            resumen.extrasDomDiurnas,
            resumen.extrasDomNocturnas
          ],
          backgroundColor: [
            '#27ae60',
            '#f39c12',
            '#8e44ad',
            '#e74c3c',
            '#c0392b'
          ],
          borderColor: [
            '#219a52',
            '#e67e22',
            '#7d3c98',
            '#dc3545',
            '#a93226'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Distribución de Horas de la Semana',
        font: {
          size: 16,
          weight: 600
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const hours = context.parsed.y;
            return `${context.label}: ${formatHours(hours)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: 500
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          font: {
            size: 11,
            weight: 500
          },
          callback: function(value: any) {
            return formatHours(value);
          }
        }
      }
    }
  };

  return (
    <div className="resumen-container">
      <div className="resumen-header">
        <h4>Resumen de Horas - Semana {resumen.semana}</h4>
        <div className="total-badge">
          Total: {formatHours(resumen.total)}
        </div>
      </div>
      
      <div className="hours-grid">
        {getHoursCard("Horas Normales", resumen.horasNormales, "#27ae60", "⏰")}
        {getHoursCard("Extras Diurnas", resumen.extrasDiurnas, "#f39c12", "☀️")}
        {getHoursCard("Extras Nocturnas", resumen.extrasNocturnas, "#8e44ad", "🌙")}
        {getHoursCard("Dom. Diurnas", resumen.extrasDomDiurnas, "#e74c3c", "🌅")}
        {getHoursCard("Dom. Nocturnas", resumen.extrasDomNocturnas, "#c0392b", "🌃")}
      </div>

      <div className="progress-section">
        <h5>Distribución de Horas</h5>
        <div className="chart-container">
          <Bar data={getChartData()} options={chartOptions} height={300} />
        </div>
      </div>

      {/* Tabla tradicional como respaldo */}
      <div className="table-container-backup">
        <table className="resumen-semana-table">
          <thead>
            <tr>
              <th>Semana</th>
              <th>Horas Normales</th>
              <th>Extras Diurnas</th>
              <th>Extras Nocturnas</th>
              <th>Dom. Diurnas</th>
              <th>Dom. Nocturnas</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{resumen.semana}</td>
              <td>{formatHours(resumen.horasNormales)}</td>
              <td>{formatHours(resumen.extrasDiurnas)}</td>
              <td>{formatHours(resumen.extrasNocturnas)}</td>
              <td>{formatHours(resumen.extrasDomDiurnas)}</td>
              <td>{formatHours(resumen.extrasDomNocturnas)}</td>
              <td><strong>{formatHours(resumen.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResumenSemanaTable;