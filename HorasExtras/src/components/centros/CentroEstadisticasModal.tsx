import React from "react";
import * as XLSX from "xlsx";
import type { CentroEstadisticas } from "../../types/centros";
import "../../styles/components/CentroEstadisticasModal.css";

interface Props {
  visible: boolean;
  onClose: () => void;
  data: CentroEstadisticas | null;
}

const CentroEstadisticasModal: React.FC<Props> = ({ visible, onClose, data }) => {
  if (!visible || !data) return null;

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.trabajadores.map(t => ({
      "Nombre del Trabajador": t.nombreTrabajador,
      "Horas Totales": t.totalHoras,
      "Normales": t.horasNormales,
      "Extras Diurnas": t.horasExtrasDiurnas,
      "Extras Nocturnas": t.horasExtrasNocturnas,
      "Dom. Día": t.extrasDominicalesDiurnas,
      "Dom. Noche": t.extrasDominicalesNocturnas,
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");

    XLSX.writeFile(wb, `Estadisticas_${data.centroNombre}.xlsx`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>📊 Estadísticas - {data.centroNombre}</h2>
        <p><strong>ID:</strong> {data.centroId}</p>
        <p><strong>Horario:</strong> {data.horaInicio} - {data.horaFinal}</p>
        <p><strong>Total trabajadores:</strong> {data.totalTrabajadores}</p>
        <p><strong>Mano de obra total:</strong> {data.manoDeObraTotal} horas</p>

        <h3>🧍‍♂️ Detalle por trabajador:</h3>
        <table className="estadisticas-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Horas Totales</th>
              <th>Normales</th>
              <th>ED</th>
              <th>EN</th>
              <th>Dom. Día</th>
              <th>Dom. Noche</th>
            </tr>
          </thead>
          <tbody>
            {data.trabajadores.map(t => (
              <tr key={t.trabajadorId}>
                <td>{t.nombreTrabajador}</td>
                <td>{t.totalHoras}</td>
                <td>{t.horasNormales}</td>
                <td>{t.horasExtrasDiurnas}</td>
                <td>{t.horasExtrasNocturnas}</td>
                <td>{t.extrasDominicalesDiurnas}</td>
                <td>{t.extrasDominicalesNocturnas}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="modal-buttons">
          <button className="btn-exportar" onClick={exportarExcel}>📤 Exportar Excel</button>
          <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default CentroEstadisticasModal;
